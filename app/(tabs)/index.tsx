import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable, Image, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Plus, Music, Clock, Trash2, Edit2 } from 'lucide-react-native';
import { useClickSound } from '@/hooks/useClickSound';
import { LibraryHeader } from '@/components/ui/LibraryHeader';
import { FrequencyTuner, RotaryKnob } from '@/components/ui/filters';
import { GlassOverlay } from '@/components/ui/GlassOverlay';
import { InsetShadowOverlay, SurfaceTextureOverlay } from '@/components/skia/primitives';
import { instrumentOptions, genreOptions } from '@/config/filterOptions';
import { useSearch } from '@/hooks/useSearch';
import { useFABSound } from '@/hooks/useFABSound';
import { supabase } from '@/utils/supabase/client';
import { useStyledAlert } from '@/hooks/useStyledAlert';
import type { Instrument, Fluency, Genre } from '@/types/filters';
import type { Song } from '@/types/song';
import type { BandWithMemberCount } from '@/types/band';
import { MOCK_SONGS, isMockSong } from '@/data/mockSongs';

// Re-export types for backwards compatibility
export type { Instrument, Fluency, Genre } from '@/types/filters';


// --- Components ---

// Song Card (Data Cassette)
const SongCard = ({ song, onDelete, onEdit, onPress }: {
  song: Song;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onPress?: () => void;
}) => {
  return (
    <Pressable onPress={onPress} style={styles.cardChassis}>
      <View style={styles.cardBody}>
        {/* Recessed Thumbnail */}
        <View style={styles.thumbnailContainer}>
            {song.artwork ? (
              <>
                <Image source={{ uri: song.artwork }} style={styles.thumbnailImage} />
                {/* Layer 1: Inset shadow for recessed depth */}
                <InsetShadowOverlay width={58} height={58} borderRadius={8} insetDepth={5} shadowIntensity={0.7} variant="dark" />
                {/* Layer 2: Glass overlay */}
                <GlassOverlay width={58} height={58} borderRadius={8} glareOpacity={0.15} specularOpacity={0.225} variant="dark" />
                {/* Layer 3: Surface texture for dust/scratches */}
                <SurfaceTextureOverlay width={58} height={58} borderRadius={8} textureOpacity={0.025} variant="dark" />
              </>
            ) : (
              <Music size={24} color={Colors.graphite} />
            )}
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
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.cardActions}>
          {onEdit && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => onEdit(song.id)}
              activeOpacity={0.7}
            >
              <Edit2 size={14} color={Colors.charcoal} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDelete(song.id)}
              activeOpacity={0.7}
            >
              <Trash2 size={14} color={Colors.vermilion} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Pressable>
  );
};


// --- Main Screen ---

export default function SetListScreen() {
  const router = useRouter();
  const { playSound } = useFABSound();
  const { playSound: playClickSound } = useClickSound();
  const { showInfo, showError, showSuccess, showConfirm } = useStyledAlert();
  const [instrument, setInstrument] = useState<Instrument>('All');
  const [genre, setGenre] = useState<Genre>('All');
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch songs from Supabase
  const fetchSongs = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log('No user logged in, showing mock songs');
        setSongs(MOCK_SONGS);
        setIsLoading(false);
        return;
      }

      console.log('Fetching songs for user:', user.id);
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching songs:', error);
        setSongs(MOCK_SONGS); // Fallback to mock data
      } else {
        console.log('Fetched songs:', data?.length || 0);
        // Map Supabase data to Song type, merge with MOCK_SONGS for demo
        const dbSongs: Song[] = (data || []).map((row: any) => ({
          id: row.id,
          title: row.title,
          artist: row.artist,
          duration: row.duration || '0:00',
          lastPracticed: row.last_practiced || 'Never',
          instrument: row.instrument || 'Guitar',
          genres: row.genres || [],
          artwork: row.artwork_url,
        }));
        // Show DB songs first, then mock songs for demo
        setSongs([...dbSongs, ...MOCK_SONGS]);
      }
    } catch (err) {
      console.error('Fetch songs error:', err);
      setSongs(MOCK_SONGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch songs when screen comes into focus (e.g., after adding a new song)
  useFocusEffect(
    useCallback(() => {
      fetchSongs();
    }, [fetchSongs])
  );

  // Use the search hook for debounced search with relevance scoring
  const {
    query: searchText,
    setQuery: setSearchText,
    suggestions: searchSuggestions,
    totalResults,
    isLoading: isSearchLoading,
    getRecentSuggestions,
  } = useSearch(songs);

  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  const handleSuggestionSelect = (song: { id: string; title: string; artist: string }) => {
    setSearchText(song.title);
  };

  // Get recent suggestions for empty focus state
  const recentSuggestions = getRecentSuggestions();

  // Delete song handler (temporary for testing)
  const handleDeleteSong = useCallback(async (songId: string) => {
    // Check if it's a mock song (IDs 1-5 are mock)
    const mockIds = ['1', '2', '3', '4', '5'];
    if (mockIds.includes(songId)) {
      showInfo('Info', 'Cannot delete demo songs. Only songs you added can be deleted.');
      return;
    }

    showConfirm(
      'Delete Song',
      'Are you sure you want to delete this song?',
      async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await playClickSound();

        try {
          const { error } = await supabase
            .from('songs')
            .delete()
            .eq('id', songId);

          if (error) {
            console.error('Delete error:', error);
            showError('Error', 'Failed to delete song');
            return;
          }

          console.log('Song deleted:', songId);
          // Refresh the list
          fetchSongs();
        } catch (err) {
          console.error('Delete error:', err);
          showError('Error', 'Failed to delete song');
        }
      },
      'Delete',
      'Cancel',
      'error'
    );
  }, [fetchSongs, playClickSound, showInfo, showConfirm, showError]);

  // Handle song card press - navigate to view song
  const handleSongPress = useCallback(async (song: Song) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playClickSound();
    router.push(`/add-song?songId=${song.id}`);
  }, [playClickSound, router]);

  // Handle edit button press - navigate to edit song directly in edit mode
  const handleEditSong = useCallback(async (songId: string) => {
    // Check if it's a mock song (IDs 1-5 are mock)
    const mockIds = ['1', '2', '3', '4', '5'];
    if (mockIds.includes(songId)) {
      showInfo('Info', 'Cannot edit demo songs. Only songs you added can be edited.');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playClickSound();
    router.push(`/add-song?songId=${songId}&edit=true`);
  }, [playClickSound, router, showInfo]);


  const filteredSongs = useMemo(() => {
    return songs.filter(song => {
      const matchesSearch = searchText === '' ||
        song.title.toLowerCase().includes(searchText.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchText.toLowerCase());
      const matchesInstrument = instrument === 'All' || song.instrument === instrument;
      const matchesGenre = genre === 'All' || (song.genres && song.genres.includes(genre as Exclude<Genre, 'All'>));
      return matchesSearch && matchesInstrument && matchesGenre;
    });
  }, [songs, searchText, instrument, genre]);

  return (
    <View style={styles.container}>
      <LibraryHeader
        searchText={searchText}
        onSearchChange={handleSearchChange}
        searchSuggestions={searchSuggestions}
        onSuggestionSelect={handleSuggestionSelect}
        totalResults={totalResults}
        isLoading={isSearchLoading}
        recentSuggestions={recentSuggestions}
        instrumentFilter={
          <FrequencyTuner
            label="INSTRUMENT"
            value={instrument}
            onChange={setInstrument}
            options={instrumentOptions}
            showGlassOverlay
          />
        }
        genreFilter={
          <RotaryKnob
            label="GENRE"
            value={genre}
            onChange={setGenre}
            options={genreOptions}
            showGlassOverlay
          />
        }
      />

      {/* Songs List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.vermilion} />
          <Text style={styles.loadingText}>Loading songs...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSongs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SongCard
              song={item}
              onDelete={handleDeleteSong}
              onEdit={handleEditSong}
              onPress={() => handleSongPress(item)}
            />
          )}
          contentContainerStyle={styles.songListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Music size={48} color={Colors.graphite} />
              <Text style={styles.emptyText}>No songs yet</Text>
              <Text style={styles.emptySubtext}>Tap + to add your first song</Text>
            </View>
          }
        />
      )}

      {/* Hero Action Button */}
      <Pressable
        style={styles.fab}
        onPress={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          await playSound();
          router.push('/add-song');
        }}
      >
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
    padding: 10, // Reduced from 12 (approx 10% reduction vertically)
    alignItems: 'center',
  },
  thumbnailContainer: {
    width: 58, // Increased from 50 by 15%
    height: 58, // Increased from 50 by 15%
    backgroundColor: Colors.alloy, // Etched look - changed to match GangSwitch well
    borderRadius: 8,
    // border: 1, // original
    // borderColor: '#c0c0c0', // original
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    // Inner shadow simulation via styling (matching recessed well pattern)
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.5)', // Lighter (highlight)
    borderLeftColor: 'rgba(255,255,255,0.5)', // Lighter (highlight)
    borderBottomColor: 'rgba(0,0,0,0.15)', // Darker (shadow)
    borderRightColor: 'rgba(0,0,0,0.15)', // Darker (shadow)
    overflow: 'hidden', // Ensure image stays within border radius
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    // No borderRadius needed here as container handles it
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  songTitle: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.ink,
    marginBottom: 2,
  },
  songArtist: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.warmGray,
    marginBottom: 6,
    textTransform: 'uppercase',
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
    fontFamily: 'LexendDecaRegular',
    fontSize: 10,
    color: Colors.warmGray,
    textTransform: 'uppercase',
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
  cardActions: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
  },
  editButton: {
      padding: 8,
      borderRadius: 6,
      backgroundColor: 'rgba(51, 51, 51, 0.08)', // Charcoal with low opacity
  },
  deleteButton: {
      padding: 8,
      borderRadius: 6,
      backgroundColor: 'rgba(238, 108, 77, 0.1)', // Vermilion with low opacity
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

  // --- Loading & Empty States ---
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 14,
    color: Colors.graphite,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 18,
    color: Colors.ink,
    marginTop: 16,
  },
  emptySubtext: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 14,
    color: Colors.graphite,
    marginTop: 4,
  },

});
