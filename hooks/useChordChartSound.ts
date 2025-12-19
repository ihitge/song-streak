/**
 * useChordChartSound - Chord chart interaction sound
 * Uses the shared click sound for consistency with other theory page elements
 */

import { useUISound, AudioSources } from './useUISound';
import { UI_VOLUMES } from '@/constants/Audio';

export function useChordChartSound() {
  return useUISound(AudioSources.sharedClick, UI_VOLUMES.sharedClick);
}
