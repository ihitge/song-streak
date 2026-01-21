/**
 * useAudioSession Hook
 *
 * Platform-aware microphone audio streaming:
 * - Web: Uses Web Audio API with getUserMedia
 * - Native (future): Will use react-native-live-audio-stream or expo-av
 *
 * Currently implements web-first approach since SongStreak
 * runs on web via Expo.
 *
 * Uses shared MicrophonePermissionContext so permission granted in one
 * feature (Tuner, Voice Recorder) immediately reflects in others.
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { AUDIO_CONFIG, VOLUME_THRESHOLD } from '@/constants/TunerConfig';
import { useMicrophonePermission } from '@/contexts/MicrophonePermissionContext';

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
 *
 * Uses shared MicrophonePermissionContext for permission state,
 * so granting mic access in Tuner immediately enables Voice Recorder and vice versa.
 */
export function useAudioSession(callbacks: AudioSessionCallbacks): UseAudioSessionReturn {
  const [isRecording, setIsRecording] = useState(false);

  // Use shared permission context (iOS best practice: grant once, use everywhere)
  const {
    hasPermission,
    permissionStatus,
    requestPermission: contextRequestPermission,
  } = useMicrophonePermission();

  // Web Audio API refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const rafRef = useRef<number | null>(null);

  // Pre-allocated buffer to avoid memory leak (was allocating 44 Float32Arrays/sec)
  const audioBufferRef = useRef<Float32Array | null>(null);

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

  // Request microphone permission (delegates to shared context)
  const requestPermission = useCallback(async (): Promise<boolean> => {
    return contextRequestPermission();
  }, [contextRequestPermission]);

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

      // Permission is managed by shared context - just store the stream
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

        // Reuse pre-allocated buffer to prevent memory leak
        // (was creating ~44 new Float32Arrays per second, causing OOM after 30-60s)
        if (!audioBufferRef.current || audioBufferRef.current.length !== inputBuffer.length) {
          audioBufferRef.current = new Float32Array(inputBuffer.length);
        }
        audioBufferRef.current.set(inputBuffer);

        // Calculate volume in dB
        const volumeDb = calculateVolumeDb(audioBufferRef.current);

        // Send to callback
        callbacks.onAudioData(audioBufferRef.current, volumeDb);
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
      // Permission errors are handled by shared context
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
