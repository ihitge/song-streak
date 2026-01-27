/**
 * useTuner Hook
 *
 * High-level tuner state management that integrates:
 * - Pitch detection
 * - Microphone permission
 * - Instrument selection
 * - Kalman filtering for smooth needle movement
 * - Target string detection
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { usePitchDetection } from './usePitchDetection';
import { useMicrophonePermission } from '@/contexts/MicrophonePermissionContext';
import {
  type InstrumentType,
  getInstrumentStrings,
  findClosestString,
  KALMAN_CONFIG,
  IN_TUNE_THRESHOLD,
} from '@/constants/TunerConfig';
import type {
  TunerState,
  UseTunerReturn,
  SmoothedPitchResult,
  KalmanState,
} from '@/types/tuner';

/**
 * Simple 1D Kalman filter for smoothing cents deviation
 */
class KalmanFilter {
  private state: KalmanState;
  private Q: number; // Process noise
  private R: number; // Measurement noise

  constructor(initialValue: number = 0) {
    this.state = {
      x: initialValue,
      P: KALMAN_CONFIG.initialCovariance,
    };
    this.Q = KALMAN_CONFIG.processNoise;
    this.R = KALMAN_CONFIG.measurementNoise;
  }

  /**
   * Update filter with new measurement
   */
  update(measurement: number): number {
    // Prediction step
    const xPred = this.state.x;
    const PPred = this.state.P + this.Q;

    // Update step
    const K = PPred / (PPred + this.R); // Kalman gain
    this.state.x = xPred + K * (measurement - xPred);
    this.state.P = (1 - K) * PPred;

    return this.state.x;
  }

  /**
   * Adjust noise parameters for rapid pitch changes
   */
  setAdaptive(isRapidChange: boolean): void {
    if (isRapidChange) {
      this.Q = KALMAN_CONFIG.rapidChangeProcessNoise;
    } else {
      this.Q = KALMAN_CONFIG.processNoise;
    }
  }

  /**
   * Reset filter state
   */
  reset(value: number = 0): void {
    this.state.x = value;
    this.state.P = KALMAN_CONFIG.initialCovariance;
  }

  /**
   * Get current state
   */
  getValue(): number {
    return this.state.x;
  }
}

/**
 * useTuner - Main tuner hook
 */
export function useTuner(): UseTunerReturn {
  // Pitch detection
  const pitchDetection = usePitchDetection();

  // Microphone permission
  const { hasPermission, requestPermission: requestMicPermission } = useMicrophonePermission();

  // State
  const [instrument, setInstrumentState] = useState<InstrumentType>('guitar');
  const [smoothedPitch, setSmoothedPitch] = useState<SmoothedPitchResult | null>(null);
  const [isInTune, setIsInTune] = useState(false);
  const [targetString, setTargetString] = useState<ReturnType<typeof findClosestString>>(null);

  // Refs
  const kalmanFilterRef = useRef(new KalmanFilter());
  const lastCentsRef = useRef<number | null>(null);
  const wasInTuneRef = useRef(false);

  // Get strings for current instrument
  const strings = useMemo(() => getInstrumentStrings(instrument), [instrument]);

  /**
   * Process raw pitch and apply Kalman filtering
   */
  useEffect(() => {
    const rawPitch = pitchDetection.pitch;

    if (!rawPitch) {
      // No pitch detected - reset after a short delay to avoid flickering
      const timeout = setTimeout(() => {
        setSmoothedPitch(null);
        setIsInTune(false);
        setTargetString(null);
      }, 100);

      return () => clearTimeout(timeout);
    }

    // Find closest target string
    const closest = findClosestString(rawPitch.frequency, strings);
    setTargetString(closest);

    // Get cents from target (or from nearest chromatic note if no target)
    const centsFromTarget = closest?.cents ?? rawPitch.cents;

    // Detect rapid pitch change for adaptive filtering
    const isRapidChange =
      lastCentsRef.current !== null &&
      Math.abs(centsFromTarget - lastCentsRef.current) > KALMAN_CONFIG.rapidChangeThreshold;

    kalmanFilterRef.current.setAdaptive(isRapidChange);
    lastCentsRef.current = centsFromTarget;

    // Apply Kalman filter
    const smoothedCents = kalmanFilterRef.current.update(centsFromTarget);

    // Create smoothed result
    const smoothed: SmoothedPitchResult = {
      frequency: rawPitch.frequency,
      cents: smoothedCents,
      note: rawPitch.note,
      octave: rawPitch.octave,
      clarity: rawPitch.clarity,
    };

    setSmoothedPitch(smoothed);

    // Check if in tune
    const nowInTune = Math.abs(smoothedCents) <= IN_TUNE_THRESHOLD;
    setIsInTune(nowInTune);

    // Haptic feedback when transitioning to "in tune" state
    if (nowInTune && !wasInTuneRef.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    wasInTuneRef.current = nowInTune;
  }, [pitchDetection.pitch, strings]);

  /**
   * Change instrument
   */
  const setInstrument = useCallback((newInstrument: InstrumentType) => {
    setInstrumentState(newInstrument);
    // Reset Kalman filter when changing instrument
    kalmanFilterRef.current.reset();
    lastCentsRef.current = null;
  }, []);

  /**
   * Request microphone permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    return await requestMicPermission();
  }, [requestMicPermission]);

  /**
   * Start tuner
   */
  const start = useCallback(async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        return;
      }
    }

    kalmanFilterRef.current.reset();
    lastCentsRef.current = null;
    wasInTuneRef.current = false;

    await pitchDetection.start();
  }, [hasPermission, requestPermission, pitchDetection]);

  /**
   * Stop tuner
   */
  const stop = useCallback(() => {
    pitchDetection.stop();
    setSmoothedPitch(null);
    setIsInTune(false);
    setTargetString(null);
  }, [pitchDetection]);

  /**
   * Toggle tuner
   */
  const toggle = useCallback(async () => {
    if (pitchDetection.isListening) {
      stop();
    } else {
      await start();
    }
  }, [pitchDetection.isListening, start, stop]);

  // Build tuner state
  const state: TunerState = {
    instrument,
    rawPitch: pitchDetection.pitch,
    smoothedPitch,
    targetString: targetString?.string ?? null,
    centsFromTarget: targetString?.cents ?? null,
    isInTune,
    isActive: pitchDetection.isListening,
    error: pitchDetection.error,
  };

  return {
    state,
    isReady: pitchDetection.isReady,
    isListening: pitchDetection.isListening,
    start,
    stop,
    toggle,
    setInstrument,
    strings,
    hasPermission,
    requestPermission,
  };
}
