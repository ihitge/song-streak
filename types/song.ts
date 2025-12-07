import type { Genre } from './filters';

// Full Song type for the library
export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  lastPracticed: string;
  instrument: 'Guitar' | 'Bass' | 'Drums' | 'Keys';
  genres: Exclude<Genre, 'All'>[];
  artwork?: string;
}

// Minimal song data for search suggestions
export interface SongSuggestion {
  id: string;
  title: string;
  artist: string;
  relevanceScore?: number;
}
