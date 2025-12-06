import { Audio } from 'expo-av';
import { useEffect, useRef } from 'react';
import { useSettingsContext } from '@/ctx/SettingsContext';

export function useGangSwitchSound() {
  const { settings } = useSettingsContext();
  const sound = useRef<Audio.Sound | null>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const loadSound = async () => {
      try {
        if (isLoadingRef.current) return;
        isLoadingRef.current = true;

        // Configure audio mode for ambient sound mixing
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: false,
          staysActiveInBackground: false,
        });

        if (!mounted) return;

        // Load the gang switch click sound
        const { sound: loadedSound } = await Audio.Sound.createAsync(
          require('@/assets/audio/sound-gang-switch.wav'),
        );

        if (mounted) {
          sound.current = loadedSound;
        }
      } catch (error) {
        console.error('Failed to load gang switch sound:', error);
      } finally {
        isLoadingRef.current = false;
      }
    };

    loadSound();

    // Cleanup
    return () => {
      mounted = false;
      if (sound.current) {
        sound.current.unloadAsync().catch((error) => {
          console.error('Failed to unload sound:', error);
        });
        sound.current = null;
      }
    };
  }, []);

  const playSound = async () => {
    // Respect sound settings
    if (!settings.soundEnabled) return;

    if (!sound.current) {
      console.warn('Sound not loaded yet');
      return;
    }

    try {
      // Reset to beginning and play
      await sound.current.stopAsync();
      await sound.current.playAsync();
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  };

  return { playSound };
}
