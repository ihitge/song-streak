/**
 * useChordChartSound - Audio feedback hook for chord chart interactions
 * Uses the shared click sound for consistency with other theory page elements
 */

import { Audio } from 'expo-av';
import { useEffect, useRef } from 'react';
import { useSettingsContext } from '@/ctx/SettingsContext';
import { UI_VOLUMES } from '@/constants/Audio';

export function useChordChartSound() {
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

        // Load the shared click sound
        const { sound: loadedSound } = await Audio.Sound.createAsync(
          require('@/assets/audio/sound-shared-click.mp3'),
        );

        if (mounted) {
          sound.current = loadedSound;
        }
      } catch (error) {
        console.error('Failed to load chord chart sound:', error);
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
      console.warn('Chord chart sound not loaded yet');
      return;
    }

    try {
      // Set normalized volume and play
      await sound.current.setVolumeAsync(UI_VOLUMES.sharedClick || 0.5);
      await sound.current.stopAsync();
      await sound.current.playAsync();
    } catch (error) {
      console.error('Failed to play chord chart sound:', error);
    }
  };

  return { playSound };
}
