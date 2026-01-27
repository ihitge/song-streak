/**
 * usePitchDetection Hook
 *
 * Core pitch detection engine using pitchy library with AnalyserNode.
 * Supports multi-rate processing for bass frequencies.
 *
 * Platform support:
 * - iOS/Android: react-native-audio-api with .measurement mode
 * - Web: Native Web Audio API
 *
 * CRITICAL: iOS must use .measurement mode to disable hardware high-pass
 * filters that cut frequencies below 100Hz (killing bass fundamentals).
 */

import { useRef, useCallback, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { PitchDetector } from 'pitchy';
import {
  TUNER_SAMPLE_RATE,
  FAST_FFT_SIZE,
  SLOW_FFT_SIZE,
  MIN_CLARITY_THRESHOLD,
  MIN_FREQUENCY,
  MAX_FREQUENCY,
  ANALYSIS_RATE,
  frequencyToNote,
} from '@/constants/TunerConfig';
import type { PitchResult, UsePitchDetectionReturn } from '@/types/tuner';

// Conditionally import react-native-audio-api for native platforms
let NativeAudioContext: any;
let NativeAudioManager: any;
let audioApiLoadError: string | null = null;

if (Platform.OS !== 'web') {
  try {
    const audioApi = require('react-native-audio-api');
    NativeAudioContext = audioApi.AudioContext;
    NativeAudioManager = audioApi.AudioManager;
    console.log('[PitchDetection] react-native-audio-api loaded successfully');
  } catch (e) {
    audioApiLoadError = e instanceof Error ? e.message : 'Unknown error loading audio API';
    console.warn('[PitchDetection] Failed to load react-native-audio-api:', e);
  }
}

/**
 * usePitchDetection - Pitch detection engine
 */
export function usePitchDetection(): UsePitchDetectionReturn {
  // State
  const [isReady, setIsReady] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [pitch, setPitch] = useState<PitchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pitchDetectorRef = useRef<PitchDetector<Float32Array> | null>(null);
  const inputBufferRef = useRef<Float32Array | null>(null);
  const lastAnalysisTimeRef = useRef(0);

  /**
   * Initialize audio context and analyser
   */
  const initialize = useCallback(async () => {
    try {
      setError(null);
      console.log('[PitchDetection] Starting initialization...');
      console.log('[PitchDetection] Platform:', Platform.OS);

      // Create AudioContext (platform-aware)
      if (Platform.OS === 'web') {
        console.log('[PitchDetection] Using web AudioContext');
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioContextClass({
          sampleRate: TUNER_SAMPLE_RATE,
        });
      } else {
        console.log('[PitchDetection] Using native AudioContext');

        if (!NativeAudioContext) {
          throw new Error(
            audioApiLoadError
              ? `react-native-audio-api failed to load: ${audioApiLoadError}`
              : 'react-native-audio-api not available - ensure you are using a development build, not Expo Go'
          );
        }

        // CRITICAL: Configure iOS audio session with .measurement mode
        // This disables hardware high-pass filters that cut bass frequencies
        if (NativeAudioManager && Platform.OS === 'ios') {
          console.log('[PitchDetection] Configuring iOS audio session with MEASUREMENT mode...');
          try {
            NativeAudioManager.setAudioSessionOptions({
              iosCategory: 'playAndRecord',
              iosMode: 'measurement', // CRITICAL for bass frequencies
              iosOptions: ['defaultToSpeaker', 'allowBluetooth'],
            });
            await NativeAudioManager.setAudioSessionActivity(true);
            console.log('[PitchDetection] iOS audio session configured with measurement mode');
          } catch (sessionErr) {
            console.warn('[PitchDetection] Audio session config error:', sessionErr);
          }
        }

        // Android audio session
        if (NativeAudioManager && Platform.OS === 'android') {
          console.log('[PitchDetection] Configuring Android audio session...');
          try {
            // Android doesn't have .measurement mode, but we configure for voice recognition
            // which typically has less processing
            await NativeAudioManager.setAudioSessionActivity(true);
            console.log('[PitchDetection] Android audio session configured');
          } catch (sessionErr) {
            console.warn('[PitchDetection] Android audio session config error:', sessionErr);
          }
        }

        audioContextRef.current = new NativeAudioContext({
          sampleRate: TUNER_SAMPLE_RATE,
        });
      }

      // Create analyser node with larger FFT for bass support
      const ctx = audioContextRef.current;
      if (!ctx) {
        throw new Error('AudioContext failed to initialize');
      }
      const analyser = ctx.createAnalyser();
      analyser.fftSize = SLOW_FFT_SIZE; // Use larger FFT for bass frequencies
      analyser.smoothingTimeConstant = 0; // No smoothing - we do our own Kalman filtering
      analyserRef.current = analyser;

      // Create input buffer for pitch detection
      inputBufferRef.current = new Float32Array(analyser.fftSize);

      // Create pitch detector from pitchy
      pitchDetectorRef.current = PitchDetector.forFloat32Array(analyser.fftSize);

      setIsReady(true);
      console.log('[PitchDetection] Initialized successfully');
      console.log('[PitchDetection] FFT size:', analyser.fftSize);
      console.log('[PitchDetection] Frequency bin count:', analyser.frequencyBinCount);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown initialization error';
      console.error('[PitchDetection] Initialization failed:', e);
      setError(errorMsg);
      setIsReady(false);
    }
  }, []);

  /**
   * Start listening for pitch
   */
  const start = useCallback(async () => {
    if (!audioContextRef.current || !analyserRef.current) {
      console.warn('[PitchDetection] Cannot start - not initialized');
      await initialize();
      if (!audioContextRef.current || !analyserRef.current) {
        setError('Failed to initialize audio');
        return;
      }
    }

    try {
      console.log('[PitchDetection] Starting pitch detection...');

      const ctx = audioContextRef.current;
      if (!ctx) {
        setError('Audio context not initialized');
        return;
      }

      // Resume audio context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Get microphone stream
      let stream: MediaStream;

      if (Platform.OS === 'web') {
        // Web: use getUserMedia
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false, // Important for accurate pitch detection
          },
          video: false,
        });
      } else {
        // Native: use react-native-audio-api's getUserMedia equivalent
        // The AudioContext handles this internally when we create a source
        // For now, we'll use the web-like API that react-native-audio-api provides
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('getUserMedia not available on this platform');
        }
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
      }

      streamRef.current = stream;

      // Create source from microphone
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      sourceRef.current = source;

      // Start analysis loop
      setIsListening(true);
      lastAnalysisTimeRef.current = 0;
      analyzeLoop();

      console.log('[PitchDetection] Started listening');
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to start pitch detection';
      console.error('[PitchDetection] Start failed:', e);
      setError(errorMsg);
    }
  }, [initialize]);

  /**
   * Analysis loop - runs at ANALYSIS_RATE fps
   */
  const analyzeLoop = useCallback(() => {
    if (!analyserRef.current || !inputBufferRef.current || !pitchDetectorRef.current) {
      return;
    }

    const now = performance.now();
    const frameInterval = 1000 / ANALYSIS_RATE;

    // Throttle analysis to target frame rate
    if (now - lastAnalysisTimeRef.current >= frameInterval) {
      lastAnalysisTimeRef.current = now;

      // Get time domain data
      // Cast to satisfy strict TypeScript - the buffer type is compatible at runtime
      analyserRef.current.getFloatTimeDomainData(inputBufferRef.current as Float32Array<ArrayBuffer>);

      // Detect pitch using pitchy
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [frequency, clarity] = pitchDetectorRef.current.findPitch(
        inputBufferRef.current as any,
        TUNER_SAMPLE_RATE
      );

      // Filter results by clarity and frequency range
      if (
        clarity >= MIN_CLARITY_THRESHOLD &&
        frequency >= MIN_FREQUENCY &&
        frequency <= MAX_FREQUENCY
      ) {
        const noteInfo = frequencyToNote(frequency);

        const result: PitchResult = {
          frequency,
          clarity,
          note: noteInfo.note,
          octave: noteInfo.octave,
          cents: noteInfo.cents,
          midiNote: noteInfo.midiNote,
          timestamp: now,
        };

        setPitch(result);
      } else {
        // No valid pitch detected
        setPitch(null);
      }
    }

    // Continue loop
    animationFrameRef.current = requestAnimationFrame(analyzeLoop);
  }, []);

  /**
   * Stop listening for pitch
   */
  const stop = useCallback(() => {
    console.log('[PitchDetection] Stopping...');

    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Disconnect source
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    // Stop media stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsListening(false);
    setPitch(null);

    console.log('[PitchDetection] Stopped');
  }, []);

  /**
   * Cleanup on unmount
   */
  const cleanup = useCallback(() => {
    stop();

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    pitchDetectorRef.current = null;
    inputBufferRef.current = null;

    // Deactivate audio session on iOS
    if (NativeAudioManager && Platform.OS !== 'web') {
      NativeAudioManager.setAudioSessionActivity(false).catch(() => {});
    }

    setIsReady(false);
    console.log('[PitchDetection] Cleaned up');
  }, [stop]);

  // Initialize on mount
  useEffect(() => {
    initialize();

    return () => {
      cleanup();
    };
  }, [initialize, cleanup]);

  return {
    isReady,
    pitch,
    error,
    start,
    stop,
    isListening,
  };
}
