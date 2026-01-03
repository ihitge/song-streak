import { Guitar, Music, Star, MinusCircle } from 'lucide-react-native';
import type { FilterOption, Instrument, Fluency, Genre } from '@/types/filters';

export const instrumentOptions: FilterOption<Instrument>[] = [
  { value: 'Guitar', label: 'Guitar', icon: Guitar },
  { value: 'Bass', label: 'Bass', icon: Music },
];

export const fluencyOptions: FilterOption<Fluency>[] = [
  { value: 'All', label: 'All', icon: MinusCircle },
  { value: 'Learning', label: 'Learn', icon: Star },
  { value: 'Practicing', label: 'Practice', icon: Star },
  { value: 'Comfortable', label: 'Comfort', icon: Star },
  { value: 'Mastered', label: 'Master', icon: Star },
];

export const genreOptions: FilterOption<Genre>[] = [
  { value: 'All', label: 'All', icon: MinusCircle },
  { value: 'Rock', label: 'Rock', icon: Music },
  { value: 'Blues', label: 'Blues', icon: Music },
  { value: 'Metal', label: 'Metal', icon: Music },
  { value: 'Prog', label: 'Prog', icon: Music },
  { value: 'Jazz', label: 'Jazz', icon: Music },
  { value: 'Country', label: 'Country', icon: Music },
  { value: 'Pop', label: 'Pop', icon: Music },
  { value: 'Classical', label: 'Classical', icon: Music },
  { value: 'Flamenco', label: 'Flamenco', icon: Music },
  { value: 'Funk', label: 'Funk', icon: Music },
  { value: 'Folk', label: 'Folk', icon: Music },
  { value: 'Punk', label: 'Punk', icon: Music },
  { value: 'Reggae', label: 'Reggae', icon: Music },
  { value: 'Bluegrass', label: 'Bluegrass', icon: Music },
];
