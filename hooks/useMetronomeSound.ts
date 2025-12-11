import { Audio } from 'expo-av';
import { useEffect, useRef, useCallback } from 'react';
import { useSettingsContext } from '@/ctx/SettingsContext';

/**
 * Sound pool size - multiple instances for low-latency playback
 */
const POOL_SIZE = 4;

/**
 * Sound types for metronome
 */
type SoundType = 'accent' | 'tick' | 'subdivision';

interface SoundPool {
  sounds: (Audio.Sound | null)[];
  currentIndex: number;
}

interface UseMetronomeSoundReturn {
  playAccent: () => Promise<void>;
  playTick: () => Promise<void>;
  playSubdivision: () => Promise<void>;
  isLoaded: boolean;
}

/**
 * Hook for metronome sound playback with sound pool pattern
 *
 * Uses multiple pre-loaded sound instances to eliminate stop→seek→play latency.
 * When one sound is playing, the next instance is ready immediately.
 */
export function useMetronomeSound(): UseMetronomeSoundReturn {
  const { settings } = useSettingsContext();
  const isLoadingRef = useRef(false);
  const isLoadedRef = useRef(false);

  // Sound pools for each type
  const accentPool = useRef<SoundPool>({ sounds: [], currentIndex: 0 });
  const tickPool = useRef<SoundPool>({ sounds: [], currentIndex: 0 });
  const subdivisionPool = useRef<SoundPool>({ sounds: [], currentIndex: 0 });

  /**
   * Load a single sound instance
   */
  const loadSound = async (source: any): Promise<Audio.Sound | null> => {
    try {
      const { sound } = await Audio.Sound.createAsync(source, {
        shouldPlay: false,
        volume: 1.0,
      });
      return sound;
    } catch (error) {
      console.error('Failed to load metronome sound:', error);
      return null;
    }
  };

  /**
   * Load all sounds into pools
   */
  useEffect(() => {
    let mounted = true;

    const loadAllSounds = async () => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;

      try {
        // Configure audio mode for metronome
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true, // Critical for metronome
          shouldDuckAndroid: false,
        });

        if (!mounted) return;

        // Load accent sounds (for downbeat)
        // Using existing click sounds - sound-click-04 is a strong click for accents
        const accentSource = require('@/assets/audio/sound-click-04.wav');
        const accentPromises = Array(POOL_SIZE)
          .fill(null)
          .map(() => loadSound(accentSource));
        const accentSounds = await Promise.all(accentPromises);

        if (!mounted) return;
        accentPool.current.sounds = accentSounds;

        // Load tick sounds (for regular beats)
        // Using sound-click-05 for regular beats
        const tickSource = require('@/assets/audio/sound-click-05.wav');
        const tickPromises = Array(POOL_SIZE)
          .fill(null)
          .map(() => loadSound(tickSource));
        const tickSounds = await Promise.all(tickPromises);

        if (!mounted) return;
        tickPool.current.sounds = tickSounds;

        // Load subdivision sounds (for subdivisions - use lighter click)
        const subdivisionSource = require('@/assets/audio/sound-click-06.wav');
        const subdivisionPromises = Array(POOL_SIZE)
          .fill(null)
          .map(() => loadSound(subdivisionSource));
        const subdivisionSounds = await Promise.all(subdivisionPromises);

        if (!mounted) return;
        subdivisionPool.current.sounds = subdivisionSounds;

        isLoadedRef.current = true;
      } catch (error) {
        console.error('Failed to load metronome sounds:', error);
      } finally {
        isLoadingRef.current = false;
      }
    };

    loadAllSounds();

    // Cleanup
    return () => {
      mounted = false;

      const unloadPool = async (pool: SoundPool) => {
        for (const sound of pool.sounds) {
          if (sound) {
            try {
              await sound.unloadAsync();
            } catch (error) {
              console.error('Failed to unload sound:', error);
            }
          }
        }
        pool.sounds = [];
        pool.currentIndex = 0;
      };

      unloadPool(accentPool.current);
      unloadPool(tickPool.current);
      unloadPool(subdivisionPool.current);
    };
  }, []);

  /**
   * Play a sound from a pool using round-robin
   */
  const playFromPool = useCallback(
    async (pool: React.MutableRefObject<SoundPool>, volume: number = 1.0) => {
      // Respect sound settings
      if (!settings.soundEnabled) return;

      const sounds = pool.current.sounds;
      if (sounds.length === 0) {
        console.warn('Sound pool not loaded');
        return;
      }

      const currentIndex = pool.current.currentIndex;
      const sound = sounds[currentIndex];

      if (!sound) {
        console.warn('Sound instance not available');
        return;
      }

      try {
        // Set volume and reset to beginning
        await sound.setVolumeAsync(volume);
        await sound.setPositionAsync(0);
        await sound.playAsync();
      } catch (error) {
        console.error('Failed to play sound:', error);
      }

      // Move to next sound in pool (round-robin)
      pool.current.currentIndex = (currentIndex + 1) % POOL_SIZE;
    },
    [settings.soundEnabled]
  );

  /**
   * Play accent sound (for downbeat/beat 1)
   */
  const playAccent = useCallback(async () => {
    await playFromPool(accentPool, 1.0);
  }, [playFromPool]);

  /**
   * Play tick sound (for regular beats)
   */
  const playTick = useCallback(async () => {
    await playFromPool(tickPool, 0.8);
  }, [playFromPool]);

  /**
   * Play subdivision sound (for subdivision clicks)
   */
  const playSubdivision = useCallback(async () => {
    await playFromPool(subdivisionPool, 0.5);
  }, [playFromPool]);

  return {
    playAccent,
    playTick,
    playSubdivision,
    isLoaded: isLoadedRef.current,
  };
}
