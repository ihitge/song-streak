import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import {
  Subdivision,
  MetronomeSoundType,
  UseMetronomeOptions,
  UseMetronomeReturn,
  getBeatsPerMeasure,
  calculateClickInterval,
  BPM_MIN,
  BPM_MAX,
} from '@/types/metronome';
import { useMetronomeSound } from './useMetronomeSound';

/**
 * Tap tempo constants
 */
const MAX_TAP_HISTORY = 8;
const TAP_TIMEOUT_MS = 2000; // Reset if no tap for 2 seconds

/**
 * useMetronome - Core metronome hook with drift-corrected timing
 *
 * Features:
 * - Drift-corrected setTimeout scheduling (not setInterval)
 * - Sound pool for low-latency audio
 * - Tap tempo with averaging
 * - Subdivision support (quarter, eighth, triplet, sixteenth)
 * - Beat position for VU meter pendulum animation
 */
export function useMetronome(options: UseMetronomeOptions = {}): UseMetronomeReturn {
  const {
    initialBpm = 120,
    initialTimeSignature = '4/4',
    initialSubdivision = 1,
    initialSoundType = 'click',
    onBeat,
    onSubdivision,
    onStateChange,
  } = options;

  // State
  const [bpm, setBpmState] = useState(initialBpm);
  const [timeSignature, setTimeSignatureState] = useState(initialTimeSignature);
  const [subdivision, setSubdivisionState] = useState<Subdivision>(initialSubdivision);
  const [soundType, setSoundTypeState] = useState<MetronomeSoundType>(initialSoundType);
  const [currentBeat, setCurrentBeat] = useState(1);
  const [currentSubdivisionTick, setCurrentSubdivisionTick] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  // Refs for timing
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expectedTickTime = useRef(0);
  const tapTimesRef = useRef<number[]>([]);
  const isPlayingRef = useRef(false); // Sync ref for closure access

  // Sound hooks - pass soundType to reload sounds when changed
  const { playAccent, playTick, playSubdivision: playSub, playDrumBeat } = useMetronomeSound({ soundType });

  // Derived values
  const beatsPerMeasure = useMemo(() => getBeatsPerMeasure(timeSignature), [timeSignature]);

  // Beat position maps each beat to its marker position (0 to 1)
  // Beat 1→0, Beat 2→0.33, Beat 3→0.67, Beat 4→1 (for 4/4 time)
  const beatPosition = useMemo(() => {
    return (currentBeat - 1) / Math.max(1, beatsPerMeasure - 1);
  }, [currentBeat, beatsPerMeasure]);

  // Keep ref in sync with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  /**
   * Handle a single tick (either beat or subdivision)
   */
  const handleTick = useCallback(
    (beat: number, subTick: number) => {
      const isDownbeat = beat === 1 && subTick === 1;
      const isBeat = subTick === 1;

      // Update state
      setCurrentBeat(beat);
      setCurrentSubdivisionTick(subTick);

      // Haptic feedback on beats (not subdivisions)
      // Wrap in try-catch to prevent crash on devices with haptics disabled
      if (isBeat) {
        try {
          if (isDownbeat) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        } catch {
          // Haptics may fail on simulator or unsupported devices - ignore
        }
      }

      // Play appropriate sound
      if (isBeat) {
        if (soundType === 'drums') {
          playDrumBeat(beat);
        } else if (isDownbeat) {
          playAccent();
        } else {
          playTick();
        }
        onBeat?.(beat, isDownbeat);
      } else {
        playSub();
        onSubdivision?.(subTick, beat);
      }
    },
    [playAccent, playTick, playSub, playDrumBeat, soundType, onBeat, onSubdivision]
  );

  /**
   * Drift-corrected tick scheduler
   */
  const scheduleTick = useCallback(() => {
    if (!isPlayingRef.current) return;

    const now = performance.now();
    const drift = now - expectedTickTime.current;

    // Get current timing parameters
    const currentBpm = bpm;
    const currentSubdivision = subdivision;
    const currentBeatsPerMeasure = getBeatsPerMeasure(timeSignature);

    // Calculate interval between subdivision ticks
    const tickInterval = calculateClickInterval(currentBpm, currentSubdivision);

    // Schedule next tick, correcting for drift
    expectedTickTime.current += tickInterval;
    const nextDelay = Math.max(0, tickInterval - drift);

    // Calculate current position
    setCurrentSubdivisionTick((prevSubTick) => {
      let newSubTick = prevSubTick + 1;
      let beatChanged = false;

      // If we've completed all subdivisions for this beat
      if (newSubTick > currentSubdivision) {
        newSubTick = 1;
        beatChanged = true;
      }

      // Update beat if subdivision wrapped
      if (beatChanged) {
        setCurrentBeat((prevBeat) => {
          let newBeat = prevBeat + 1;
          if (newBeat > currentBeatsPerMeasure) {
            newBeat = 1;
          }

          // Call handleTick immediately - no setTimeout for precise timing
          handleTick(newBeat, 1);

          return newBeat;
        });
      } else {
        // Just a subdivision tick
        setCurrentBeat((prevBeat) => {
          // Call handleTick immediately - no setTimeout for precise timing
          handleTick(prevBeat, newSubTick);
          return prevBeat;
        });
      }

      return newSubTick;
    });

    // Schedule next tick
    timeoutRef.current = setTimeout(scheduleTick, nextDelay);
  }, [bpm, subdivision, timeSignature, handleTick]);

  /**
   * Start the metronome
   */
  const start = useCallback(() => {
    if (isPlayingRef.current) return;

    // Reset state
    setCurrentBeat(1);
    setCurrentSubdivisionTick(1);
    setIsPlaying(true);
    isPlayingRef.current = true;

    // Initialize timing
    expectedTickTime.current = performance.now();

    // Play first beat immediately
    handleTick(1, 1);

    // Calculate first tick interval
    const tickInterval = calculateClickInterval(bpm, subdivision);
    expectedTickTime.current += tickInterval;

    // Schedule next tick
    timeoutRef.current = setTimeout(scheduleTick, tickInterval);

    onStateChange?.(true);
  }, [bpm, subdivision, handleTick, scheduleTick, onStateChange]);

  /**
   * Stop the metronome
   */
  const stop = useCallback(() => {
    if (!isPlayingRef.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentBeat(1);
    setCurrentSubdivisionTick(1);

    onStateChange?.(false);
  }, [onStateChange]);

  /**
   * Toggle play/stop
   */
  const toggle = useCallback(() => {
    if (isPlayingRef.current) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  /**
   * Set BPM with clamping
   */
  const setBpm = useCallback(
    (newBpm: number) => {
      const clamped = Math.min(BPM_MAX, Math.max(BPM_MIN, Math.round(newBpm)));
      setBpmState(clamped);

      // If playing, the next scheduled tick will use the new BPM
      // No need to restart - drift correction handles the transition
    },
    []
  );

  /**
   * Set time signature
   */
  const setTimeSignature = useCallback(
    (ts: string) => {
      setTimeSignatureState(ts);

      // If playing and current beat is beyond new measure length, reset
      const newBeatsPerMeasure = getBeatsPerMeasure(ts);
      setCurrentBeat((prev) => (prev > newBeatsPerMeasure ? 1 : prev));
    },
    []
  );

  /**
   * Set subdivision
   */
  const setSubdivision = useCallback((sub: Subdivision) => {
    setSubdivisionState(sub);
    setCurrentSubdivisionTick(1);
  }, []);

  /**
   * Set sound type
   */
  const setSoundType = useCallback((type: MetronomeSoundType) => {
    setSoundTypeState(type);
  }, []);

  /**
   * Tap tempo - returns calculated BPM or null if not enough taps
   */
  const tapTempo = useCallback(() => {
    const now = Date.now();
    const taps = tapTimesRef.current;

    // Reset if last tap was too long ago
    if (taps.length > 0 && now - taps[taps.length - 1] > TAP_TIMEOUT_MS) {
      tapTimesRef.current = [];
    }

    taps.push(now);
    tapTimesRef.current = taps;

    // Keep only last N taps
    if (taps.length > MAX_TAP_HISTORY) {
      taps.shift();
    }

    // Need at least 2 taps to calculate
    if (taps.length < 2) {
      return null;
    }

    // Calculate average interval
    const intervals: number[] = [];
    for (let i = 1; i < taps.length; i++) {
      intervals.push(taps[i] - taps[i - 1]);
    }

    const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
    const calculatedBpm = Math.round(60000 / avgInterval);

    // Clamp and set
    const clampedBpm = Math.min(BPM_MAX, Math.max(BPM_MIN, calculatedBpm));
    setBpmState(clampedBpm);

    // Haptic feedback - wrap in try-catch for safety
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics may fail on simulator or unsupported devices - ignore
    }

    return clampedBpm;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Restart metronome when BPM or subdivision changes while playing
  useEffect(() => {
    if (isPlaying) {
      // Clear current timer and restart with new parameters
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Recalculate interval and schedule
      const tickInterval = calculateClickInterval(bpm, subdivision);
      expectedTickTime.current = performance.now() + tickInterval;
      timeoutRef.current = setTimeout(scheduleTick, tickInterval);
    }
  }, [bpm, subdivision, isPlaying, scheduleTick]);

  return {
    // State
    bpm,
    timeSignature,
    subdivision,
    soundType,
    currentBeat,
    currentSubdivision: currentSubdivisionTick,
    isPlaying,
    beatPosition,
    beatsPerMeasure,
    metronomeStartTime: 0, // Legacy hook doesn't support pendulum animation sync

    // Actions
    start,
    stop,
    toggle,
    setBpm,
    setTimeSignature,
    setSubdivision,
    setSoundType,
    tapTempo,
  };
}
