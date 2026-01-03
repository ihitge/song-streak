import { LucideIcon } from 'lucide-react-native';

// Base option type for all filter components
export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

// Generic filter props - all filters should implement this base pattern
export interface BaseFilterProps<T extends string = string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: FilterOption<T>[];
  disabled?: boolean;
}

// FrequencyTuner-specific props
export interface FrequencyTunerProps<T extends string = string> extends BaseFilterProps<T> {
  showValueLabel?: boolean;
  size?: 'compact' | 'standard';
}

// GangSwitch-specific props
export interface GangSwitchProps<T extends string = string> {
  label: string;
  value: T | null;
  onChange: (value: T | null) => void;
  options: FilterOption<T>[];
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  showIcons?: boolean;
  equalWidth?: boolean;
  allowDeselect?: boolean;
  loadingStates?: Record<T, boolean>;
  dataAvailable?: Record<T, boolean>;
}

// RotaryKnob-specific props
export interface RotaryKnobProps<T extends string = string> extends BaseFilterProps<T> {
  size?: number;
  showNotches?: boolean;
  hapticFeedback?: boolean;
}

// Filter types (moved from index.tsx)
export type Instrument = 'Guitar' | 'Bass';
export type Difficulty = 'All' | 'Easy' | 'Medium' | 'Hard';
export type Fluency = 'All' | 'Learning' | 'Practicing' | 'Comfortable' | 'Mastered';
export type Genre = 'All' | 'Rock' | 'Blues' | 'Metal' | 'Prog' | 'Jazz' | 'Country' | 'Pop' | 'Classical' | 'Flamenco' | 'Funk' | 'Folk' | 'Punk' | 'Reggae' | 'Bluegrass';
