/**
 * useTunerMachine Hook
 *
 * Central state machine orchestrating the tuner:
 * - Audio session management
 * - Pitch detection
 * - String matching
 * - UI state updates
 *
 * Provides zero-latency response for real-time guitar tuning.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAudioSession } from './useAudioSession';
import { usePitchDetection } from './usePitchDetection';
import {
  TUNING_CONFIG,
  VOLUME_THRESHOLD,
  PROCESSING_CONFIG,
  AUDIO_CONFIG,
} from '@/constants/TunerConfig';
import { findClosestGuitarString } from '@/utils/tuner/noteDetection';
import type {
  TunerStatus,
  TunerState,
  GuitarString,
  TunerHookReturn,
  TuningDirection,
} from '@/types/tuner';

const initialState: TunerState = {
  status: 'idle',
  frequency: null,
  cents: null,
  direction: null,
  signalStrength: 0,
  isInTune: false,
};

/**
 * Main tuner state machine hook
 *
 * Usage:
 * ```tsx
 * const tuner = useTunerMachine();
 *
 * // Start tuning
 * tuner.start();
 *
 * // Read current state
 * console.log(tuner.frequency, tuner.cents, tuner.isInTune);
 *
 * // Stop when done
 * tuner.stop();
 * ```
 */
export function useTunerMachine(): TunerHookReturn {
  const [selectedString, setSelectedString] = useState<GuitarString | null>(null);
  const [detectedString, setDetectedString] = useState<GuitarString | null>(null);
  const [state, setState] = useState<TunerState>(initialState);

  // Use refs for values needed in callback to avoid stale closures
  const selectedStringRef = useRef<GuitarString | null>(null);
  const isRunningRef = useRef(false);

  // Update ref when state changes
  useEffect(() => {
    selectedStringRef.current = selectedString;
  }, [selectedString]);

  const pitchDetector = usePitchDetection();

  // Debug counter
  const debugCountRef = useRef(0);

  // Pre-allocated circular buffer for low frequency detection
  // Low E (82Hz) needs ~12.1ms per cycle, so 4096 samples (~93ms) gives ~7.7 cycles
  const BUFFER_SIZE = AUDIO_CONFIG.pitchDetectionBufferSize;
  const bufferRef = useRef(new Float32Array(BUFFER_SIZE));
  const linearBufferRef = useRef(new Float32Array(BUFFER_SIZE));
  const writeIndexRef = useRef(0);
  const samplesAccumulatedRef = useRef(0);
  const lastProcessTimeRef = useRef(0);

  // Audio data handler - called for each audio buffer
  const handleAudioData = useCallback(
    (float32Array: Float32Array, volumeDb: number) => {
      if (!isRunningRef.current) return;

      debugCountRef.current++;
      const count = debugCountRef.current;

      // Normalize volume to 0-1 range
      const normalizedVolume = Math.max(0, Math.min(1, (volumeDb + 60) / 60));

      // Minimal logging - only first N packets to confirm audio is working
      if (__DEV__ && count <= PROCESSING_CONFIG.debugLogLimit) {
        console.log(`[Tuner] #${count} vol=${volumeDb.toFixed(1)}dB`);
      }

      // Volume gate - reject very quiet signals
      if (volumeDb < VOLUME_THRESHOLD.mobileFloor) {
        // Reset buffer on silence
        writeIndexRef.current = 0;
        samplesAccumulatedRef.current = 0;
        setState((prev) => ({
          ...prev,
          status: 'listening',
          signalStrength: normalizedVolume,
        }));
        return;
      }

      // Write to circular buffer (no allocations, no GC thrashing)
      const buffer = bufferRef.current;
      const incomingSamples = float32Array.length;
      let writeIdx = writeIndexRef.current;

      for (let i = 0; i < incomingSamples; i++) {
        buffer[writeIdx] = float32Array[i];
        writeIdx = (writeIdx + 1) % BUFFER_SIZE;
      }
      writeIndexRef.current = writeIdx;
      samplesAccumulatedRef.current = Math.min(
        samplesAccumulatedRef.current + incomingSamples,
        BUFFER_SIZE
      );

      // Only process if we have enough samples
      if (samplesAccumulatedRef.current < BUFFER_SIZE) {
        return;
      }

      // Throttle processing to avoid overloading JS thread
      const now = Date.now();
      if (now - lastProcessTimeRef.current < PROCESSING_CONFIG.interval) {
        return;
      }
      lastProcessTimeRef.current = now;

      // Extract linear buffer from circular buffer
      const linearBuffer = linearBufferRef.current;
      const startIdx = writeIndexRef.current;
      for (let i = 0; i < BUFFER_SIZE; i++) {
        linearBuffer[i] = buffer[(startIdx + i) % BUFFER_SIZE];
      }

      // Detect pitch
      const pitchResult = pitchDetector.detect(linearBuffer);

      if (!pitchResult) {
        setState((prev) => ({
          ...prev,
          status: 'listening',
          signalStrength: normalizedVolume,
        }));
        return;
      }

      // Find closest guitar string
      const closestMatch = findClosestGuitarString(pitchResult.frequency);

      if (!closestMatch) {
        // Frequency too far from any guitar string
        setState((prev) => ({
          ...prev,
          status: 'listening',
          signalStrength: normalizedVolume,
        }));
        return;
      }

      // Update detected string
      const targetString = closestMatch.string;
      setDetectedString(targetString);

      // Calculate if in tune
      const isInTune = Math.abs(closestMatch.cents) <= TUNING_CONFIG.inTuneEnter;
      const status: TunerStatus = isInTune ? 'in_tune' : 'detecting';

      setState({
        status,
        frequency: pitchResult.frequency,
        cents: closestMatch.cents,
        direction: closestMatch.direction,
        signalStrength: normalizedVolume,
        isInTune,
      });
    },
    [pitchDetector]
  );

  // Audio session management
  const audioSession = useAudioSession({
    onAudioData: handleAudioData,
    onError: (error) => {
      console.error('[TunerMachine] Audio session error:', error);
      isRunningRef.current = false;
      setState((prev) => ({ ...prev, status: 'idle' }));
    },
  });

  // Start tuning
  const start = useCallback(
    (initialString?: GuitarString) => {
      if (initialString) {
        selectedStringRef.current = initialString;
        setSelectedString(initialString);
      }

      debugCountRef.current = 0;
      lastProcessTimeRef.current = 0;
      writeIndexRef.current = 0;
      samplesAccumulatedRef.current = 0;
      isRunningRef.current = true;

      setState((prev) => ({ ...prev, status: 'initializing' }));
      audioSession.start();

      // Update status to listening after a brief delay
      setTimeout(() => {
        if (isRunningRef.current) {
          setState((prev) => ({
            ...prev,
            status: prev.status === 'initializing' ? 'listening' : prev.status,
          }));
        }
      }, 100);
    },
    [audioSession]
  );

  // Stop tuning
  const stop = useCallback(() => {
    isRunningRef.current = false;
    writeIndexRef.current = 0;
    samplesAccumulatedRef.current = 0;
    lastProcessTimeRef.current = 0;

    audioSession.stop();

    setState(initialState);
    setDetectedString(null);
  }, [audioSession]);

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    return audioSession.requestPermission();
  }, [audioSession]);

  return {
    ...state,
    selectedString,
    setSelectedString,
    detectedString,
    start,
    stop,
    hasPermission: audioSession.hasPermission,
    permissionStatus: audioSession.permissionStatus,
    requestPermission,
  };
}
