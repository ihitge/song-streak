/**
 * useUISound - Base hook for UI sound feedback
 *
 * This is the consolidated base hook that all UI sound hooks use internally.
 * It provides consistent audio playback with settings-aware volume control.
 *
 * Usage:
 *   const { playSound } = useUISound(audioSource, volumeLevel);
 *
 * For component-specific hooks, use the wrapper hooks:
 *   - useClickSound() - General UI clicks
 *   - useNavButtonSound() - Primary navigation buttons
 *   - useGangSwitchSound() - Toggle switches
 *   - useFABSound() - Floating action button
 *   - useRotaryKnobSound() - Rotary knob detents
 *   - useChordChartSound() - Chord chart interactions
 */

import { useAudioPlayer, setAudioModeAsync, AudioSource } from 'expo-audio';
import { useEffect, useCallback } from 'react';
import { useSettingsContext } from '@/ctx/SettingsContext';
import { logger } from '@/utils/logger';

/**
 * Base hook for UI sound playback
 * @param audioSource - The audio file to play (use require())
 * @param volume - Volume level (0.0 to 1.0)
 * @returns Object with playSound function
 */
export function useUISound(audioSource: AudioSource, volume: number = 0.5) {
  const { settings } = useSettingsContext();
  const player = useAudioPlayer(audioSource);

  useEffect(() => {
    // Configure audio mode for ambient sound mixing
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    });
  }, []);

  const playSound = useCallback(async () => {
    // Respect sound settings
    if (!settings.soundEnabled) return;

    if (!player) {
      logger.warn('Sound not loaded yet');
      return;
    }

    try {
      // Set normalized volume, seek to start, and play
      player.volume = volume;
      player.seekTo(0);
      player.play();
    } catch (error) {
      logger.error('Failed to play sound:', error);
    }
  }, [player, volume, settings.soundEnabled]);

  return { playSound };
}

// Export audio sources for use by wrapper hooks
export const AudioSources = {
  sharedClick: require('@/assets/audio/sound-shared-click.mp3'),
  navButton: require('@/assets/audio/sound-nav-button.wav'),
  gangSwitch: require('@/assets/audio/sound-gang-switch.wav'),
  fab: require('@/assets/audio/sound-fab.wav'),
  rotaryKnob: require('@/assets/audio/sound-rotary-knob.wav'),
} as const;
