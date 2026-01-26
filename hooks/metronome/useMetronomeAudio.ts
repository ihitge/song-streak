/**
 * useMetronomeAudio Hook
 *
 * Audio engine for sample-accurate metronome timing using the Web Audio API
 * lookahead scheduling pattern. This is the core of professional-grade timing.
 *
 * WHY LOOKAHEAD SCHEDULING?
 * Standard JavaScript timers (setTimeout/setInterval) have 50-100ms jitter
 * due to the event loop. The Web Audio API runs on a separate high-priority
 * thread and can schedule audio with sample accuracy.
 *
 * THE PATTERN:
 * 1. Use audioContext.currentTime as the master clock (never Date.now())
 * 2. Schedule beats 100ms into the future (lookahead window)
 * 3. Run a scheduler check every 25ms to queue upcoming beats
 * 4. Audio hardware maintains queue - immune to main thread hiccups
 *
 * Platform support:
 * - iOS/Android: react-native-audio-api
 * - Web: Native Web Audio API
 */

import { useRef, useCallback, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { Asset } from 'expo-asset';
import { METRONOME_CONFIG, AUDIO_SAMPLE_RATE } from '@/constants/MetronomeConfig';
import type { UseMetronomeAudioReturn } from '@/types/metronome';

// Conditionally import react-native-audio-api for native platforms
let NativeAudioContext: any;
let NativeAudioManager: any;

if (Platform.OS !== 'web') {
  try {
    const audioApi = require('react-native-audio-api');
    NativeAudioContext = audioApi.AudioContext;
    NativeAudioManager = audioApi.AudioManager;
  } catch (e) {
    console.warn('[MetronomeAudio] Failed to load react-native-audio-api:', e);
  }
}

// Audio asset imports for bundled WAV files
const ACCENT_CLICK_ASSET = require('@/assets/audio/metronome-click-accent.wav');
const TICK_CLICK_ASSET = require('@/assets/audio/metronome-click-tick.wav');

/**
 * useMetronomeAudio - Audio engine with lookahead scheduling
 */
export function useMetronomeAudio(): UseMetronomeAudioReturn {
  // State
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for audio context and buffers
  const audioContextRef = useRef<AudioContext | null>(null);
  const accentBufferRef = useRef<AudioBuffer | null>(null);
  const tickBufferRef = useRef<AudioBuffer | null>(null);

  // Scheduling refs
  const isPlayingRef = useRef(false);
  const schedulerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextBeatTimeRef = useRef(0);
  const currentBeatRef = useRef(0);
  const bpmRef = useRef(METRONOME_CONFIG.bpmDefault);
  const onBeatCallbackRef = useRef<((beatIndex: number, isAccent: boolean) => void) | null>(null);

  /**
   * Load audio buffer from asset (platform-aware)
   */
  const loadAudioBuffer = useCallback(
    async (asset: any): Promise<AudioBuffer | null> => {
      if (!audioContextRef.current) return null;

      try {
        // For Expo assets, we need to load them first
        const [loadedAsset] = await Asset.loadAsync(asset);

        if (Platform.OS === 'web') {
          // Web: Fetch and decode
          const response = await fetch(loadedAsset.uri);
          const arrayBuffer = await response.arrayBuffer();
          return await audioContextRef.current.decodeAudioData(arrayBuffer);
        } else {
          // Native: Use localUri
          const uri = loadedAsset.localUri || loadedAsset.uri;
          const response = await fetch(uri);
          const arrayBuffer = await response.arrayBuffer();
          return await audioContextRef.current.decodeAudioData(arrayBuffer);
        }
      } catch (e) {
        console.error('[MetronomeAudio] Failed to load audio buffer:', e);
        return null;
      }
    },
    []
  );

  /**
   * Initialize audio context and load buffers
   */
  const initialize = useCallback(async () => {
    try {
      setError(null);

      // Create AudioContext (platform-aware)
      if (Platform.OS === 'web') {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioContextClass({
          sampleRate: AUDIO_SAMPLE_RATE,
        });
      } else {
        if (!NativeAudioContext) {
          throw new Error('react-native-audio-api not available');
        }

        // Configure iOS audio session for mixing with other audio
        if (NativeAudioManager && Platform.OS === 'ios') {
          try {
            NativeAudioManager.setAudioSessionOptions({
              iosCategory: 'playback',
              iosMode: 'default',
              iosOptions: ['mixWithOthers', 'defaultToSpeaker'],
            });
            await NativeAudioManager.setAudioSessionActivity(true);
          } catch (sessionErr) {
            console.warn('[MetronomeAudio] Audio session config error:', sessionErr);
          }
        }

        audioContextRef.current = new NativeAudioContext({
          sampleRate: AUDIO_SAMPLE_RATE,
        });
      }

      // Load click sound buffers
      const [accentBuffer, tickBuffer] = await Promise.all([
        loadAudioBuffer(ACCENT_CLICK_ASSET),
        loadAudioBuffer(TICK_CLICK_ASSET),
      ]);

      if (!accentBuffer || !tickBuffer) {
        throw new Error('Failed to load click sound buffers');
      }

      accentBufferRef.current = accentBuffer;
      tickBufferRef.current = tickBuffer;

      setIsReady(true);
      console.log('[MetronomeAudio] Initialized successfully');
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown initialization error';
      console.error('[MetronomeAudio] Initialization failed:', e);
      setError(errorMsg);
      setIsReady(false);
    }
  }, [loadAudioBuffer]);

  /**
   * Schedule a click at the specified time
   */
  const scheduleClick = useCallback((time: number, isAccent: boolean) => {
    const ctx = audioContextRef.current;
    const buffer = isAccent ? accentBufferRef.current : tickBufferRef.current;

    if (!ctx || !buffer) return;

    // Create and configure buffer source
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    // Schedule the click at the precise time
    source.start(time);
  }, []);

  /**
   * The scheduler loop - heart of lookahead scheduling
   *
   * This runs every SCHEDULER_INTERVAL ms and schedules any beats
   * that fall within the LOOKAHEAD window. Even if the main thread
   * hangs, pre-scheduled beats will play on time.
   */
  const scheduler = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx || !isPlayingRef.current) return;

    const lookaheadEnd = ctx.currentTime + METRONOME_CONFIG.lookaheadMs / 1000;

    // Schedule all beats that fall within the lookahead window
    while (nextBeatTimeRef.current < lookaheadEnd) {
      const beatTime = nextBeatTimeRef.current;
      const beatIndex = currentBeatRef.current;
      const isAccent = beatIndex === 0;

      // Schedule the audio click
      scheduleClick(beatTime, isAccent);

      // Schedule the callback for visual/haptic sync
      // Calculate delay from now to beat time
      const delayMs = Math.max(0, (beatTime - ctx.currentTime) * 1000);
      setTimeout(() => {
        if (isPlayingRef.current && onBeatCallbackRef.current) {
          onBeatCallbackRef.current(beatIndex, isAccent);
        }
      }, delayMs);

      // Advance to next beat
      const secondsPerBeat = 60 / bpmRef.current;
      nextBeatTimeRef.current += secondsPerBeat;
      currentBeatRef.current = (currentBeatRef.current + 1) % 4; // 4/4 time for MVP
    }

    // Schedule next scheduler run
    schedulerTimerRef.current = setTimeout(scheduler, METRONOME_CONFIG.schedulerIntervalMs);
  }, [scheduleClick]);

  /**
   * Start metronome playback
   */
  const start = useCallback(
    (bpm: number, onBeat: (beatIndex: number, isAccent: boolean) => void) => {
      const ctx = audioContextRef.current;
      if (!ctx || !isReady) {
        console.warn('[MetronomeAudio] Cannot start - not initialized');
        return;
      }

      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Store callback and BPM
      onBeatCallbackRef.current = onBeat;
      bpmRef.current = bpm;

      // Reset beat tracking
      currentBeatRef.current = 0;

      // Schedule first beat slightly in the future (50ms)
      nextBeatTimeRef.current = ctx.currentTime + 0.05;

      // Start scheduler
      isPlayingRef.current = true;
      scheduler();

      console.log('[MetronomeAudio] Started at', bpm, 'BPM');
    },
    [isReady, scheduler]
  );

  /**
   * Stop metronome playback
   */
  const stop = useCallback(() => {
    isPlayingRef.current = false;

    if (schedulerTimerRef.current) {
      clearTimeout(schedulerTimerRef.current);
      schedulerTimerRef.current = null;
    }

    onBeatCallbackRef.current = null;
    console.log('[MetronomeAudio] Stopped');
  }, []);

  /**
   * Update BPM during playback (seamless transition)
   */
  const updateBpm = useCallback((bpm: number) => {
    bpmRef.current = Math.max(
      METRONOME_CONFIG.bpmMin,
      Math.min(METRONOME_CONFIG.bpmMax, bpm)
    );
  }, []);

  /**
   * Cleanup resources
   */
  const cleanup = useCallback(() => {
    stop();

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    accentBufferRef.current = null;
    tickBufferRef.current = null;
    setIsReady(false);

    // Deactivate iOS audio session
    if (NativeAudioManager && Platform.OS === 'ios') {
      NativeAudioManager.setAudioSessionActivity(false).catch(() => {});
    }

    console.log('[MetronomeAudio] Cleaned up');
  }, [stop]);

  // Note: We intentionally don't auto-cleanup on unmount here.
  // The parent component (useMetronome) handles cleanup explicitly.
  // This avoids issues with React Strict Mode double-mounting where
  // cleanup would fire between mount cycles, leaving the audio
  // uninitialized on the second mount.

  return {
    isReady,
    error,
    start,
    stop,
    updateBpm,
    initialize,
    cleanup,
  };
}
