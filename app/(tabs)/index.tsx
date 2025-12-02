import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Plus, Music, Clock } from 'lucide-react-native';
import { LibraryHeader } from '@/components/ui/LibraryHeader';
import { FrequencyTuner, GangSwitch, RotaryKnob } from '@/components/ui/filters';
import { instrumentOptions, difficultyOptions, genreOptions } from '@/config/filterOptions';
import type { Instrument, Difficulty, Fluency, Genre } from '@/types/filters';

// Re-export types for backwards compatibility
export type { Instrument, Difficulty, Fluency, Genre } from '@/types/filters';

type Song = {
  id: string;
  title: string;
  artist: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  lastPracticed: string;
  instrument: 'Guitar' | 'Bass' | 'Drums' | 'Keys';
  genres: Exclude<Genre, 'All'>[];
};

const MOCK_SONGS: Song[] = [
  { id: '1', title: 'Neon Knights', artist: 'Black Sabbath', duration: '3:53', difficulty: 'Medium', lastPracticed: '2 days ago', instrument: 'Guitar', genres: ['Metal', 'Rock'] },
  { id: '2', title: 'Tom Sawyer', artist: 'Rush', duration: '4:34', difficulty: 'Hard', lastPracticed: 'Yesterday', instrument: 'Drums', genres: ['Prog', 'Rock'] },
  { id: '3', title: 'Paranoid', artist: 'Black Sabbath', duration: '2:48', difficulty: 'Easy', lastPracticed: '1 week ago', instrument: 'Bass', genres: ['Metal', 'Rock'] },
  { id: '4', title: 'Master of Puppets', artist: 'Metallica', duration: '8:35', difficulty: 'Hard', lastPracticed: '3 days ago', instrument: 'Guitar', genres: ['Metal'] },
  { id: '5', title: 'Comfortably Numb', artist: 'Pink Floyd', duration: '6:21', difficulty: 'Medium', lastPracticed: 'Just now', instrument: 'Keys', genres: ['Prog', 'Rock'] },
];

// --- Components ---

// Song Card (Data Cassette)
const SongCard = ({ song }: { song: Song }) => {
  return (
    <View style={styles.cardChassis}>
      <View style={styles.cardBody}>
        {/* Recessed Thumbnail */}
        <View style={styles.thumbnailContainer}>
            <Music size={24} color={Colors.graphite} />
        </View>

        {/* Card Content */}
        <View style={styles.cardContent}>
          <Text style={styles.songTitle}>{song.title}</Text>
          <Text style={styles.songArtist}>{song.artist}</Text>

          <View style={styles.cardMetaRow}>
            <View style={styles.metaItem}>
              <Clock size={12} color={Colors.graphite} />
              <Text style={styles.metaText}>{song.duration}</Text>
            </View>
            <View style={styles.metaItem}>
               <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(song.difficulty) }]} />
               <Text style={styles.metaText}>{song.difficulty}</Text>
            </View>
          </View>
        </View>

        {/* Decorative "Grip" Lines */}
        <View style={styles.gripLines}>
            <View style={styles.gripLine} />
            <View style={styles.gripLine} />
            <View style={styles.gripLine} />
        </View>
      </View>
    </View>
  );
};

const getDifficultyColor = (diff: Song['difficulty']) => {
    switch(diff) {
        case 'Easy': return '#4CAF50'; // Green
        case 'Medium': return '#FFC107'; // Amber
        case 'Hard': return Colors.vermilion; // Red
        default: return Colors.graphite;
    }
}

// --- Main Screen ---

export default function SetListScreen() {
  const [searchText, setSearchText] = useState('');
  const [instrument, setInstrument] = useState<Instrument>('All');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [genre, setGenre] = useState<Genre>('All');

  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  const handleSuggestionSelect = (song: { id: string; title: string; artist: string }) => {
    setSearchText(song.title);
  };

  const searchSuggestions = useMemo(() => {
    if (searchText.length < 2) return [];
    const query = searchText.toLowerCase();
    return MOCK_SONGS
      .filter(song =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
      )
      .slice(0, 5);
  }, [searchText]);

  const filteredSongs = useMemo(() => {
    return MOCK_SONGS.filter(song => {
      const matchesSearch = searchText === '' ||
        song.title.toLowerCase().includes(searchText.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchText.toLowerCase());
      const matchesInstrument = instrument === 'All' || song.instrument === instrument;
      const matchesDifficulty = difficulty === null || song.difficulty === difficulty;
      const matchesGenre = genre === 'All' || song.genres.includes(genre as Exclude<Genre, 'All'>);
      return matchesSearch && matchesInstrument && matchesDifficulty && matchesGenre;
    });
  }, [searchText, instrument, difficulty, genre]);

  return (
    <View style={styles.container}>
      <LibraryHeader
        searchText={searchText}
        onSearchChange={handleSearchChange}
        searchSuggestions={searchSuggestions}
        onSuggestionSelect={handleSuggestionSelect}
        difficultyFilter={
          <GangSwitch
            label="DIFF"
            value={difficulty}
            onChange={setDifficulty}
            options={difficultyOptions}
          />
        }
        instrumentFilter={
          <FrequencyTuner
            label="INST"
            value={instrument}
            onChange={setInstrument}
            options={instrumentOptions}
          />
        }
        genreFilter={
          <RotaryKnob
            label="GENRE"
            value={genre}
            onChange={setGenre}
            options={genreOptions}
          />
        }
      />

      {/* Song List */}
      <FlatList
        data={filteredSongs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SongCard song={item} />}
        contentContainerStyle={styles.songListContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Hero Action Button */}
      <Pressable style={styles.fab} onPress={() => console.log('Add Song')}>
        <Plus size={32} color={Colors.softWhite} strokeWidth={3} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.matteFog, // Chassis Base
  },
  // --- Song List ---
  songListContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 100,
    gap: 16,
  },

  // --- Card (Data Cassette) ---
  cardChassis: {
    backgroundColor: Colors.softWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    // Raised Shadow
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 0, // Hard shadow for retro feel
    elevation: 4,
    overflow: 'hidden',
  },
  cardBody: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  thumbnailContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#e0e0e0', // Etched look
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c0c0c0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    // Inner shadow simulation via styling
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: '#ccc',
    borderLeftColor: '#ccc',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  songTitle: {
    fontFamily: 'LexendDecaBold',
    fontSize: 16,
    color: Colors.ink,
    marginBottom: 2,
  },
  songArtist: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 14,
    color: Colors.graphite,
    marginBottom: 6,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: Colors.graphite,
  },
  difficultyBadge: {
      width: 6,
      height: 6,
      borderRadius: 3,
  },
  gripLines: {
      justifyContent: 'center',
      gap: 3,
      paddingLeft: 12,
  },
  gripLine: {
      width: 3,
      height: 24,
      backgroundColor: '#d0d0d0',
      borderRadius: 1.5,
  },

  // --- FAB ---
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.vermilion,
    justifyContent: 'center',
    alignItems: 'center',
    // Elevation/Shadow
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#fff', // Ring effect
  },
});
