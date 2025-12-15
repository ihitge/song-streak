import { Audio } from 'expo-av';
import { useEffect, useRef, useCallback } from 'react';
import { MetronomeSoundType } from '@/types/metronome';
import { METRONOME_VOLUMES } from '@/constants/Audio';

// Import all metronome sound files statically
const clickAccent = require('@/assets/audio/sound-click-04.wav');
const clickTick = require('@/assets/audio/sound-click-05.wav');
const clickSubdiv = require('@/assets/audio/sound-click-06.wav');
const snareSound = require('@/assets/audio/metronome-snare.wav');
const kickSound = require('@/assets/audio/metronome-kick.wav');
const hihatSound = require('@/assets/audio/metronome-hihat.wav');

/**
 * Sound pool size - multiple instances for low-latency playback
 */
const POOL_SIZE = 4;

interface SoundPool {
  sounds: (Audio.Sound | null)[];
  currentIndex: number;
}

interface SoundPools {
  accent: SoundPool;
  tick: SoundPool;
  subdivision: SoundPool;
}

interface UseMetronomeSoundOptions {
  soundType?: MetronomeSoundType;
}

interface UseMetronomeSoundReturn {
  playAccent: () => Promise<void>;
  playTick: () => Promise<void>;
  playSubdivision: () => Promise<void>;
  playDrumBeat: (beat: number) => Promise<void>;
  isLoaded: boolean;
}

/**
 * Get sound sources for a specific sound type
 */
function getSoundSources(type: MetronomeSoundType) {
  switch (type) {
    case 'click':
      return {
        accent: clickTick,
        tick: clickTick,
        subdivision: clickTick,
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
 * Loads ALL sound types upfront to avoid race conditions when switching.
 */
export function useMetronomeSound(options: UseMetronomeSoundOptions = {}): UseMetronomeSoundReturn {
  const { soundType = 'click' } = options;
  // Note: Metronome sounds always play, regardless of UI sound settings
  const isLoadingRef = useRef(false);
  const isLoadedRef = useRef(false);

  // Map of sound pools by type - all types loaded upfront
  const allPools = useRef<Map<MetronomeSoundType, SoundPools>>(new Map());

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
   * Load a pool of sounds for one sound role (accent/tick/subdivision)
   */
  const loadPool = async (source: any): Promise<SoundPool> => {
    const promises = Array(POOL_SIZE).fill(null).map(() => loadSound(source));
    const sounds = await Promise.all(promises);
    return { sounds, currentIndex: 0 };
  };

  /**
   * Unload all sounds in a pool
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
   * Load all sound types once on mount
   */
  useEffect(() => {
    let mounted = true;

    const loadAllSounds = async () => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      isLoadedRef.current = false;

      try {
        // Configure audio mode for metronome
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
        });

        if (!mounted) return;

        // Load all sound types upfront
        const soundTypes: MetronomeSoundType[] = ['click', 'snare', 'bass', 'hihat'];

        for (const type of soundTypes) {
          if (!mounted) return;

          const sources = getSoundSources(type);

          const accentPool = await loadPool(sources.accent);
          if (!mounted) return;

          const tickPool = await loadPool(sources.tick);
          if (!mounted) return;

          const subdivisionPool = await loadPool(sources.subdivision);
          if (!mounted) return;

          allPools.current.set(type, {
            accent: accentPool,
            tick: tickPool,
            subdivision: subdivisionPool,
          });
        }

        isLoadedRef.current = true;
      } catch (error) {
        console.error('Failed to load metronome sounds:', error);
      } finally {
        isLoadingRef.current = false;
      }
    };

    loadAllSounds();

    // Cleanup all pools on unmount
    return () => {
      mounted = false;
      allPools.current.forEach((pools) => {
        unloadPool(pools.accent);
        unloadPool(pools.tick);
        unloadPool(pools.subdivision);
      });
      allPools.current.clear();
    };
  }, []); // No dependencies - load once!

  /**
   * Play a sound from a pool using round-robin
   * Note: Metronome sounds always play, regardless of UI sound settings
   */
  const playFromPool = useCallback(
    async (pool: SoundPool, volume: number = 1.0) => {
      const sounds = pool.sounds;
      if (sounds.length === 0) {
        console.warn('Sound pool not loaded');
        return;
      }

      const currentIndex = pool.currentIndex;
      const sound = sounds[currentIndex];

      if (!sound) {
        console.warn('Sound instance not available');
        return;
      }

      try {
        await sound.setVolumeAsync(volume);
        await sound.stopAsync();
        await sound.playAsync();
      } catch (error) {
        console.error('Failed to play sound:', error);
      }

      // Move to next sound in pool (round-robin)
      pool.currentIndex = (currentIndex + 1) % POOL_SIZE;
    },
    []
  );

  /**
   * Play accent sound (for downbeat/beat 1)
   */
  const playAccent = useCallback(async () => {
    const pools = allPools.current.get(soundType);
    if (pools) {
      await playFromPool(pools.accent, METRONOME_VOLUMES.accent);
    }
  }, [soundType, playFromPool]);

  /**
   * Play tick sound (for regular beats)
   */
  const playTick = useCallback(async () => {
    const pools = allPools.current.get(soundType);
    if (pools) {
      await playFromPool(pools.tick, METRONOME_VOLUMES.tick);
    }
  }, [soundType, playFromPool]);

  /**
   * Play subdivision sound (for subdivision clicks)
   */
  const playSubdivision = useCallback(async () => {
    const pools = allPools.current.get(soundType);
    if (pools) {
      await playFromPool(pools.subdivision, METRONOME_VOLUMES.subdivision);
    }
  }, [soundType, playFromPool]);

  /**
   * Play drum beat for "drums" mode
   * - Hi-hat on all beats
   * - Kick on beats 1 & 3
   * - Snare on beats 2 & 4
   */
  const playDrumBeat = useCallback(async (beat: number) => {
    const hihatPools = allPools.current.get('hihat');
    const kickPools = allPools.current.get('bass');
    const snarePools = allPools.current.get('snare');

    // Always play hi-hat
    if (hihatPools) {
      playFromPool(hihatPools.tick, METRONOME_VOLUMES.tick);
    }

    // Kick on beats 1 & 3, Snare on beats 2 & 4
    if (beat === 1 || beat === 3) {
      if (kickPools) {
        playFromPool(kickPools.tick, METRONOME_VOLUMES.accent);
      }
    } else if (beat === 2 || beat === 4) {
      if (snarePools) {
        playFromPool(snarePools.tick, METRONOME_VOLUMES.accent);
      }
    }
  }, [playFromPool]);

  return {
    playAccent,
    playTick,
    playSubdivision,
    playDrumBeat,
    isLoaded: isLoadedRef.current,
  };
}
