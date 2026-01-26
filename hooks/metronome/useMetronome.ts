/**
 * useMetronome Hook
 *
 * Main orchestration hook for the metronome feature.
 * Coordinates audio engine, tap tempo, visual sync, and haptic feedback.
 *
 * State machine:
 * - idle: Stopped, ready to play
 * - playing: Active with lookahead scheduling
 * - stopping: Graceful shutdown (not currently used, reserved for future)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useMetronomeAudio } from './useMetronomeAudio';
import { useTapTempo } from './useTapTempo';
import { METRONOME_CONFIG, PENDULUM_MAX_ANGLE } from '@/constants/MetronomeConfig';
import type { MetronomeState, UseMetronomeReturn } from '@/types/metronome';

/**
 * useMetronome - Main metronome hook
 */
export function useMetronome(): UseMetronomeReturn {
  // Core state
  const [state, setState] = useState<MetronomeState>('idle');
  const [bpm, setBpmState] = useState(METRONOME_CONFIG.bpmDefault);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [pendulumAngle, setPendulumAngle] = useState(0);

  // Audio engine
  const audioEngine = useMetronomeAudio();

  // Tap tempo
  const tapTempo = useTapTempo();

  // Pendulum animation ref for cleanup
  const pendulumAnimationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track if initialized
  const isInitializedRef = useRef(false);

  // Derived state
  const isPlaying = state === 'playing';

  /**
   * Initialize audio engine on mount
   */
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      audioEngine.initialize();
    }
  }, [audioEngine.initialize]);

  /**
   * Handle beat callback from audio engine
   * Triggers haptic feedback and updates visual state
   */
  const handleBeat = useCallback((beatIndex: number, isAccent: boolean) => {
    // Update beat counter for visual sync
    setCurrentBeat(beatIndex);

    // Haptic feedback: Heavy on downbeat, Light on others
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(
        isAccent
          ? Haptics.ImpactFeedbackStyle.Heavy
          : Haptics.ImpactFeedbackStyle.Light
      ).catch(() => {
        // Ignore haptic errors
      });
    }
  }, []);

  /**
   * Start pendulum animation
   * Swings smoothly between -PENDULUM_MAX_ANGLE and +PENDULUM_MAX_ANGLE
   */
  const startPendulumAnimation = useCallback(() => {
    // Clear any existing animation
    if (pendulumAnimationRef.current) {
      clearInterval(pendulumAnimationRef.current);
    }

    const beatDurationMs = (60 / bpm) * 1000;
    const updateIntervalMs = 16; // ~60fps
    let elapsed = 0;

    pendulumAnimationRef.current = setInterval(() => {
      elapsed += updateIntervalMs;

      // Sinusoidal motion: one full swing per beat
      // Phase shifted so pendulum is at center when beat hits
      const phase = ((elapsed % beatDurationMs) / beatDurationMs) * Math.PI * 2;
      const angle = Math.sin(phase) * PENDULUM_MAX_ANGLE;

      setPendulumAngle(angle);
    }, updateIntervalMs);
  }, [bpm]);

  /**
   * Stop pendulum animation
   */
  const stopPendulumAnimation = useCallback(() => {
    if (pendulumAnimationRef.current) {
      clearInterval(pendulumAnimationRef.current);
      pendulumAnimationRef.current = null;
    }
    setPendulumAngle(0);
  }, []);

  /**
   * Start the metronome
   */
  const start = useCallback(async () => {
    if (!audioEngine.isReady) {
      console.warn('[Metronome] Audio engine not ready');
      return;
    }

    // Keep screen awake during practice (native only - web not supported)
    if (Platform.OS !== 'web') {
      try {
        await activateKeepAwakeAsync();
      } catch (e) {
        console.warn('[Metronome] Failed to activate keep awake:', e);
      }
    }

    // Reset state
    setCurrentBeat(0);
    tapTempo.reset();

    // Start audio engine
    audioEngine.start(bpm, handleBeat);

    // Start pendulum animation
    startPendulumAnimation();

    setState('playing');
    console.log('[Metronome] Started at', bpm, 'BPM');
  }, [audioEngine, bpm, handleBeat, startPendulumAnimation, tapTempo]);

  /**
   * Stop the metronome
   */
  const stop = useCallback(() => {
    audioEngine.stop();
    stopPendulumAnimation();

    // Allow screen to dim (skip on web - not supported)
    if (Platform.OS !== 'web') {
      try {
        deactivateKeepAwake();
      } catch (e) {
        // Ignore - may not have been activated
      }
    }

    setCurrentBeat(0);
    setState('idle');
    console.log('[Metronome] Stopped');
  }, [audioEngine, stopPendulumAnimation]);

  /**
   * Toggle play/stop
   */
  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  }, [isPlaying, start, stop]);

  /**
   * Set BPM directly
   */
  const setBpm = useCallback(
    (newBpm: number) => {
      const clampedBpm = Math.max(
        METRONOME_CONFIG.bpmMin,
        Math.min(METRONOME_CONFIG.bpmMax, newBpm)
      );
      setBpmState(clampedBpm);

      // Update audio engine if playing
      if (isPlaying) {
        audioEngine.updateBpm(clampedBpm);
      }
    },
    [audioEngine, isPlaying]
  );

  /**
   * Increment/decrement BPM
   */
  const incrementBpm = useCallback(
    (delta: number) => {
      setBpm(bpm + delta);
    },
    [bpm, setBpm]
  );

  /**
   * Handle tap tempo
   */
  const handleTapTempo = useCallback(() => {
    // Provide haptic feedback for tap
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }

    const newBpm = tapTempo.handleTap();
    if (newBpm !== null) {
      setBpm(newBpm);
    }
  }, [tapTempo, setBpm]);

  /**
   * Update pendulum animation when BPM changes during playback
   */
  useEffect(() => {
    if (isPlaying) {
      startPendulumAnimation();
    }
  }, [bpm, isPlaying, startPendulumAnimation]);

  /**
   * Cleanup on unmount
   * Note: We don't call audioEngine.cleanup() here because React Strict Mode
   * in development causes double mount/unmount cycles. The AudioContext will
   * be garbage collected when the component tree is truly unmounted.
   * Pendulum animation cleanup is safe to do on every unmount.
   */
  useEffect(() => {
    return () => {
      stopPendulumAnimation();
      // Skip keep-awake cleanup on web - not supported
      if (Platform.OS !== 'web') {
        try {
          deactivateKeepAwake();
        } catch (e) {
          // Ignore - may not have been activated
        }
      }
    };
  }, [stopPendulumAnimation]);

  return {
    // State
    state,
    bpm,
    isPlaying,
    currentBeat,
    pendulumAngle,

    // Actions
    start,
    stop,
    toggle,
    setBpm,
    incrementBpm,
    handleTapTempo,

    // Status
    tapCount: tapTempo.tapCount,
    isAudioReady: audioEngine.isReady,
    audioError: audioEngine.error,
  };
}
