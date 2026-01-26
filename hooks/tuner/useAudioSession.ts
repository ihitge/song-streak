/**
 * useAudioSession Hook
 *
 * Platform-aware microphone audio streaming:
 * - Web: Uses Web Audio API with getUserMedia
 * - Native (iOS/Android): Uses react-native-audio-api
 *
 * Uses shared MicrophonePermissionContext so permission granted in one
 * feature (Tuner, Voice Recorder) immediately reflects in others.
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { AUDIO_CONFIG } from '@/constants/TunerConfig';
import { useMicrophonePermission } from '@/contexts/MicrophonePermissionContext';

// Conditionally import native audio API (only on native platforms)
let AudioRecorder: any;
let AudioManager: any;

if (Platform.OS !== 'web') {
  try {
    const audioApi = require('react-native-audio-api');
    AudioRecorder = audioApi.AudioRecorder;
    AudioManager = audioApi.AudioManager;
  } catch (e) {
    console.warn('[AudioSession] Failed to load react-native-audio-api:', e);
  }
}

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
 * Automatically selects platform-appropriate implementation
 */
export function useAudioSession(callbacks: AudioSessionCallbacks): UseAudioSessionReturn {
  const [isRecording, setIsRecording] = useState(false);

  // Use shared permission context (iOS best practice: grant once, use everywhere)
  const {
    hasPermission,
    permissionStatus,
    requestPermission: contextRequestPermission,
  } = useMicrophonePermission();

  // Refs for cleanup
  const callbacksRef = useRef(callbacks);

  // Web Audio API refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioBufferRef = useRef<Float32Array | null>(null);

  // Native audio refs
  const recorderRef = useRef<any>(null);

  // Keep callbacks ref updated
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Cleanup function for web
  const cleanupWeb = useCallback(() => {
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

  // Cleanup function for native
  const cleanupNative = useCallback(() => {
    if (recorderRef.current) {
      try {
        recorderRef.current.stop();
      } catch (e) {
        console.warn('[AudioSession] Native cleanup error:', e);
      }
      recorderRef.current = null;
    }
    if (AudioManager) {
      AudioManager.setAudioSessionActivity(false).catch(() => {});
    }
  }, []);

  // Combined cleanup
  const cleanup = useCallback(() => {
    if (Platform.OS === 'web') {
      cleanupWeb();
    } else {
      cleanupNative();
    }
  }, [cleanupWeb, cleanupNative]);

  // Request microphone permission (delegates to shared context)
  const requestPermission = useCallback(async (): Promise<boolean> => {
    return contextRequestPermission();
  }, [contextRequestPermission]);

  // Start audio capture - Web implementation
  const startWeb = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: AUDIO_CONFIG.sampleRate,
        },
        video: false,
      });

      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass({
        sampleRate: AUDIO_CONFIG.sampleRate,
      });
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = AUDIO_CONFIG.fftSize;
      analyser.smoothingTimeConstant = 0;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;
      source.connect(analyser);

      const bufferSize = AUDIO_CONFIG.pitchDetectionBufferSize;
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer.getChannelData(0);

        if (!audioBufferRef.current || audioBufferRef.current.length !== inputBuffer.length) {
          audioBufferRef.current = new Float32Array(inputBuffer.length);
        }
        audioBufferRef.current.set(inputBuffer);

        const volumeDb = calculateVolumeDb(audioBufferRef.current);
        callbacksRef.current.onAudioData(audioBufferRef.current, volumeDb);
      };

      analyser.connect(processor);
      processor.connect(audioContext.destination);

      setIsRecording(true);
      console.log('[AudioSession] Web audio started');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[AudioSession] Web start failed:', error);
      callbacksRef.current.onError?.(error);
      cleanupWeb();
    }
  }, [cleanupWeb]);

  // Start audio capture - Native implementation
  const startNative = useCallback(async () => {
    if (!AudioRecorder || !AudioManager) {
      callbacksRef.current.onError?.(new Error('react-native-audio-api not available'));
      return;
    }

    try {
      console.log('[AudioSession] Starting native audio capture...');

      // Permission is handled by MicrophonePermissionContext
      // We trust that permission was granted before start() is called
      // Do NOT request permission here - it would be redundant and could cause issues

      // Configure audio session for recording with measurement mode (best for tuner)
      try {
        AudioManager.setAudioSessionOptions({
          iosCategory: 'playAndRecord',
          iosMode: 'measurement',
          iosOptions: ['defaultToSpeaker', 'allowBluetooth'],
        });
        console.log('[AudioSession] Audio session options configured');
      } catch (optErr) {
        console.warn('[AudioSession] Failed to set audio session options:', optErr);
        // Continue anyway - the recording might still work with default options
      }

      try {
        const activated = await AudioManager.setAudioSessionActivity(true);
        console.log('[AudioSession] Audio session activated:', activated);
      } catch (actErr) {
        console.warn('[AudioSession] Failed to activate audio session:', actErr);
        // Continue anyway - might already be active
      }

      const bufferLength = AUDIO_CONFIG.pitchDetectionBufferSize;
      const sampleRate = AUDIO_CONFIG.sampleRate;

      // Create new recorder with required options
      // AudioRecorder constructor requires { sampleRate, bufferLengthInSamples }
      if (!recorderRef.current) {
        recorderRef.current = new AudioRecorder({
          sampleRate,
          bufferLengthInSamples: bufferLength,
        });
      }

      const recorder = recorderRef.current;

      // Debug counter for audio callbacks
      let audioCallbackCount = 0;

      // Set up audio callback - onAudioReady takes only a callback function
      recorder.onAudioReady(({ buffer, numFrames }: { buffer: any; numFrames: number }) => {
        audioCallbackCount++;
        // Log first few callbacks to confirm audio is flowing
        if (audioCallbackCount <= 5) {
          console.log(`[AudioSession] onAudioReady #${audioCallbackCount}: numFrames=${numFrames}, buffer.length=${buffer?.length}`);
        }
        try {
          const channelData = buffer.getChannelData(0);
          const audioData = new Float32Array(channelData.length);
          for (let i = 0; i < channelData.length; i++) {
            audioData[i] = channelData[i];
          }
          const volumeDb = calculateVolumeDb(audioData);
          // Log volume for first few callbacks
          if (audioCallbackCount <= 5) {
            console.log(`[AudioSession] onAudioReady #${audioCallbackCount}: volumeDb=${volumeDb.toFixed(1)}dB`);
          }
          callbacksRef.current.onAudioData(audioData, volumeDb);
        } catch (e) {
          console.error('[AudioSession] Error processing native audio:', e);
        }
      });

      // start() returns void, not a result object
      recorder.start();
      console.log('[AudioSession] Native recorder started');

      setIsRecording(true);
      console.log('[AudioSession] Native audio started');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[AudioSession] Native start failed:', error);
      callbacksRef.current.onError?.(error);
      cleanupNative();
    }
  }, [cleanupNative]);

  // Start - platform-aware
  const start = useCallback(async () => {
    if (Platform.OS === 'web') {
      await startWeb();
    } else {
      await startNative();
    }
  }, [startWeb, startNative]);

  // Stop audio capture
  const stop = useCallback(() => {
    cleanup();
    setIsRecording(false);
    console.log('[AudioSession] Stopped');
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
