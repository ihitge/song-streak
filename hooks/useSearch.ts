import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { Song, SongSuggestion } from '@/types/song';

// --- Configuration ---
const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 5;

// --- Relevance Scoring ---
type MatchType = 'exact' | 'startsWith' | 'contains' | 'none';

const getMatchType = (text: string, query: string): MatchType => {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();

  if (lower === q) return 'exact';
  if (lower.startsWith(q)) return 'startsWith';
  if (lower.includes(q)) return 'contains';
  return 'none';
};

const calculateRelevanceScore = (song: Song, query: string): number => {
  const titleMatch = getMatchType(song.title, query);
  const artistMatch = getMatchType(song.artist, query);

  // Score weights: exact (100), startsWith (75), contains (50), none (0)
  const matchScores: Record<MatchType, number> = {
    exact: 100,
    startsWith: 75,
    contains: 50,
    none: 0,
  };

  // Title matches weighted higher than artist (1.5x)
  const titleScore = matchScores[titleMatch] * 1.5;
  const artistScore = matchScores[artistMatch];

  return titleScore + artistScore;
};

// --- Search State Types ---
export interface SearchState {
  suggestions: SongSuggestion[];
  totalResults: number;
  isLoading: boolean;
  error: string | null;
  query: string;
  debouncedQuery: string;
}

export interface UseSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  maxResults?: number;
  showRecentOnEmpty?: boolean;
}

export interface UseSearchReturn extends SearchState {
  setQuery: (query: string) => void;
  clearSearch: () => void;
  getRecentSuggestions: () => SongSuggestion[];
}

// --- Hook Implementation ---
export const useSearch = (
  songs: Song[],
  options: UseSearchOptions = {}
): UseSearchReturn => {
  const {
    debounceMs = DEBOUNCE_MS,
    minQueryLength = MIN_QUERY_LENGTH,
    maxResults = MAX_RESULTS,
    showRecentOnEmpty = true,
  } = options;

  // State
  const [query, setQueryState] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error] = useState<string | null>(null);

  // Refs for cleanup
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce the query
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.length < minQueryLength) {
      setDebouncedQuery('');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
      setIsLoading(false);
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, debounceMs, minQueryLength]);

  // Calculate suggestions with relevance scoring
  const { suggestions, totalResults } = useMemo((): { suggestions: SongSuggestion[]; totalResults: number } => {
    if (debouncedQuery.length < minQueryLength) {
      return { suggestions: [], totalResults: 0 };
    }

    const scored = songs
      .map(song => ({
        id: song.id,
        title: song.title,
        artist: song.artist,
        relevanceScore: calculateRelevanceScore(song, debouncedQuery),
      }))
      .filter(s => s.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    return {
      suggestions: scored.slice(0, maxResults),
      totalResults: scored.length,
    };
  }, [songs, debouncedQuery, minQueryLength, maxResults]);

  // Get recent/popular songs for empty focus state
  const getRecentSuggestions = useCallback((): SongSuggestion[] => {
    if (!showRecentOnEmpty) return [];

    // Return first 5 songs as "recent" (in real app, this would be sorted by lastPracticed)
    return songs.slice(0, maxResults).map(song => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
    }));
  }, [songs, maxResults, showRecentOnEmpty]);

  // Actions
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    if (newQuery.length >= minQueryLength) {
      setIsLoading(true);
    }
  }, [minQueryLength]);

  const clearSearch = useCallback(() => {
    setQueryState('');
    setDebouncedQuery('');
    setIsLoading(false);
  }, []);

  return {
    suggestions,
    totalResults,
    isLoading,
    error,
    query,
    debouncedQuery,
    setQuery,
    clearSearch,
    getRecentSuggestions,
  };
};
