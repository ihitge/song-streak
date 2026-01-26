/**
 * useVoiceRecorder Hook
 *
 * State machine for the Reel-to-Reel voice recorder.
 * Handles recording, playback, and audio level monitoring.
 *
 * Platform support:
 * - iOS/Android: Uses react-native-audio-api for recording, expo-audio for playback
 * - Web: Uses MediaRecorder API for recording, HTMLAudioElement for playback
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

// Conditionally import native modules
let AudioRecorder: any;
let AudioManager: any;
let createAudioPlayer: any;
let AudioPlayer: any;

if (Platform.OS !== 'web') {
  try {
    const audioApi = require('react-native-audio-api');
    AudioRecorder = audioApi.AudioRecorder;
    AudioManager = audioApi.AudioManager;
  } catch (e) {
    console.warn('[VoiceRecorder] Failed to load react-native-audio-api:', e);
  }

  try {
    const expoAudio = require('expo-audio');
    createAudioPlayer = expoAudio.createAudioPlayer;
    AudioPlayer = expoAudio.AudioPlayer;
  } catch (e) {
    console.warn('[VoiceRecorder] Failed to load expo-audio:', e);
  }
}

/**
 * Audio configuration for recording
 */
const AUDIO_CONFIG = {
  sampleRate: 44100,
  channelCount: 1, // Mono for voice
  mimeType: 'audio/webm;codecs=opus',
  fallbackMimeType: 'audio/webm',
  // Native recording config
  nativeSampleRate: 44100,
  nativeBufferLength: 4096,
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

  // Audio URL for playback (web) or file URI (native)
  audioUrl: string | null;
  audioBlob: Blob | null;
}

/**
 * Calculate RMS volume level (0-1) from audio data
 */
function calculateAudioLevel(dataArray: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const value = (dataArray[i] - 128) / 128;
    sum += value * value;
  }
  const rms = Math.sqrt(sum / dataArray.length);
  return Math.min(1, rms * 3);
}

/**
 * Calculate RMS from Float32Array (native)
 */
function calculateAudioLevelFloat(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  const rms = Math.sqrt(sum / samples.length);
  return Math.min(1, rms * 3);
}

/**
 * Convert Float32Array audio samples to WAV Blob
 */
function float32ToWavBlob(samples: Float32Array[], sampleRate: number): Blob {
  // Concatenate all samples
  const totalLength = samples.reduce((acc, s) => acc + s.length, 0);
  const combined = new Float32Array(totalLength);
  let offset = 0;
  for (const chunk of samples) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  // Convert to 16-bit PCM
  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = combined.length * bytesPerSample;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Convert samples to 16-bit PCM
  let sampleOffset = headerSize;
  for (let i = 0; i < combined.length; i++) {
    const sample = Math.max(-1, Math.min(1, combined[i]));
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(sampleOffset, intSample, true);
    sampleOffset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Hook for voice recording and playback
 *
 * Uses shared MicrophonePermissionContext for permission state,
 * so granting mic access in Voice Recorder immediately enables Tuner and vice versa.
 */
export function useVoiceRecorder(
  options: UseVoiceRecorderOptions = {}
): UseVoiceRecorderReturn {
  const { onRecordingComplete, onError, onStateChange, onAudioLevel } = options;

  // State
  const [state, setState] = useState<RecorderState>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  // Use shared permission context
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

  // Web refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Native refs
  const nativeRecorderRef = useRef<any>(null);
  const nativePlayerRef = useRef<any>(null);
  const nativeSamplesRef = useRef<Float32Array[]>([]);
  const nativeFileUriRef = useRef<string | null>(null);

  // Shared refs
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const levelTimerRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const playbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Guard refs to prevent race conditions (iOS record button fix)
  const isStartingRef = useRef(false);
  const isStoppingRef = useRef(false);
  const elapsedSecondsRef = useRef(0);

  // Derived state
  const hasRecording = audioBlob !== null;

  // Notify state changes
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  /**
   * Request microphone permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    return contextRequestPermission();
  }, [contextRequestPermission]);

  /**
   * Start audio level monitoring (web)
   */
  const startLevelMonitoringWeb = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      if (!analyserRef.current) return;

      analyser.getByteTimeDomainData(dataArray);
      const level = calculateAudioLevel(dataArray);

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
   * Cleanup native recorder
   */
  const cleanupNativeRecorder = useCallback(() => {
    if (nativeRecorderRef.current) {
      try {
        nativeRecorderRef.current.stop();
      } catch (e) {
        // Ignore cleanup errors
      }
      nativeRecorderRef.current = null;
    }
    if (AudioManager) {
      AudioManager.setAudioSessionActivity(false).catch(() => {});
    }
  }, []);

  /**
   * Cleanup native player
   */
  const cleanupNativePlayer = useCallback(() => {
    if (nativePlayerRef.current) {
      try {
        nativePlayerRef.current.remove();
      } catch (e) {
        // Ignore cleanup errors
      }
      nativePlayerRef.current = null;
    }
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
  }, []);

  /**
   * Start recording - Native iOS/Android
   */
  const startRecordingNative = useCallback(async () => {
    if (!AudioRecorder || !AudioManager) {
      onError?.(new Error('Native audio API not available'));
      setState('error');
      return;
    }

    try {
      console.log('[VoiceRecorder] Starting native recording...');

      // Permission is handled by MicrophonePermissionContext
      // We trust that permission was granted before startRecording() is called
      // Do NOT request permission here - it's already handled by the shared context

      // Configure audio session for recording
      try {
        AudioManager.setAudioSessionOptions({
          iosCategory: 'playAndRecord',
          iosMode: 'default',
          iosOptions: ['defaultToSpeaker', 'allowBluetooth'],
        });
        console.log('[VoiceRecorder] Audio session options configured');
      } catch (optErr) {
        console.warn('[VoiceRecorder] Failed to set audio session options:', optErr);
        // Continue anyway - recording might still work
      }

      try {
        const activated = await AudioManager.setAudioSessionActivity(true);
        console.log('[VoiceRecorder] Audio session activated:', activated);
      } catch (actErr) {
        console.warn('[VoiceRecorder] Failed to activate audio session:', actErr);
        // Continue anyway - might already be active
      }

      // Create recorder with required options
      // AudioRecorder constructor requires { sampleRate, bufferLengthInSamples }
      if (!nativeRecorderRef.current) {
        nativeRecorderRef.current = new AudioRecorder({
          sampleRate: AUDIO_CONFIG.nativeSampleRate,
          bufferLengthInSamples: AUDIO_CONFIG.nativeBufferLength,
        });
      }

      const recorder = nativeRecorderRef.current;
      nativeSamplesRef.current = [];

      // Debug counter for audio callbacks
      let audioCallbackCount = 0;

      // Set up audio callback - onAudioReady takes only a callback function
      recorder.onAudioReady(({ buffer, numFrames }: { buffer: any; numFrames: number }) => {
        audioCallbackCount++;
        // Log first few callbacks to confirm audio is flowing
        if (audioCallbackCount <= 5) {
          console.log(`[VoiceRecorder] onAudioReady #${audioCallbackCount}: numFrames=${numFrames}`);
        }
        try {
          const channelData = buffer.getChannelData(0);
          const samples = new Float32Array(channelData.length);
          for (let i = 0; i < channelData.length; i++) {
            samples[i] = channelData[i];
          }

          // Store samples for later
          nativeSamplesRef.current.push(samples);

          // Calculate level
          const level = calculateAudioLevelFloat(samples);
          // Log level for first few callbacks
          if (audioCallbackCount <= 5) {
            console.log(`[VoiceRecorder] onAudioReady #${audioCallbackCount}: level=${level.toFixed(3)}`);
          }
          setRecording((prev) => ({
            ...prev,
            audioLevel: level,
            audioLevelLeft: level,
            audioLevelRight: level,
          }));
          onAudioLevel?.(level, level);
        } catch (e) {
          console.error('[VoiceRecorder] Error processing audio:', e);
        }
      });

      // Start recording - start() returns void
      recorder.start();
      console.log('[VoiceRecorder] Native recorder started');

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

      // Start timer - keep ref in sync for stopRecordingNative to use
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        elapsedSecondsRef.current = elapsed; // Keep ref in sync (fixes stale closure)

        // Check max duration OUTSIDE of setRecording to avoid state batching issues
        if (elapsed >= MAX_RECORDING_SECONDS) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setRecording((prev) => ({ ...prev, elapsedSeconds: MAX_RECORDING_SECONDS }));
          stopRecording(); // Called outside setState
          return;
        }

        setRecording((prev) => ({ ...prev, elapsedSeconds: elapsed }));
      }, 100);

      console.log('[VoiceRecorder] Native recording started');
    } catch (err) {
      console.error('[VoiceRecorder] Native start failed:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      onError?.(error);
      setState('error');
      cleanupNativeRecorder();
    }
  }, [onError, onAudioLevel, cleanupNativeRecorder]);

  /**
   * Start recording - Web
   */
  const startRecordingWeb = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
          sampleRate: AUDIO_CONFIG.sampleRate,
        },
        video: false,
      });

      streamRef.current = stream;

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      let mimeType = AUDIO_CONFIG.mimeType;
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = AUDIO_CONFIG.fallbackMimeType;
      }

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
        setRecording((prev) => ({ ...prev, blob }));

        const duration = recording.elapsedSeconds;
        setPlayback((prev) => ({ ...prev, duration, currentTime: 0 }));
        onRecordingComplete?.(blob, duration);
      };

      mediaRecorder.onerror = () => {
        onError?.(new Error('Recording failed'));
        setState('error');
      };

      mediaRecorder.start(100);
      setState('recording');

      const startTime = Date.now();
      setRecording({
        startTime,
        elapsedSeconds: 0,
        audioLevel: 0,
        audioLevelLeft: 0,
        audioLevelRight: 0,
        blob: null,
      });

      // Start timer - keep ref in sync
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        elapsedSecondsRef.current = elapsed; // Keep ref in sync

        // Check max duration OUTSIDE of setRecording
        if (elapsed >= MAX_RECORDING_SECONDS) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setRecording((prev) => ({ ...prev, elapsedSeconds: MAX_RECORDING_SECONDS }));
          stopRecording();
          return;
        }

        setRecording((prev) => ({ ...prev, elapsedSeconds: elapsed }));
      }, 100);

      startLevelMonitoringWeb();
      console.log('[VoiceRecorder] Web recording started');
    } catch (err) {
      console.error('[VoiceRecorder] Web start failed:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      onError?.(error);
      setState('error');
    }
  }, [onRecordingComplete, onError, startLevelMonitoringWeb, recording.elapsedSeconds]);

  /**
   * Start recording - platform aware
   *
   * Includes guard to prevent double-start race conditions on iOS.
   */
  const startRecording = useCallback(async () => {
    // Guard against double-start (rapid button presses)
    if (isStartingRef.current) {
      console.log('[VoiceRecorder] startRecording blocked - already starting');
      return;
    }

    isStartingRef.current = true;
    console.log('[VoiceRecorder] startRecording called');

    try {
      // Reset elapsed time ref
      elapsedSecondsRef.current = 0;

      if (Platform.OS === 'web') {
        await startRecordingWeb();
      } else {
        await startRecordingNative();
      }
    } finally {
      isStartingRef.current = false;
    }
  }, [startRecordingWeb, startRecordingNative]);

  /**
   * Stop recording - Native
   *
   * IMPORTANT: Uses elapsedSecondsRef instead of recording.elapsedSeconds
   * to avoid stale closure issues. The callback was being recreated every 100ms
   * due to the timer updating recording.elapsedSeconds, causing race conditions
   * where the stop button wouldn't work reliably on iOS.
   */
  const stopRecordingNative = useCallback(() => {
    console.log('[VoiceRecorder] stopRecordingNative called');

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (nativeRecorderRef.current) {
      try {
        nativeRecorderRef.current.stop();
        console.log('[VoiceRecorder] Native recorder stopped');
      } catch (e) {
        console.warn('[VoiceRecorder] Error stopping recorder:', e);
      }
    }

    // Convert samples to WAV blob
    if (nativeSamplesRef.current.length > 0) {
      const blob = float32ToWavBlob(
        nativeSamplesRef.current,
        AUDIO_CONFIG.nativeSampleRate
      );
      // Use ref instead of state to avoid stale closure (THE KEY FIX)
      const duration = elapsedSecondsRef.current;

      setAudioBlob(blob);
      setAudioUrl(null); // Native doesn't use URL
      setRecording((prev) => ({ ...prev, blob }));
      setPlayback((prev) => ({ ...prev, duration, currentTime: 0 }));
      onRecordingComplete?.(blob, duration);

      console.log('[VoiceRecorder] Native recording stopped, blob size:', blob.size, 'duration:', duration);
    } else {
      console.warn('[VoiceRecorder] No samples recorded');
    }

    // Deactivate audio session
    if (AudioManager) {
      AudioManager.setAudioSessionActivity(false).catch(() => {});
    }

    setState('stopped');
  }, [onRecordingComplete]); // REMOVED recording.elapsedSeconds dependency!

  /**
   * Stop recording - Web
   */
  const stopRecordingWeb = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    stopLevelMonitoring();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setState('stopped');
    console.log('[VoiceRecorder] Web recording stopped');
  }, [stopLevelMonitoring]);

  /**
   * Stop recording - platform aware
   *
   * Includes guard to prevent double-stop race conditions on iOS.
   * This was a key issue: rapid button presses or stale closures could
   * call stopRecording multiple times, causing inconsistent state.
   */
  const stopRecording = useCallback(() => {
    // Guard against double-stop (rapid button presses)
    if (isStoppingRef.current) {
      console.log('[VoiceRecorder] stopRecording blocked - already stopping');
      return;
    }

    isStoppingRef.current = true;
    console.log('[VoiceRecorder] stopRecording called');

    try {
      if (Platform.OS === 'web') {
        stopRecordingWeb();
      } else {
        stopRecordingNative();
      }
    } finally {
      // Reset guard after a small delay to prevent re-entry during state updates
      setTimeout(() => {
        isStoppingRef.current = false;
      }, 100);
    }
  }, [stopRecordingWeb, stopRecordingNative]);

  /**
   * Play recording - Native
   */
  const playNative = useCallback(async () => {
    if (!audioBlob) return;

    try {
      // For native, we need to save the blob to a file first
      // Using expo-file-system
      const FileSystem = require('expo-file-system');
      const { createAudioPlayer } = require('expo-audio');

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);

      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1];

          // Save to temp file
          const fileUri = `${FileSystem.cacheDirectory}voice_memo_${Date.now()}.wav`;
          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          nativeFileUriRef.current = fileUri;

          // Create player
          const player = createAudioPlayer({ uri: fileUri });
          nativePlayerRef.current = player;

          player.play();
          setState('playing');
          setPlayback((prev) => ({ ...prev, isPlaying: true }));

          // Monitor playback position
          playbackTimerRef.current = setInterval(() => {
            if (nativePlayerRef.current) {
              const currentTime = nativePlayerRef.current.currentTime || 0;
              const duration = nativePlayerRef.current.duration || playback.duration;

              setPlayback((prev) => ({
                ...prev,
                currentTime,
                duration,
              }));

              // Check if playback ended
              if (currentTime >= duration && duration > 0) {
                cleanupNativePlayer();
                setState('stopped');
                setPlayback((prev) => ({
                  ...prev,
                  isPlaying: false,
                  currentTime: 0,
                }));
              }
            }
          }, 100);

          console.log('[VoiceRecorder] Native playback started');
        } catch (e) {
          console.error('[VoiceRecorder] Native playback error:', e);
          onError?.(new Error('Playback failed'));
        }
      };
    } catch (err) {
      console.error('[VoiceRecorder] Native play failed:', err);
      onError?.(new Error('Playback not available'));
    }
  }, [audioBlob, playback.duration, onError, cleanupNativePlayer]);

  /**
   * Play recording - Web
   */
  const playWeb = useCallback(() => {
    if (!audioUrl) return;

    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl);
    } else {
      audioElementRef.current.src = audioUrl;
    }

    const audio = audioElementRef.current;
    audio.playbackRate = PLAYBACK_SPEED_MULTIPLIERS[playback.speed];

    audio.ontimeupdate = () => {
      setPlayback((prev) => ({ ...prev, currentTime: audio.currentTime }));
    };

    audio.onended = () => {
      setPlayback((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
      setState('stopped');
    };

    audio.onloadedmetadata = () => {
      setPlayback((prev) => ({ ...prev, duration: audio.duration }));
    };

    audio.play();
    setState('playing');
    setPlayback((prev) => ({ ...prev, isPlaying: true }));
    console.log('[VoiceRecorder] Web playback started');
  }, [audioUrl, playback.speed]);

  /**
   * Play - platform aware
   */
  const play = useCallback(() => {
    if (Platform.OS === 'web') {
      playWeb();
    } else {
      playNative();
    }
  }, [playWeb, playNative]);

  /**
   * Pause playback
   */
  const pause = useCallback(() => {
    if (Platform.OS === 'web') {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    } else {
      if (nativePlayerRef.current) {
        nativePlayerRef.current.pause();
      }
    }
    setState('stopped');
    setPlayback((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  /**
   * Stop playback and reset position
   */
  const stop = useCallback(() => {
    if (Platform.OS === 'web') {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
      }
    } else {
      cleanupNativePlayer();
    }
    setState(hasRecording ? 'stopped' : 'idle');
    setPlayback((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
  }, [hasRecording, cleanupNativePlayer]);

  /**
   * Seek to position
   */
  const seek = useCallback(
    (seconds: number) => {
      const targetTime = Math.max(0, Math.min(seconds, playback.duration));

      if (Platform.OS === 'web') {
        if (audioElementRef.current) {
          audioElementRef.current.currentTime = targetTime;
        }
      } else {
        if (nativePlayerRef.current) {
          nativePlayerRef.current.seekTo(targetTime);
        }
      }
      setPlayback((prev) => ({ ...prev, currentTime: targetTime }));
    },
    [playback.duration]
  );

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
    setPlayback((prev) => ({ ...prev, speed }));

    if (Platform.OS === 'web') {
      if (audioElementRef.current) {
        audioElementRef.current.playbackRate = PLAYBACK_SPEED_MULTIPLIERS[speed];
      }
    } else {
      if (nativePlayerRef.current) {
        nativePlayerRef.current.setPlaybackRate(
          PLAYBACK_SPEED_MULTIPLIERS[speed],
          'high'
        );
      }
    }
  }, []);

  /**
   * Reset recorder to initial state
   */
  const reset = useCallback(() => {
    stop();

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    // Cleanup native file
    if (nativeFileUriRef.current) {
      try {
        const FileSystem = require('expo-file-system');
        FileSystem.deleteAsync(nativeFileUriRef.current, { idempotent: true });
      } catch (e) {
        // Ignore
      }
      nativeFileUriRef.current = null;
    }

    nativeSamplesRef.current = [];

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
    console.log('[VoiceRecorder] Reset');
  }, [audioUrl, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopLevelMonitoring();
      cleanupNativePlayer();
      cleanupNativeRecorder();

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (nativeFileUriRef.current) {
        try {
          const FileSystem = require('expo-file-system');
          FileSystem.deleteAsync(nativeFileUriRef.current, { idempotent: true });
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [audioUrl, stopLevelMonitoring, cleanupNativePlayer, cleanupNativeRecorder]);

  return {
    state,
    recording,
    playback,
    hasRecording,
    hasPermission,
    permissionStatus,
    requestPermission,
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
    audioUrl,
    audioBlob,
  };
}
