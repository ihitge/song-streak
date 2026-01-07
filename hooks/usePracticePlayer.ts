/**
 * usePracticePlayer Hook
 *
 * Audio playback hook with pitch-preserved speed control for practice.
 * Uses expo-audio for rate control with pitch correction.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
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

  const playerRef = useRef<AudioPlayer | null>(null);
  const loopRegionRef = useRef<LoopRegion>(DEFAULT_LOOP_REGION);
  const statusIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep loopRegionRef in sync with state
  useEffect(() => {
    loopRegionRef.current = loopRegion;
  }, [loopRegion]);

  /**
   * Stop status polling interval
   */
  const stopStatusPolling = useCallback(() => {
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
      statusIntervalRef.current = null;
    }
  }, []);

  /**
   * Start polling for playback status updates
   * expo-audio doesn't have callbacks like expo-av, so we poll
   */
  const startStatusPolling = useCallback(() => {
    stopStatusPolling();

    statusIntervalRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;

      try {
        const positionMs = Math.round(player.currentTime * 1000);
        const durationMs = Math.round(player.duration * 1000);
        const isPlaying = player.playing;

        // Check for loop region
        const currentLoop = loopRegionRef.current;
        if (
          currentLoop.enabled &&
          currentLoop.endMs > currentLoop.startMs &&
          positionMs >= currentLoop.endMs
        ) {
          // Seek back to loop start
          player.seekTo(currentLoop.startMs / 1000);
          return;
        }

        setStatus({
          positionMs,
          durationMs,
          rate: player.playbackRate,
          pitchCorrected: player.shouldCorrectPitch,
          volume: player.volume,
          isPlaying,
          isBuffering: false, // expo-audio doesn't expose buffering state
        });

        // Update state based on playback
        if (isPlaying) {
          setState('playing');
        } else {
          setState((prev) => (prev === 'loading' ? 'ready' : 'paused'));
        }
      } catch (err) {
        console.error('[PracticePlayer] Status polling error:', err);
      }
    }, 100); // Poll every 100ms
  }, [stopStatusPolling]);

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
      // Stop polling and release any existing player
      stopStatusPolling();
      if (playerRef.current) {
        playerRef.current.remove();
        playerRef.current = null;
      }

      setState('loading');
      setError(null);
      setAudioFile(file);

      // Configure audio mode for practice
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'duckOthers',
      });

      // Create the audio player
      const player = createAudioPlayer({ uri: file.uri });

      // Configure initial settings
      player.volume = 1.0;
      player.loop = false; // We handle looping manually for A-B repeat

      // Enable pitch correction for speed changes
      player.setPlaybackRate(1.0, 'high');

      playerRef.current = player;
      setState('ready');

      // Get initial status (wait a moment for duration to be available)
      setTimeout(() => {
        if (playerRef.current) {
          setStatus({
            positionMs: 0,
            durationMs: Math.round(playerRef.current.duration * 1000),
            rate: playerRef.current.playbackRate,
            pitchCorrected: playerRef.current.shouldCorrectPitch,
            volume: playerRef.current.volume,
            isPlaying: false,
            isBuffering: false,
          });
        }
      }, 100);

      // Start polling for status updates
      startStatusPolling();
    } catch (err) {
      console.error('[PracticePlayer] Error loading file:', err);
      setError('Failed to load audio file');
      setState('error');
    }
  }, [stopStatusPolling, startStatusPolling]);

  /**
   * Start playback
   */
  const play = useCallback(async (): Promise<void> => {
    if (!playerRef.current) return;

    try {
      playerRef.current.play();
    } catch (err) {
      console.error('[PracticePlayer] Error playing:', err);
      setError('Failed to play audio');
    }
  }, []);

  /**
   * Pause playback
   */
  const pause = useCallback(async (): Promise<void> => {
    if (!playerRef.current) return;

    try {
      playerRef.current.pause();
    } catch (err) {
      console.error('[PracticePlayer] Error pausing:', err);
      setError('Failed to pause audio');
    }
  }, []);

  /**
   * Toggle play/pause
   */
  const togglePlayPause = useCallback(async (): Promise<void> => {
    if (!playerRef.current) return;

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
    if (!playerRef.current) return;

    try {
      // expo-audio uses seconds, not milliseconds
      playerRef.current.seekTo(positionMs / 1000);
    } catch (err) {
      console.error('[PracticePlayer] Error seeking:', err);
      setError('Failed to seek');
    }
  }, []);

  /**
   * Set playback rate with pitch correction
   */
  const setRate = useCallback(async (rate: number): Promise<void> => {
    if (!playerRef.current) return;

    try {
      // Clamp rate to supported range (expo-audio supports 0.1 to 2.0)
      const clampedRate = Math.max(0.5, Math.min(1.5, rate));
      // Use 'high' pitch correction quality for best results
      playerRef.current.setPlaybackRate(clampedRate, 'high');
    } catch (err) {
      console.error('[PracticePlayer] Error setting rate:', err);
      setError('Failed to set playback speed');
    }
  }, []);

  /**
   * Set volume (0 to 1)
   */
  const setVolume = useCallback(async (volume: number): Promise<void> => {
    if (!playerRef.current) return;

    try {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      playerRef.current.volume = clampedVolume;
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
      stopStatusPolling();
      if (playerRef.current) {
        playerRef.current.remove();
        playerRef.current = null;
      }
      setState('idle');
      setStatus(null);
      setAudioFile(null);
      setError(null);
      setLoopRegionState(DEFAULT_LOOP_REGION);
    } catch (err) {
      console.error('[PracticePlayer] Error unloading:', err);
    }
  }, [stopStatusPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStatusPolling();
      if (playerRef.current) {
        playerRef.current.remove();
      }
    };
  }, [stopStatusPolling]);

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
