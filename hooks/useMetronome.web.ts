import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  Subdivision,
  MetronomeSoundType,
  UseMetronomeOptions,
  UseMetronomeReturn,
  getBeatsPerMeasure,
  BPM_MIN,
  BPM_MAX,
} from '@/types/metronome';
import type { AudioContextType } from '@/types/audio';
import { useMetronomeSound } from './useMetronomeSound';

/**
 * Lookahead scheduler constants
 * Based on Chris Wilson's "A Tale of Two Clocks" pattern
 */
const LOOKAHEAD_TIME = 0.1; // How far ahead to schedule audio (seconds)
const SCHEDULER_INTERVAL = 25; // How often to call scheduler (ms)

/**
 * Tap tempo constants
 */
const MAX_TAP_HISTORY = 8;
const TAP_TIMEOUT_MS = 2000;

/**
 * Scheduled note for the queue
 */
interface ScheduledNote {
  time: number; // AudioContext time
  beat: number; // 1-indexed beat number
  subdivision: number; // 1-indexed subdivision within beat
  isDownbeat: boolean;
  isBeat: boolean; // true if this is a beat (not just subdivision)
}

/**
 * useMetronome - Core metronome hook with lookahead scheduling (Web version)
 *
 * Uses the browser's native Web Audio API for sample-accurate playback.
 * JavaScript timers only "wake up" the scheduler; actual audio timing is handled
 * by the audio hardware clock.
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

  // State (for UI updates)
  const [bpm, setBpmState] = useState(initialBpm);
  const [timeSignature, setTimeSignatureState] = useState(initialTimeSignature);
  const [subdivision, setSubdivisionState] = useState<Subdivision>(initialSubdivision);
  const [soundType, setSoundTypeState] = useState<MetronomeSoundType>(initialSoundType);
  const [currentBeat, setCurrentBeat] = useState(1);
  const [currentSubdivisionTick, setCurrentSubdivisionTick] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [metronomeStartTime, setMetronomeStartTime] = useState<number>(0);

  // Refs for scheduler (avoid stale closures)
  const bpmRef = useRef(initialBpm);
  const subdivisionRef = useRef<Subdivision>(initialSubdivision);
  const timeSignatureRef = useRef(initialTimeSignature);
  const soundTypeRef = useRef<MetronomeSoundType>(initialSoundType);
  const isPlayingRef = useRef(false);

  // Scheduler timing refs
  const schedulerIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextNoteTimeRef = useRef(0); // AudioContext time for next note
  const currentBeatRef = useRef(1);
  const currentSubRef = useRef(1);
  const tapTimesRef = useRef<number[]>([]);

  // Visual animation ref
  const animationFrameRef = useRef<number | null>(null);
  const lastBeatTimeRef = useRef(0);

  // Sound hook with AudioContext access
  const { audioContext, scheduleSound, scheduleDrumBeat, isLoaded } = useMetronomeSound({
    soundType,
  });

  // Keep refs in sync with state
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    subdivisionRef.current = subdivision;
  }, [subdivision]);

  useEffect(() => {
    timeSignatureRef.current = timeSignature;
  }, [timeSignature]);

  useEffect(() => {
    soundTypeRef.current = soundType;
  }, [soundType]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Derived values
  const beatsPerMeasure = useMemo(() => getBeatsPerMeasure(timeSignature), [timeSignature]);

  // Beat position for VU meter (0 to 1)
  const beatPosition = useMemo(() => {
    return (currentBeat - 1) / Math.max(1, beatsPerMeasure - 1);
  }, [currentBeat, beatsPerMeasure]);

  /**
   * Calculate interval between ticks in seconds
   */
  const getTickInterval = useCallback((bpmValue: number, subdiv: Subdivision): number => {
    const secondsPerBeat = 60 / bpmValue;
    return secondsPerBeat / subdiv;
  }, []);

  /**
   * Schedule a single note and trigger callbacks
   */
  const scheduleNote = useCallback(
    (note: ScheduledNote, ctx: AudioContextType) => {
      const type = soundTypeRef.current;

      // Schedule audio at precise time
      if (type === 'drums' && note.isBeat) {
        scheduleDrumBeat(note.beat, note.time);
      } else if (note.isBeat) {
        const role = note.isDownbeat ? 'accent' : 'tick';
        scheduleSound(role, note.time, type);
      } else {
        scheduleSound('subdivision', note.time, type);
      }

      // Schedule UI update and callbacks
      // Web doesn't have haptics, so we only schedule the UI update
      const delay = Math.max(0, (note.time - ctx.currentTime) * 1000);

      setTimeout(() => {
        if (!isPlayingRef.current) return;

        setCurrentBeat(note.beat);
        setCurrentSubdivisionTick(note.subdivision);

        if (note.isBeat) {
          onBeat?.(note.beat, note.isDownbeat);
        } else {
          onSubdivision?.(note.subdivision, note.beat);
        }
      }, delay);
    },
    [scheduleSound, scheduleDrumBeat, onBeat, onSubdivision]
  );

  /**
   * The lookahead scheduler - called periodically by setInterval
   * Schedules all notes that fall within the lookahead window
   */
  const scheduler = useCallback(() => {
    const ctx = audioContext;
    if (!ctx || !isPlayingRef.current) return;

    const currentBpm = bpmRef.current;
    const currentSubdiv = subdivisionRef.current;
    const currentTs = timeSignatureRef.current;
    const beatsInMeasure = getBeatsPerMeasure(currentTs);
    const tickInterval = getTickInterval(currentBpm, currentSubdiv);

    // Schedule all notes that fall within the lookahead window
    while (nextNoteTimeRef.current < ctx.currentTime + LOOKAHEAD_TIME) {
      const beat = currentBeatRef.current;
      const sub = currentSubRef.current;
      const isDownbeat = beat === 1 && sub === 1;
      const isBeat = sub === 1;

      const note: ScheduledNote = {
        time: nextNoteTimeRef.current,
        beat,
        subdivision: sub,
        isDownbeat,
        isBeat,
      };

      scheduleNote(note, ctx);

      // Store last beat time for visual animation
      if (isBeat) {
        lastBeatTimeRef.current = nextNoteTimeRef.current;
      }

      // Advance to next note
      nextNoteTimeRef.current += tickInterval;

      // Advance subdivision counter
      currentSubRef.current++;
      if (currentSubRef.current > currentSubdiv) {
        currentSubRef.current = 1;
        // Advance beat counter
        currentBeatRef.current++;
        if (currentBeatRef.current > beatsInMeasure) {
          currentBeatRef.current = 1;
        }
      }
    }
  }, [audioContext, getTickInterval, scheduleNote]);

  /**
   * Start the metronome
   */
  const start = useCallback(() => {
    if (isPlayingRef.current || !audioContext) return;

    // Initialize timing
    currentBeatRef.current = 1;
    currentSubRef.current = 1;
    nextNoteTimeRef.current = audioContext.currentTime;

    // Capture start time for pendulum animation sync
    // Use performance.now() in seconds for cross-platform compatibility
    const startTime = performance.now() / 1000;
    setMetronomeStartTime(startTime);

    // Update state
    setIsPlaying(true);
    setCurrentBeat(1);
    setCurrentSubdivisionTick(1);
    isPlayingRef.current = true;

    // Start the scheduler
    scheduler(); // Run immediately
    schedulerIdRef.current = setInterval(scheduler, SCHEDULER_INTERVAL);

    onStateChange?.(true);
  }, [audioContext, scheduler, onStateChange]);

  /**
   * Stop the metronome
   */
  const stop = useCallback(() => {
    if (!isPlayingRef.current) return;

    // Stop scheduler
    if (schedulerIdRef.current) {
      clearInterval(schedulerIdRef.current);
      schedulerIdRef.current = null;
    }

    // Stop animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Update state
    setIsPlaying(false);
    setCurrentBeat(1);
    setCurrentSubdivisionTick(1);
    isPlayingRef.current = false;

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
  const setBpm = useCallback((newBpm: number) => {
    const clamped = Math.min(BPM_MAX, Math.max(BPM_MIN, Math.round(newBpm)));
    setBpmState(clamped);
    bpmRef.current = clamped;
  }, []);

  /**
   * Set time signature
   */
  const setTimeSignature = useCallback((ts: string) => {
    setTimeSignatureState(ts);
    timeSignatureRef.current = ts;

    // If current beat is beyond new measure length, reset
    const newBeatsPerMeasure = getBeatsPerMeasure(ts);
    if (currentBeatRef.current > newBeatsPerMeasure) {
      currentBeatRef.current = 1;
      setCurrentBeat(1);
    }
  }, []);

  /**
   * Set subdivision
   */
  const setSubdivision = useCallback((sub: Subdivision) => {
    setSubdivisionState(sub);
    subdivisionRef.current = sub;
    currentSubRef.current = 1;
    setCurrentSubdivisionTick(1);
  }, []);

  /**
   * Set sound type
   */
  const setSoundType = useCallback((type: MetronomeSoundType) => {
    setSoundTypeState(type);
    soundTypeRef.current = type;
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
    setBpm(clampedBpm);

    return clampedBpm;
  }, [setBpm]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (schedulerIdRef.current) {
        clearInterval(schedulerIdRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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
    metronomeStartTime, // For pendulum animation sync

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
