/**
 * useGangSwitchSound - Toggle switch sound
 * Used for filter toggle switches (difficulty, fluency selectors)
 */

import { useUISound, AudioSources } from './useUISound';
import { UI_VOLUMES } from '@/constants/Audio';

export function useGangSwitchSound() {
  return useUISound(AudioSources.gangSwitch, UI_VOLUMES.gangSwitch);
}
