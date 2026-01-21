/**
 * useVoiceRecorder Hook
 *
 * State machine for the Reel-to-Reel voice recorder.
 * Handles recording, playback, and audio level monitoring.
 * Web-first implementation using MediaRecorder API.
 *
 * Uses shared MicrophonePermissionContext so permission granted in one
 * feature (Tuner, Voice Recorder) immediately reflects in others.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { useMicrophonePermission } from '@/contexts/MicrophonePermissionContext';
import {
  RecorderState,
  PlaybackSpeed,
  RecordingSession,
  PlaybackSession,
  MAX_RECORDING_SECONDS,
  PLAYBACK_SPEED_MULTIPLIERS,
} from '@/types/voiceMemo';

/**
 * Audio configuration for recording
 */
const AUDIO_CONFIG = {
  sampleRate: 44100,
  channelCount: 1,  // Mono for voice
  mimeType: 'audio/webm;codecs=opus',
  fallbackMimeType: 'audio/webm',
};

export interface UseVoiceRecorderOptions {
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: RecorderState) => void;
  onAudioLevel?: (left: number, right: number) => void;
}

export interface UseVoiceRecorderReturn {
  // State
  state: RecorderState;
  recording: RecordingSession;
  playback: PlaybackSession;
  hasRecording: boolean;

  // Permissions
  hasPermission: boolean;
  permissionStatus: 'undetermined' | 'granted' | 'denied';
  requestPermission: () => Promise<boolean>;

  // Actions
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (seconds: number) => void;
  rewind: () => void;
  fastForward: () => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  reset: () => void;

  // Audio URL for playback
  audioUrl: string | null;
  audioBlob: Blob | null;
}

/**
 * Calculate RMS volume level (0-1) from audio data
 */
function calculateAudioLevel(dataArray: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    // Convert from 0-255 to -1 to 1
    const value = (dataArray[i] - 128) / 128;
    sum += value * value;
  }
  const rms = Math.sqrt(sum / dataArray.length);
  // Scale up for better visual feedback
  return Math.min(1, rms * 3);
}

/**
 * Hook for voice recording and playback
 *
 * Uses shared MicrophonePermissionContext for permission state,
 * so granting mic access in Voice Recorder immediately enables Tuner and vice versa.
 */
export function useVoiceRecorder(options: UseVoiceRecorderOptions = {}): UseVoiceRecorderReturn {
  const { onRecordingComplete, onError, onStateChange, onAudioLevel } = options;

  // State
  const [state, setState] = useState<RecorderState>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  // Use shared permission context (iOS best practice: grant once, use everywhere)
  const {
    hasPermission,
    permissionStatus,
    requestPermission: contextRequestPermission,
  } = useMicrophonePermission();

  // Recording state
  const [recording, setRecording] = useState<RecordingSession>({
    startTime: 0,
    elapsedSeconds: 0,
    audioLevel: 0,
    audioLevelLeft: 0,
    audioLevelRight: 0,
    blob: null,
  });

  // Playback state
  const [playback, setPlayback] = useState<PlaybackSession>({
    currentTime: 0,
    duration: 0,
    speed: 'normal',
    isPlaying: false,
  });

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const levelTimerRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Derived state
  const hasRecording = audioBlob !== null;

  // Notify state changes
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  /**
   * Request microphone permission (delegates to shared context)
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    return contextRequestPermission();
  }, [contextRequestPermission]);

  /**
   * Start audio level monitoring
   */
  const startLevelMonitoring = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      if (!analyserRef.current) return;

      analyser.getByteTimeDomainData(dataArray);
      const level = calculateAudioLevel(dataArray);

      // For mono, use same level for L/R
      setRecording((prev) => ({
        ...prev,
        audioLevel: level,
        audioLevelLeft: level,
        audioLevelRight: level,
      }));

      onAudioLevel?.(level, level);

      levelTimerRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  }, [onAudioLevel]);

  /**
   * Stop audio level monitoring
   */
  const stopLevelMonitoring = useCallback(() => {
    if (levelTimerRef.current) {
      cancelAnimationFrame(levelTimerRef.current);
      levelTimerRef.current = null;
    }
  }, []);

  /**
   * Start recording
   */
  const startRecording = useCallback(async () => {
    if (Platform.OS !== 'web') {
      onError?.(new Error('Native recording not implemented'));
      setState('error');
      return;
    }

    try {
      // Request fresh stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
          sampleRate: AUDIO_CONFIG.sampleRate,
        },
        video: false,
      });

      // Permission is managed by shared context - just store the stream
      streamRef.current = stream;

      // Create audio context for level monitoring
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Determine mime type
      let mimeType = AUDIO_CONFIG.mimeType;
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = AUDIO_CONFIG.fallbackMimeType;
      }

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioUrl(url);
        setRecording((prev) => ({
          ...prev,
          blob,
        }));

        const duration = recording.elapsedSeconds;
        setPlayback((prev) => ({
          ...prev,
          duration,
          currentTime: 0,
        }));

        onRecordingComplete?.(blob, duration);
      };

      mediaRecorder.onerror = (event) => {
        console.error('[VoiceRecorder] Recording error:', event);
        onError?.(new Error('Recording failed'));
        setState('error');
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setState('recording');

      // Reset recording state
      const startTime = Date.now();
      setRecording({
        startTime,
        elapsedSeconds: 0,
        audioLevel: 0,
        audioLevelLeft: 0,
        audioLevelRight: 0,
        blob: null,
      });

      // Start timer for elapsed time
      timerRef.current = setInterval(() => {
        setRecording((prev) => {
          const elapsed = (Date.now() - startTime) / 1000;

          // Auto-stop at max duration
          if (elapsed >= MAX_RECORDING_SECONDS) {
            stopRecording();
            return { ...prev, elapsedSeconds: MAX_RECORDING_SECONDS };
          }

          return { ...prev, elapsedSeconds: elapsed };
        });
      }, 100);

      // Start level monitoring
      startLevelMonitoring();

      if (__DEV__) {
        console.log('[VoiceRecorder] Recording started');
      }
    } catch (err) {
      console.error('[VoiceRecorder] Failed to start:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      onError?.(error);
      // Permission errors are handled by shared context
      setState('error');
    }
  }, [onRecordingComplete, onError, startLevelMonitoring, recording.elapsedSeconds]);

  /**
   * Stop recording
   */
  const stopRecording = useCallback(() => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop level monitoring
    stopLevelMonitoring();

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Stop stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setState('stopped');

    if (__DEV__) {
      console.log('[VoiceRecorder] Recording stopped');
    }
  }, [stopLevelMonitoring]);

  /**
   * Play recording
   */
  const play = useCallback(() => {
    if (!audioUrl || Platform.OS !== 'web') return;

    // Create audio element if needed
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl);
    } else {
      audioElementRef.current.src = audioUrl;
    }

    const audio = audioElementRef.current;
    audio.playbackRate = PLAYBACK_SPEED_MULTIPLIERS[playback.speed];

    // Set up event handlers
    audio.ontimeupdate = () => {
      setPlayback((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
      }));
    };

    audio.onended = () => {
      setPlayback((prev) => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
      }));
      setState('stopped');
    };

    audio.onloadedmetadata = () => {
      setPlayback((prev) => ({
        ...prev,
        duration: audio.duration,
      }));
    };

    audio.play();
    setState('playing');
    setPlayback((prev) => ({
      ...prev,
      isPlaying: true,
    }));

    if (__DEV__) {
      console.log('[VoiceRecorder] Playback started');
    }
  }, [audioUrl, playback.speed]);

  /**
   * Pause playback
   */
  const pause = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setState('stopped');
    setPlayback((prev) => ({
      ...prev,
      isPlaying: false,
    }));
  }, []);

  /**
   * Stop playback and reset position
   */
  const stop = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    setState(hasRecording ? 'stopped' : 'idle');
    setPlayback((prev) => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
    }));
  }, [hasRecording]);

  /**
   * Seek to position
   */
  const seek = useCallback((seconds: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = Math.max(0, Math.min(seconds, playback.duration));
      setPlayback((prev) => ({
        ...prev,
        currentTime: audioElementRef.current!.currentTime,
      }));
    }
  }, [playback.duration]);

  /**
   * Rewind 5 seconds
   */
  const rewind = useCallback(() => {
    seek(playback.currentTime - 5);
  }, [playback.currentTime, seek]);

  /**
   * Fast forward 5 seconds
   */
  const fastForward = useCallback(() => {
    seek(playback.currentTime + 5);
  }, [playback.currentTime, seek]);

  /**
   * Set playback speed
   */
  const setSpeed = useCallback((speed: PlaybackSpeed) => {
    setPlayback((prev) => ({
      ...prev,
      speed,
    }));

    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = PLAYBACK_SPEED_MULTIPLIERS[speed];
    }
  }, []);

  /**
   * Reset recorder to initial state
   */
  const reset = useCallback(() => {
    // Stop any playback
    stop();

    // Revoke object URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    // Reset state
    setAudioUrl(null);
    setAudioBlob(null);
    setRecording({
      startTime: 0,
      elapsedSeconds: 0,
      audioLevel: 0,
      audioLevelLeft: 0,
      audioLevelRight: 0,
      blob: null,
    });
    setPlayback({
      currentTime: 0,
      duration: 0,
      speed: 'normal',
      isPlaying: false,
    });
    setState('idle');

    if (__DEV__) {
      console.log('[VoiceRecorder] Reset');
    }
  }, [audioUrl, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopLevelMonitoring();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl, stopLevelMonitoring]);

  return {
    // State
    state,
    recording,
    playback,
    hasRecording,

    // Permissions
    hasPermission,
    permissionStatus,
    requestPermission,

    // Actions
    startRecording,
    stopRecording,
    play,
    pause,
    stop,
    seek,
    rewind,
    fastForward,
    setSpeed,
    reset,

    // Audio
    audioUrl,
    audioBlob,
  };
}
