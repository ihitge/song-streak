/**
 * usePitchDetection Hook
 *
 * Uses the pitchy library (MIT licensed) with McLeod Pitch Method
 * for real-time pitch detection. Uses full 44.1kHz sample rate
 * for accurate low E (82Hz) detection.
 */

import { useRef, useCallback } from 'react';
import { PitchDetector } from 'pitchy';
import { YIN_CONFIG, AUDIO_CONFIG, PROCESSING_CONFIG } from '@/constants/TunerConfig';
import type { PitchResult } from '@/types/tuner';

export interface UsePitchDetectionReturn {
  detect: (buffer: Float32Array) => PitchResult | null;
}

/**
 * Minimum clarity threshold for accepting a pitch detection
 * McLeod returns clarity 0-1, where 1 is perfect correlation
 */
const MIN_CLARITY = 0.85;

/**
 * Hook for pitch detection using McLeod Pitch Method at full sample rate
 *
 * No downsampling - preserves frequency resolution for accurate
 * low E (82Hz) detection. McLeod provides excellent accuracy for
 * musical instrument tuning with clarity confidence scores.
 */
export function usePitchDetection(): UsePitchDetectionReturn {
  const detectorRef = useRef<PitchDetector<Float32Array> | null>(null);
  const detectCountRef = useRef(0);

  // Initialize detector lazily
  if (!detectorRef.current) {
    detectorRef.current = PitchDetector.forFloat32Array(
      AUDIO_CONFIG.pitchDetectionBufferSize
    );
  }

  const detect = useCallback((buffer: Float32Array): PitchResult | null => {
    try {
      detectCountRef.current++;

      // Detect pitch using McLeod Pitch Method
      // Returns [frequency, clarity] where clarity is 0-1 confidence
      const [frequency, clarity] = detectorRef.current!.findPitch(
        buffer,
        YIN_CONFIG.sampleRate
      );

      // Only log first N detections to confirm it's working (avoid console spam)
      if (__DEV__ && detectCountRef.current <= PROCESSING_CONFIG.debugLogLimit) {
        console.log(
          `[PitchDetect] #${detectCountRef.current} samples=${buffer.length} freq=${frequency?.toFixed(1) ?? 'null'} clarity=${clarity?.toFixed(2) ?? 'null'}`
        );
      }

      // Reject low-clarity detections (noise)
      if (clarity < MIN_CLARITY) {
        return null;
      }

      if (frequency === null || frequency <= 0 || !isFinite(frequency)) {
        return null;
      }

      // Filter out unreasonable frequencies for guitar
      if (frequency < YIN_CONFIG.minFrequency || frequency > YIN_CONFIG.maxFrequency) {
        return null;
      }

      return {
        frequency,
        probability: clarity, // Use McLeod clarity as probability
      };
    } catch (err) {
      console.error('[PitchDetect] Detection error:', err);
      return null;
    }
  }, []);

  return { detect };
}
