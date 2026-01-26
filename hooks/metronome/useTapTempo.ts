/**
 * useTapTempo Hook
 *
 * Calculates BPM from user taps using a rolling average algorithm.
 *
 * Algorithm:
 * 1. Store timestamps of recent taps (up to MAX_TAPS)
 * 2. Reset if gap between taps exceeds TAP_TIMEOUT
 * 3. Calculate average interval between consecutive taps
 * 4. Convert to BPM and clamp to valid range
 */

import { useRef, useCallback, useState } from 'react';
import { METRONOME_CONFIG } from '@/constants/MetronomeConfig';
import type { UseTapTempoReturn } from '@/types/metronome';

/**
 * useTapTempo - Tap tempo detection with rolling average
 */
export function useTapTempo(): UseTapTempoReturn {
  const [tapCount, setTapCount] = useState(0);
  const tapTimesRef = useRef<number[]>([]);

  /**
   * Handle a tap event
   * @returns Calculated BPM or null if not enough taps
   */
  const handleTap = useCallback((): number | null => {
    const now = Date.now();
    const tapTimes = tapTimesRef.current;

    // Reset if too long since last tap
    if (tapTimes.length > 0) {
      const lastTap = tapTimes[tapTimes.length - 1];
      if (now - lastTap > METRONOME_CONFIG.tapTimeoutMs) {
        tapTimes.length = 0;
      }
    }

    // Add current tap
    tapTimes.push(now);

    // Keep only recent taps (rolling window)
    if (tapTimes.length > METRONOME_CONFIG.tapMaxCount) {
      tapTimes.shift();
    }

    // Update tap count for UI feedback
    setTapCount(tapTimes.length);

    // Need at least MIN_TAPS to calculate BPM
    if (tapTimes.length < METRONOME_CONFIG.tapMinCount) {
      return null;
    }

    // Calculate average interval between consecutive taps
    const intervals: number[] = [];
    for (let i = 1; i < tapTimes.length; i++) {
      intervals.push(tapTimes[i] - tapTimes[i - 1]);
    }

    const avgIntervalMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    // Convert to BPM: 60000ms / interval = BPM
    const bpm = Math.round(60000 / avgIntervalMs);

    // Clamp to valid range
    return Math.max(
      METRONOME_CONFIG.bpmMin,
      Math.min(METRONOME_CONFIG.bpmMax, bpm)
    );
  }, []);

  /**
   * Reset tap tempo state
   */
  const reset = useCallback(() => {
    tapTimesRef.current = [];
    setTapCount(0);
  }, []);

  return {
    handleTap,
    tapCount,
    reset,
  };
}
