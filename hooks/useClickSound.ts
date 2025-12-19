/**
 * useClickSound - General UI click sound
 * Used for secondary UI interactions (search suggestions, page header buttons, etc.)
 */

import { useUISound, AudioSources } from './useUISound';
import { UI_VOLUMES } from '@/constants/Audio';

export function useClickSound() {
  return useUISound(AudioSources.sharedClick, UI_VOLUMES.sharedClick);
}
