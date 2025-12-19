/**
 * useRotaryKnobSound - Rotary knob detent sound
 * Used for rotary controls (genre selector)
 */

import { useUISound, AudioSources } from './useUISound';
import { UI_VOLUMES } from '@/constants/Audio';

export function useRotaryKnobSound() {
  return useUISound(AudioSources.rotaryKnob, UI_VOLUMES.rotaryKnob);
}
