/**
 * useChordChartSound - Audio feedback hook for chord chart interactions
 * Uses the shared click sound for consistency with other theory page elements
 */

import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useEffect } from 'react';
import { useSettingsContext } from '@/ctx/SettingsContext';
import { UI_VOLUMES } from '@/constants/Audio';

export function useChordChartSound() {
  const { settings } = useSettingsContext();
  const player = useAudioPlayer(require('@/assets/audio/sound-shared-click.mp3'));

  useEffect(() => {
    // Configure audio mode for ambient sound mixing
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    });
  }, []);

  const playSound = async () => {
    // Respect sound settings
    if (!settings.soundEnabled) return;

    if (!player) {
      console.warn('Chord chart sound not loaded yet');
      return;
    }

    try {
      // Set normalized volume, seek to start, and play
      player.volume = UI_VOLUMES.sharedClick || 0.5;
      player.seekTo(0);
      player.play();
    } catch (error) {
      console.error('Failed to play chord chart sound:', error);
    }
  };

  return { playSound };
}
