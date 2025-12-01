import React from 'react';
import { StyleSheet, View, Text, FlatList, Pressable } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Plus, Music, Clock, Star } from 'lucide-react-native'; // Re-added Star for SongCard
import { LibraryHeader } from '@/components/ui/LibraryHeader'; // Minimal LibraryHeader is here

// --- Types & Mock Data ---
type Song = {
  id: string;
  title: string;
  artist: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  lastPracticed: string;
};

const MOCK_SONGS: Song[] = [
  { id: '1', title: 'Neon Knights', artist: 'Black Sabbath', duration: '3:53', difficulty: 'Medium', lastPracticed: '2 days ago' },
  { id: '2', title: 'Tom Sawyer', artist: 'Rush', duration: '4:34', difficulty: 'Hard', lastPracticed: 'Yesterday' },
  { id: '3', title: 'Paranoid', artist: 'Black Sabbath', duration: '2:48', difficulty: 'Easy', lastPracticed: '1 week ago' },
  { id: '4', title: 'Master of Puppets', artist: 'Metallica', duration: '8:35', difficulty: 'Hard', lastPracticed: '3 days ago' },
  { id: '5', title: 'Comfortably Numb', artist: 'Pink Floyd', duration: '6:21', difficulty: 'Medium', lastPracticed: 'Just now' },
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

// --- Main Screen ---

export default function SetListScreen() {
  return (
    <View style={styles.container}>
      <LibraryHeader />{/* The minimal LibraryHeader */}
      {/* Song List */}
      <FlatList
        data={MOCK_SONGS}
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
    fontFamily: 'SpaceGroteskBold',
    fontSize: 16,
    color: Colors.ink,
    marginBottom: 2,
  },
  songArtist: {
    fontFamily: 'SpaceGroteskRegular',
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