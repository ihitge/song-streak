/**
 * usePracticePlayer Hook
 *
 * Audio playback hook with pitch-preserved speed control for practice.
 * Uses expo-av for rate control with shouldCorrectPitch.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import type {
  PlaybackState,
  PlaybackStatus,
  AudioFile,
  LoopRegion,
  UsePracticePlayerReturn,
} from '@/types/practicePlayer';
import {
  DEFAULT_PLAYBACK_STATUS,
  DEFAULT_LOOP_REGION,
  AUDIO_PICKER_TYPES,
} from '@/types/practicePlayer';

/**
 * Hook for audio practice player with pitch-preserved speed control
 */
export function usePracticePlayer(): UsePracticePlayerReturn {
  const [state, setState] = useState<PlaybackState>('idle');
  const [status, setStatus] = useState<PlaybackStatus | null>(null);
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [loopRegion, setLoopRegionState] = useState<LoopRegion>(DEFAULT_LOOP_REGION);
  const [error, setError] = useState<string | null>(null);

  const soundRef = useRef<Audio.Sound | null>(null);
  const loopRegionRef = useRef<LoopRegion>(DEFAULT_LOOP_REGION);

  // Keep loopRegionRef in sync with state
  useEffect(() => {
    loopRegionRef.current = loopRegion;
  }, [loopRegion]);

  /**
   * Handle playback status updates from expo-av
   */
  const onPlaybackStatusUpdate = useCallback((avStatus: AVPlaybackStatus) => {
    if (!avStatus.isLoaded) {
      if (avStatus.error) {
        setError(`Playback error: ${avStatus.error}`);
        setState('error');
      }
      return;
    }

    const successStatus = avStatus as AVPlaybackStatusSuccess;

    // Check for loop region
    const currentLoop = loopRegionRef.current;
    if (
      currentLoop.enabled &&
      currentLoop.endMs > currentLoop.startMs &&
      successStatus.positionMillis >= currentLoop.endMs
    ) {
      // Seek back to loop start
      soundRef.current?.setPositionAsync(currentLoop.startMs);
      return;
    }

    setStatus({
      positionMs: successStatus.positionMillis,
      durationMs: successStatus.durationMillis ?? 0,
      rate: successStatus.rate,
      pitchCorrected: successStatus.shouldCorrectPitch,
      volume: successStatus.volume,
      isPlaying: successStatus.isPlaying,
      isBuffering: successStatus.isBuffering,
    });

    // Update state based on playback
    if (successStatus.isPlaying) {
      setState('playing');
    } else if (successStatus.isLoaded) {
      setState(state === 'loading' ? 'ready' : 'paused');
    }
  }, [state]);

  /**
   * Pick an audio file using document picker
   */
  const pickFile = useCallback(async (): Promise<AudioFile | null> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: AUDIO_PICKER_TYPES,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      const file: AudioFile = {
        uri: asset.uri,
        name: asset.name,
        size: asset.size ?? 0,
        mimeType: asset.mimeType ?? 'audio/mpeg',
      };

      return file;
    } catch (err) {
      console.error('[PracticePlayer] Error picking file:', err);
      setError('Failed to pick audio file');
      return null;
    }
  }, []);

  /**
   * Load an audio file for playback
   */
  const loadFile = useCallback(async (file: AudioFile): Promise<void> => {
    try {
      // Unload any existing sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      setState('loading');
      setError(null);
      setAudioFile(file);

      // Configure audio mode for practice
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Create and load the sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: file.uri },
        {
          shouldPlay: false,
          rate: 1.0,
          shouldCorrectPitch: true,
          volume: 1.0,
          isLooping: false, // We handle looping manually for A-B repeat
          progressUpdateIntervalMillis: 100,
        },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setState('ready');

      // Get initial status
      const initialStatus = await sound.getStatusAsync();
      if (initialStatus.isLoaded) {
        setStatus({
          positionMs: initialStatus.positionMillis,
          durationMs: initialStatus.durationMillis ?? 0,
          rate: initialStatus.rate,
          pitchCorrected: initialStatus.shouldCorrectPitch,
          volume: initialStatus.volume,
          isPlaying: false,
          isBuffering: false,
        });
      }
    } catch (err) {
      console.error('[PracticePlayer] Error loading file:', err);
      setError('Failed to load audio file');
      setState('error');
    }
  }, [onPlaybackStatusUpdate]);

  /**
   * Start playback
   */
  const play = useCallback(async (): Promise<void> => {
    if (!soundRef.current) return;

    try {
      await soundRef.current.playAsync();
    } catch (err) {
      console.error('[PracticePlayer] Error playing:', err);
      setError('Failed to play audio');
    }
  }, []);

  /**
   * Pause playback
   */
  const pause = useCallback(async (): Promise<void> => {
    if (!soundRef.current) return;

    try {
      await soundRef.current.pauseAsync();
    } catch (err) {
      console.error('[PracticePlayer] Error pausing:', err);
      setError('Failed to pause audio');
    }
  }, []);

  /**
   * Toggle play/pause
   */
  const togglePlayPause = useCallback(async (): Promise<void> => {
    if (!soundRef.current) return;

    if (status?.isPlaying) {
      await pause();
    } else {
      await play();
    }
  }, [status?.isPlaying, play, pause]);

  /**
   * Seek to position in milliseconds
   */
  const seekTo = useCallback(async (positionMs: number): Promise<void> => {
    if (!soundRef.current) return;

    try {
      await soundRef.current.setPositionAsync(positionMs);
    } catch (err) {
      console.error('[PracticePlayer] Error seeking:', err);
      setError('Failed to seek');
    }
  }, []);

  /**
   * Set playback rate with pitch correction
   */
  const setRate = useCallback(async (rate: number): Promise<void> => {
    if (!soundRef.current) return;

    try {
      // Clamp rate to supported range
      const clampedRate = Math.max(0.5, Math.min(1.5, rate));
      await soundRef.current.setRateAsync(clampedRate, true); // true = shouldCorrectPitch
    } catch (err) {
      console.error('[PracticePlayer] Error setting rate:', err);
      setError('Failed to set playback speed');
    }
  }, []);

  /**
   * Set volume (0 to 1)
   */
  const setVolume = useCallback(async (volume: number): Promise<void> => {
    if (!soundRef.current) return;

    try {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      await soundRef.current.setVolumeAsync(clampedVolume);
    } catch (err) {
      console.error('[PracticePlayer] Error setting volume:', err);
      setError('Failed to set volume');
    }
  }, []);

  /**
   * Set loop region for A-B repeat
   */
  const setLoopRegion = useCallback((region: Partial<LoopRegion>): void => {
    setLoopRegionState((prev) => ({
      ...prev,
      ...region,
    }));
  }, []);

  /**
   * Clear loop region
   */
  const clearLoopRegion = useCallback((): void => {
    setLoopRegionState(DEFAULT_LOOP_REGION);
  }, []);

  /**
   * Unload audio and reset state
   */
  const unload = useCallback(async (): Promise<void> => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setState('idle');
      setStatus(null);
      setAudioFile(null);
      setError(null);
      setLoopRegionState(DEFAULT_LOOP_REGION);
    } catch (err) {
      console.error('[PracticePlayer] Error unloading:', err);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  return {
    state,
    status,
    audioFile,
    loopRegion,
    error,
    loadFile,
    pickFile,
    play,
    pause,
    togglePlayPause,
    seekTo,
    setRate,
    setVolume,
    setLoopRegion,
    clearLoopRegion,
    unload,
  };
}
