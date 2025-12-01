import React, { useState, useMemo } from 'react'; // Added useState, useMemo
import { StyleSheet, View, Text, FlatList, Pressable } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Plus, Music, Clock, Star, Guitar, Drum, Keyboard, MinusCircle } from 'lucide-react-native'; // Added specific icons
import { LibraryHeader } from '@/components/ui/LibraryHeader';

// --- Types & Mock Data ---
export type Instrument = 'All' | 'Guitar' | 'Bass' | 'Drums' | 'Keys';
export type Genre = 'All' | 'Rock' | 'Blues' | 'Metal' | 'Prog' | 'Jazz' | 'Country' | 'Pop' | 'Classical' | 'Flamenco' | 'Funk' | 'Folk' | 'Punk' | 'Reggae' | 'Bluegrass';

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

// 2. Song Card (Data Cassette)
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

const INSTRUMENT_FILTER_OPTIONS: Instrument[] = ['All', 'Guitar', 'Bass', 'Drums', 'Keys'];
const INSTRUMENT_FILTER_OPTIONS_WITH_ICONS = [
  { instrument: 'All', IconComponent: MinusCircle },
  { instrument: 'Guitar', IconComponent: Guitar },
  { instrument: 'Bass', IconComponent: Music },
  { instrument: 'Drums', IconComponent: Drum },
  { instrument: 'Keys', IconComponent: Keyboard },
];

const GENRE_FILTER_OPTIONS_WITH_ICONS = [
  { genre: 'All', IconComponent: MinusCircle },
  { genre: 'Rock', IconComponent: Music },
  { genre: 'Blues', IconComponent: Music },
  { genre: 'Metal', IconComponent: Music },
  { genre: 'Prog', IconComponent: Music },
  { genre: 'Jazz', IconComponent: Music },
  { genre: 'Country', IconComponent: Music },
  { genre: 'Pop', IconComponent: Music },
  { genre: 'Classical', IconComponent: Music },
  { genre: 'Flamenco', IconComponent: Music },
  { genre: 'Funk', IconComponent: Music },
  { genre: 'Folk', IconComponent: Music },
  { genre: 'Punk', IconComponent: Music },
  { genre: 'Reggae', IconComponent: Music },
  { genre: 'Bluegrass', IconComponent: Music },
];

// --- Main Screen ---

export default function SetListScreen() {
  const [instrumentFilter, setInstrumentFilter] = useState<Instrument>('All');
  const [genreFilter, setGenreFilter] = useState<Genre>('All');

  const handleInstrumentFilterChange = (instrument: Instrument) => {
    setInstrumentFilter(instrument);
  };

  const handleGenreFilterChange = (genre: Genre) => {
    setGenreFilter(genre);
  };

  const filteredSongs = useMemo(() => {
    return MOCK_SONGS.filter(song => {
      const matchesInstrument = instrumentFilter === 'All' || song.instrument === instrumentFilter;
      const matchesGenre = genreFilter === 'All' || song.genres.includes(genreFilter as Exclude<Genre, 'All'>);
      return matchesInstrument && matchesGenre;
    });
  }, [instrumentFilter, genreFilter]);

  return (
    <View style={styles.container}>
      <LibraryHeader
        instrumentFilter={instrumentFilter}
        onInstrumentFilterChange={handleInstrumentFilterChange}
        instrumentOptions={INSTRUMENT_FILTER_OPTIONS_WITH_ICONS}
        genreFilter={genreFilter}
        onGenreFilterChange={handleGenreFilterChange}
        genreOptions={GENRE_FILTER_OPTIONS_WITH_ICONS}
      />
      {/* Song List */}
      <FlatList
        data={filteredSongs} // Use filteredSongs
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
    padding: 16,
    paddingBottom: 100, // Space for FAB
    gap: 16,
  },
  
  // --- Card (Data Cassette) ---
  cardChassis: {
    backgroundColor: Colors.softWhite,
    borderRadius: 8,
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
    borderRadius: 4,
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