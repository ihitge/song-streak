import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useEffect, useRef, useCallback } from 'react';
import { MetronomeSoundType } from '@/types/metronome';

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
  players: (AudioPlayer | null)[];
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
  playAccent: () => void;
  playTick: () => void;
  playSubdivision: () => void;
  playDrumBeat: (beat: number) => void;
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
   * Load a single audio player instance
   */
  const loadPlayer = (source: any): AudioPlayer | null => {
    try {
      const player = createAudioPlayer(source);
      player.volume = 1.0;
      return player;
    } catch (error) {
      console.error('Failed to load metronome sound:', error);
      return null;
    }
  };

  /**
   * Load a pool of players for one sound role (accent/tick/subdivision)
   */
  const loadPool = (source: any): SoundPool => {
    const players = Array(POOL_SIZE).fill(null).map(() => loadPlayer(source));
    return { players, currentIndex: 0 };
  };

  /**
   * Release all players in a pool
   */
  const releasePool = (pool: SoundPool) => {
    for (const player of pool.players) {
      if (player) {
        try {
          player.remove();
        } catch (error) {
          console.error('Failed to release player:', error);
        }
      }
    }
    pool.players = [];
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
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'duckOthers',
        });

        if (!mounted) return;

        // Load all sound types upfront
        const soundTypes: MetronomeSoundType[] = ['click', 'snare', 'bass', 'hihat'];

        for (const type of soundTypes) {
          if (!mounted) return;

          const sources = getSoundSources(type);

          const accentPool = loadPool(sources.accent);
          if (!mounted) return;

          const tickPool = loadPool(sources.tick);
          if (!mounted) return;

          const subdivisionPool = loadPool(sources.subdivision);
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
        releasePool(pools.accent);
        releasePool(pools.tick);
        releasePool(pools.subdivision);
      });
      allPools.current.clear();
    };
  }, []); // No dependencies - load once!

  /**
   * Play a sound from a pool using round-robin
   * CRITICAL: Fire-and-forget pattern for precise timing - no awaits!
   * Note: Metronome sounds always play, regardless of UI sound settings
   */
  const playFromPool = useCallback(
    (pool: SoundPool) => {
      const players = pool.players;
      if (players.length === 0) return;

      const currentIndex = pool.currentIndex;
      const player = players[currentIndex];
      if (!player) return;

      // Fire and forget - seek to start then play
      try {
        player.seekTo(0);
        player.play();
      } catch {
        // Silent catch - don't block on errors
      }

      // Move to next player in pool immediately (round-robin)
      pool.currentIndex = (currentIndex + 1) % POOL_SIZE;
    },
    []
  );

  /**
   * Play accent sound (for downbeat/beat 1)
   * Synchronous - fire and forget for precise timing
   */
  const playAccent = useCallback(() => {
    const pools = allPools.current.get(soundType);
    if (pools) {
      playFromPool(pools.accent);
    }
  }, [soundType, playFromPool]);

  /**
   * Play tick sound (for regular beats)
   * Synchronous - fire and forget for precise timing
   */
  const playTick = useCallback(() => {
    const pools = allPools.current.get(soundType);
    if (pools) {
      playFromPool(pools.tick);
    }
  }, [soundType, playFromPool]);

  /**
   * Play subdivision sound (for subdivision clicks)
   * Synchronous - fire and forget for precise timing
   */
  const playSubdivision = useCallback(() => {
    const pools = allPools.current.get(soundType);
    if (pools) {
      playFromPool(pools.subdivision);
    }
  }, [soundType, playFromPool]);

  /**
   * Play drum beat for "drums" mode
   * - Hi-hat on all beats
   * - Kick on beats 1 & 3
   * - Snare on beats 2 & 4
   * Synchronous - all sounds fire immediately for precise timing
   */
  const playDrumBeat = useCallback((beat: number) => {
    const hihatPools = allPools.current.get('hihat');
    const kickPools = allPools.current.get('bass');
    const snarePools = allPools.current.get('snare');

    // Always play hi-hat
    if (hihatPools) {
      playFromPool(hihatPools.tick);
    }

    // Kick on beats 1 & 3, Snare on beats 2 & 4
    if (beat === 1 || beat === 3) {
      if (kickPools) {
        playFromPool(kickPools.tick);
      }
    } else if (beat === 2 || beat === 4) {
      if (snarePools) {
        playFromPool(snarePools.tick);
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
