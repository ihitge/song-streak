import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useEffect } from 'react';
import { useSettingsContext } from '@/ctx/SettingsContext';
import { UI_VOLUMES } from '@/constants/Audio';

export function useFABSound() {
  const { settings } = useSettingsContext();
  const player = useAudioPlayer(require('@/assets/audio/sound-fab.wav'));

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
      console.warn('Sound not loaded yet');
      return;
    }

    try {
      // Set normalized volume, seek to start, and play
      player.volume = UI_VOLUMES.fab;
      player.seekTo(0);
      player.play();
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  };

  return { playSound };
}
