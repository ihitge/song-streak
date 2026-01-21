import { useEffect, useRef, useCallback, useState } from 'react';
import { Platform, Image } from 'react-native';
import { MetronomeSoundType } from '@/types/metronome';
import type {
  AudioContextType,
  AudioBufferType,
  GainNodeType,
  MetronomeAudioBuffers,
} from '@/types/audio';

// Conditional import for react-native-audio-api (native only)
// On web, the .web.ts version of this file is used instead
let AudioContext: new () => AudioContextType;

if (Platform.OS !== 'web') {
  const audioApi = require('react-native-audio-api');
  AudioContext = audioApi.AudioContext;
}

// Audio asset imports for bundler
const clickAccent = require('@/assets/audio/sound-click-04.wav');
const clickTick = require('@/assets/audio/sound-click-05.wav');
const clickSubdiv = require('@/assets/audio/sound-click-06.wav');
const snareSound = require('@/assets/audio/metronome-snare.wav');
const kickSound = require('@/assets/audio/metronome-kick.wav');
const hihatSound = require('@/assets/audio/metronome-hihat.wav');

interface UseMetronomeSoundOptions {
  soundType?: MetronomeSoundType;
}

interface UseMetronomeSoundReturn {
  audioContext: AudioContextType | null;
  isLoaded: boolean;
  scheduleSound: (
    type: 'accent' | 'tick' | 'subdivision',
    time: number,
    soundType: MetronomeSoundType
  ) => void;
  scheduleDrumBeat: (beat: number, time: number) => void;
  // Legacy API for compatibility (fires immediately)
  playAccent: () => void;
  playTick: () => void;
  playSubdivision: () => void;
  playDrumBeat: (beat: number) => void;
}

/**
 * Get the asset URI for a sound file (Native version)
 */
function getAssetUri(asset: number): string {
  const resolved = Image.resolveAssetSource(asset);
  return resolved?.uri || '';
}

/**
 * Load an audio file into an AudioBuffer (Native version)
 */
async function loadAudioBuffer(
  audioContext: AudioContextType,
  asset: number
): Promise<AudioBufferType | null> {
  try {
    const uri = getAssetUri(asset);
    if (!uri) {
      console.warn('Failed to resolve asset URI');
      return null;
    }

    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
  } catch (error) {
    console.error('Failed to load audio buffer:', error);
    return null;
  }
}

/**
 * Hook for metronome sound playback using react-native-audio-api (Native version)
 *
 * Uses AudioContext for precise, hardware-scheduled audio timing.
 * Sounds can be scheduled ahead of time using audioContext.currentTime + offset.
 *
 * Note: On web, the .web.ts version of this file is used which uses the browser's
 * native Web Audio API directly.
 */
export function useMetronomeSound(
  options: UseMetronomeSoundOptions = {}
): UseMetronomeSoundReturn {
  const { soundType = 'click' } = options;

  const audioContextRef = useRef<AudioContextType | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContextType | null>(null);
  const buffersRef = useRef<MetronomeAudioBuffers>({
    clickAccent: null,
    clickTick: null,
    clickSubdiv: null,
    snare: null,
    kick: null,
    hihat: null,
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const isLoadingRef = useRef(false);
  const masterGainRef = useRef<GainNodeType | null>(null);

  /**
   * Initialize AudioContext and load all sound buffers
   */
  useEffect(() => {
    // Skip initialization on web (handled by .web.ts version)
    if (Platform.OS === 'web') return;

    let mounted = true;

    const init = async () => {
      if (isLoadingRef.current || isLoaded) return;
      isLoadingRef.current = true;

      try {
        // Create AudioContext
        const ctx = new AudioContext();
        audioContextRef.current = ctx;
        setAudioContext(ctx);

        // Create master gain node
        const masterGain = ctx.createGain();
        masterGain.gain.value = 1.0;
        masterGain.connect(ctx.destination);
        masterGainRef.current = masterGain;

        if (!mounted) return;

        // Load all audio buffers in parallel
        const [accent, tick, subdiv, snare, kick, hihat] = await Promise.all([
          loadAudioBuffer(ctx, clickAccent),
          loadAudioBuffer(ctx, clickTick),
          loadAudioBuffer(ctx, clickSubdiv),
          loadAudioBuffer(ctx, snareSound),
          loadAudioBuffer(ctx, kickSound),
          loadAudioBuffer(ctx, hihatSound),
        ]);

        if (!mounted) return;

        buffersRef.current = {
          clickAccent: accent,
          clickTick: tick,
          clickSubdiv: subdiv,
          snare,
          kick,
          hihat,
        };

        setIsLoaded(true);
        console.log('[Metronome Native] Audio buffers loaded successfully');
      } catch (error) {
        console.error('[Metronome Native] Failed to initialize audio:', error);
      } finally {
        isLoadingRef.current = false;
      }
    };

    init();

    return () => {
      mounted = false;
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {
          // Ignore close errors
        }
        audioContextRef.current = null;
      }
    };
  }, []);

  /**
   * Get the appropriate buffer for a sound type and role
   */
  const getBuffer = useCallback(
    (role: 'accent' | 'tick' | 'subdivision', type: MetronomeSoundType): AudioBufferType | null => {
      const buffers = buffersRef.current;

      // For drums mode, role determines which instrument
      if (type === 'drums') {
        switch (role) {
          case 'accent':
            return buffers.kick;
          case 'tick':
            return buffers.snare;
          case 'subdivision':
            return buffers.hihat;
        }
      }

      // For other modes, use the selected sound type
      switch (type) {
        case 'click':
          // Use same tick sound for all beats (no accent on beat 1)
          return role === 'subdivision'
            ? buffers.clickSubdiv
            : buffers.clickTick;
        case 'snare':
          return buffers.snare;
        case 'bass':
          return buffers.kick;
        case 'hihat':
          return buffers.hihat;
        default:
          return buffers.clickTick;
      }
    },
    []
  );

  /**
   * Schedule a sound to play at a precise time
   * This is the core of the lookahead scheduler pattern
   */
  const scheduleSound = useCallback(
    (
      role: 'accent' | 'tick' | 'subdivision',
      time: number,
      type: MetronomeSoundType
    ) => {
      const ctx = audioContextRef.current;
      const masterGain = masterGainRef.current;
      if (!ctx || !masterGain) return;

      const buffer = getBuffer(role, type);
      if (!buffer) return;

      try {
        // Create a new source node (required - sources can only start once)
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(masterGain);

        // Schedule playback at the exact time
        // The Web Audio API handles this with hardware-level precision
        source.start(time);
      } catch (error) {
        // Silently ignore scheduling errors
      }
    },
    [getBuffer]
  );

  /**
   * Schedule a drum beat (kick + hihat or snare + hihat)
   */
  const scheduleDrumBeat = useCallback((beat: number, time: number) => {
    const ctx = audioContextRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain) return;

    const buffers = buffersRef.current;

    try {
      // Always play hi-hat
      if (buffers.hihat) {
        const hihatSource = ctx.createBufferSource();
        hihatSource.buffer = buffers.hihat;
        hihatSource.connect(masterGain);
        hihatSource.start(time);
      }

      // Kick on beats 1 & 3, Snare on beats 2 & 4
      if (beat === 1 || beat === 3) {
        if (buffers.kick) {
          const kickSource = ctx.createBufferSource();
          kickSource.buffer = buffers.kick;
          kickSource.connect(masterGain);
          kickSource.start(time);
        }
      } else if (beat === 2 || beat === 4) {
        if (buffers.snare) {
          const snareSource = ctx.createBufferSource();
          snareSource.buffer = buffers.snare;
          snareSource.connect(masterGain);
          snareSource.start(time);
        }
      }
    } catch (error) {
      // Silently ignore scheduling errors
    }
  }, []);

  /**
   * Legacy API: Play accent immediately
   */
  const playAccent = useCallback(() => {
    const ctx = audioContextRef.current;
    if (ctx) {
      scheduleSound('accent', ctx.currentTime, soundType);
    }
  }, [soundType, scheduleSound]);

  /**
   * Legacy API: Play tick immediately
   */
  const playTick = useCallback(() => {
    const ctx = audioContextRef.current;
    if (ctx) {
      scheduleSound('tick', ctx.currentTime, soundType);
    }
  }, [soundType, scheduleSound]);

  /**
   * Legacy API: Play subdivision immediately
   */
  const playSubdivision = useCallback(() => {
    const ctx = audioContextRef.current;
    if (ctx) {
      scheduleSound('subdivision', ctx.currentTime, soundType);
    }
  }, [soundType, scheduleSound]);

  /**
   * Legacy API: Play drum beat immediately
   */
  const playDrumBeat = useCallback(
    (beat: number) => {
      const ctx = audioContextRef.current;
      if (ctx) {
        scheduleDrumBeat(beat, ctx.currentTime);
      }
    },
    [scheduleDrumBeat]
  );

  return {
    audioContext,
    isLoaded,
    scheduleSound,
    scheduleDrumBeat,
    // Legacy API
    playAccent,
    playTick,
    playSubdivision,
    playDrumBeat,
  };
}
