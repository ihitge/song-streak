/**
 * useNavButtonSound - Primary navigation button sound
 * Used for large navigation buttons (STREAK, SETLIST, METRONOME)
 */

import { useUISound, AudioSources } from './useUISound';
import { UI_VOLUMES } from '@/constants/Audio';

export function useNavButtonSound() {
  return useUISound(AudioSources.navButton, UI_VOLUMES.navButton);
}
