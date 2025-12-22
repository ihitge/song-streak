/**
 * useAudioSession Hook
 *
 * Platform-aware microphone audio streaming:
 * - Web: Uses Web Audio API with getUserMedia
 * - Native (future): Will use react-native-live-audio-stream or expo-av
 *
 * Currently implements web-first approach since Song Streak
 * runs on web via Expo.
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { AUDIO_CONFIG, VOLUME_THRESHOLD } from '@/constants/TunerConfig';

export interface AudioSessionCallbacks {
  onAudioData: (float32Array: Float32Array, volumeDb: number) => void;
  onError?: (error: Error) => void;
}

export interface UseAudioSessionReturn {
  isRecording: boolean;
  start: () => void;
  stop: () => void;
  hasPermission: boolean;
  permissionStatus: 'undetermined' | 'granted' | 'denied';
  requestPermission: () => Promise<boolean>;
}

/**
 * Calculate RMS volume in decibels
 */
function calculateVolumeDb(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  const rms = Math.sqrt(sum / samples.length);
  return 20 * Math.log10(Math.max(rms, 1e-10));
}

/**
 * Hook for managing microphone audio streaming
 * Currently web-only using Web Audio API
 */
export function useAudioSession(callbacks: AudioSessionCallbacks): UseAudioSessionReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<
    'undetermined' | 'granted' | 'denied'
  >('undetermined');

  // Web Audio API refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const rafRef = useRef<number | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  // Request microphone permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'web') {
      // TODO: Implement native permission request
      console.warn('[AudioSession] Native audio not yet implemented');
      setPermissionStatus('denied');
      return false;
    }

    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('[AudioSession] getUserMedia not supported');
        setPermissionStatus('denied');
        return false;
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: AUDIO_CONFIG.sampleRate,
        },
        video: false,
      });

      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach((track) => track.stop());

      setHasPermission(true);
      setPermissionStatus('granted');
      return true;
    } catch (err) {
      console.error('[AudioSession] Permission denied:', err);
      setHasPermission(false);
      setPermissionStatus('denied');
      return false;
    }
  }, []);

  // Start audio capture
  const start = useCallback(async () => {
    if (Platform.OS !== 'web') {
      callbacks.onError?.(new Error('Native audio not yet implemented'));
      return;
    }

    try {
      // Request fresh permission/stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: AUDIO_CONFIG.sampleRate,
        },
        video: false,
      });

      setHasPermission(true);
      setPermissionStatus('granted');
      streamRef.current = stream;

      // Create audio context
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass({
        sampleRate: AUDIO_CONFIG.sampleRate,
      });
      audioContextRef.current = audioContext;

      // Create analyser node
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = AUDIO_CONFIG.fftSize;
      analyser.smoothingTimeConstant = 0;
      analyserRef.current = analyser;

      // Create source from stream
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Connect source to analyser
      source.connect(analyser);

      // Use ScriptProcessorNode for continuous audio data
      // Note: ScriptProcessorNode is deprecated but widely supported
      // AudioWorklet would be preferred for production
      const bufferSize = AUDIO_CONFIG.pitchDetectionBufferSize;
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer.getChannelData(0);

        // Create a copy of the buffer (original is recycled)
        const buffer = new Float32Array(inputBuffer.length);
        buffer.set(inputBuffer);

        // Calculate volume in dB
        const volumeDb = calculateVolumeDb(buffer);

        // Send to callback
        callbacks.onAudioData(buffer, volumeDb);
      };

      // Connect analyser to processor, processor to destination (required for it to work)
      analyser.connect(processor);
      processor.connect(audioContext.destination);

      setIsRecording(true);

      if (__DEV__) {
        console.log('[AudioSession] Started with sample rate:', audioContext.sampleRate);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[AudioSession] Failed to start:', error);
      setPermissionStatus('denied');
      callbacks.onError?.(error);
      cleanup();
    }
  }, [callbacks, cleanup]);

  // Stop audio capture
  const stop = useCallback(() => {
    cleanup();
    setIsRecording(false);

    if (__DEV__) {
      console.log('[AudioSession] Stopped');
    }
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isRecording,
    start,
    stop,
    hasPermission,
    permissionStatus,
    requestPermission,
  };
}
