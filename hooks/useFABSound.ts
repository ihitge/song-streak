/**
 * useFABSound - Floating action button sound
 * Used for primary call-to-action buttons (+ Add Song)
 */

import { useUISound, AudioSources } from './useUISound';
import { UI_VOLUMES } from '@/constants/Audio';

export function useFABSound() {
  return useUISound(AudioSources.fab, UI_VOLUMES.fab);
}
