import { Audio } from 'expo-av';
import { useEffect, useRef, useCallback } from 'react';
import { useSettingsContext } from '@/ctx/SettingsContext';
import { MetronomeSoundType } from '@/types/metronome';

// Import all metronome sound files statically
const clickSound = require('@/assets/audio/metronome-click.wav');
const snareSound = require('@/assets/audio/metronome-snare.wav');
const kickSound = require('@/assets/audio/metronome-kick.wav');
const hihatSound = require('@/assets/audio/metronome-hihat.wav');

// Legacy click sounds as fallback
const clickAccent = require('@/assets/audio/sound-click-04.wav');
const clickTick = require('@/assets/audio/sound-click-05.wav');
const clickSubdiv = require('@/assets/audio/sound-click-06.wav');

/**
 * Sound pool size - multiple instances for low-latency playback
 */
const POOL_SIZE = 4;

interface SoundPool {
  sounds: (Audio.Sound | null)[];
  currentIndex: number;
}

interface UseMetronomeSoundOptions {
  soundType?: MetronomeSoundType;
}

interface UseMetronomeSoundReturn {
  playAccent: () => Promise<void>;
  playTick: () => Promise<void>;
  playSubdivision: () => Promise<void>;
  isLoaded: boolean;
}

/**
 * Get sound sources based on sound type
 * Maps each metronome sound type to its corresponding drum sample
 */
function getSoundSources(soundType: MetronomeSoundType) {
  switch (soundType) {
    case 'click':
      return {
        accent: clickAccent,
        tick: clickTick,
        subdivision: clickSubdiv,
      };
    case 'snare':
      return {
        accent: snareSound,
        tick: snareSound,
        subdivision: snareSound,
      };
    case 'bass':
      return {
        accent: kickSound,
        tick: kickSound,
        subdivision: kickSound,
      };
    case 'hihat':
      return {
        accent: hihatSound,
        tick: hihatSound,
        subdivision: hihatSound,
      };
    default:
      // Fallback to click
      return {
        accent: clickAccent,
        tick: clickTick,
        subdivision: clickSubdiv,
      };
  }
}

/**
 * Hook for metronome sound playback with sound pool pattern
 *
 * Uses multiple pre-loaded sound instances to eliminate stop→seek→play latency.
 * When one sound is playing, the next instance is ready immediately.
 */
export function useMetronomeSound(options: UseMetronomeSoundOptions = {}): UseMetronomeSoundReturn {
  const { soundType = 'click' } = options;
  const { settings } = useSettingsContext();
  const isLoadingRef = useRef(false);
  const isLoadedRef = useRef(false);
  const currentSoundTypeRef = useRef<MetronomeSoundType>(soundType);

  // Sound pools for each type
  const accentPool = useRef<SoundPool>({ sounds: [], currentIndex: 0 });
  const tickPool = useRef<SoundPool>({ sounds: [], currentIndex: 0 });
  const subdivisionPool = useRef<SoundPool>({ sounds: [], currentIndex: 0 });

  /**
   * Load a single sound instance
   */
  const loadSound = async (source: any): Promise<Audio.Sound | null> => {
    try {
      console.log('Loading metronome sound:', source);
      const { sound } = await Audio.Sound.createAsync(source, {
        shouldPlay: false,
        volume: 1.0,
      });
      console.log('Successfully loaded metronome sound');
      return sound;
    } catch (error) {
      console.error('Failed to load metronome sound:', error, 'source:', source);
      return null;
    }
  };

  /**
   * Unload a sound pool
   */
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

  /**
   * Load all sounds into pools
   */
  useEffect(() => {
    let mounted = true;

    const loadAllSounds = async () => {
      // Skip if already loading or if sound type hasn't changed
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;
      isLoadedRef.current = false;

      try {
        // Unload existing sounds if changing sound type
        if (currentSoundTypeRef.current !== soundType) {
          await unloadPool(accentPool.current);
          await unloadPool(tickPool.current);
          await unloadPool(subdivisionPool.current);
        }
        currentSoundTypeRef.current = soundType;

        // Configure audio mode for metronome
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true, // Critical for metronome
          shouldDuckAndroid: false,
        });

        if (!mounted) return;

        // Get sound sources based on sound type
        let sources;
        try {
          sources = getSoundSources(soundType);
          console.log('Sound type:', soundType, 'sources resolved:', Object.keys(sources));
        } catch (e) {
          console.error('Error getting sound sources for type:', soundType, e);
          throw e;
        }

        // Load accent sounds (for downbeat)
        const accentPromises = Array(POOL_SIZE)
          .fill(null)
          .map(() => loadSound(sources.accent));
        const accentSounds = await Promise.all(accentPromises);

        if (!mounted) return;
        accentPool.current.sounds = accentSounds;

        // Load tick sounds (for regular beats)
        const tickPromises = Array(POOL_SIZE)
          .fill(null)
          .map(() => loadSound(sources.tick));
        const tickSounds = await Promise.all(tickPromises);

        if (!mounted) return;
        tickPool.current.sounds = tickSounds;

        // Load subdivision sounds
        const subdivisionPromises = Array(POOL_SIZE)
          .fill(null)
          .map(() => loadSound(sources.subdivision));
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
      unloadPool(accentPool.current);
      unloadPool(tickPool.current);
      unloadPool(subdivisionPool.current);
    };
  }, [soundType]);

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
