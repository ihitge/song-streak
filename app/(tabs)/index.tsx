import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable, Image, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Plus, Music, Clock, Trash2, Users, Link2 } from 'lucide-react-native';
import { useClickSound } from '@/hooks/useClickSound';
import { LibraryHeader } from '@/components/ui/LibraryHeader';
import { FrequencyTuner, GangSwitch, RotaryKnob } from '@/components/ui/filters';
import { instrumentOptions, genreOptions } from '@/config/filterOptions';
import { useSearch } from '@/hooks/useSearch';
import { useFABSound } from '@/hooks/useFABSound';
import { supabase } from '@/utils/supabase/client';
import { useBands } from '@/hooks/useBands';
import { useSetlists } from '@/hooks/useSetlists';
import { BandCard, SetlistCard, CreateBandModal, JoinBandModal } from '@/components/ui/bands';
import { useStyledAlert } from '@/hooks/useStyledAlert';
import type { Instrument, Fluency, Genre } from '@/types/filters';
import type { Song } from '@/types/song';
import type { BandWithMemberCount } from '@/types/band';

// Re-export types for backwards compatibility
export type { Instrument, Fluency, Genre } from '@/types/filters';

const MOCK_SONGS: Song[] = [
  {
    id: '1',
    title: 'Neon Knights',
    artist: 'Black Sabbath',
    duration: '3:53',
    lastPracticed: '2 days ago',
    instrument: 'Guitar',
    genres: ['Metal', 'Rock'],
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/26/d6/fb/26d6fb50-5e33-baf7-98ec-13b167b06387/mzi.bxsjhsxe.jpg/600x600bb.jpg'
  },
  {
    id: '2',
    title: 'Tom Sawyer',
    artist: 'Rush',
    duration: '4:34',
    lastPracticed: 'Yesterday',
    instrument: 'Drums',
    genres: ['Prog', 'Rock'],
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/89/3d/1f/893d1f2b-7690-bc6d-6f0e-c7fc31acf7b4/06UMGIM04263.rgb.jpg/600x600bb.jpg'
  },
  {
    id: '3',
    title: 'Paranoid',
    artist: 'Black Sabbath',
    duration: '2:48',
    lastPracticed: '1 week ago',
    instrument: 'Bass',
    genres: ['Metal', 'Rock'],
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/be/27/91/be279120-2285-16c6-c7ba-9d6643d4a948/075992732727.jpg/600x600bb.jpg'
  },
  {
    id: '4',
    title: 'Master of Puppets',
    artist: 'Metallica',
    duration: '8:35',
    lastPracticed: '3 days ago',
    instrument: 'Guitar',
    genres: ['Metal'],
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/b8/5a/82/b85a8259-60d9-bfaa-770a-2baac8380e87/858978005196.png/600x600bb.jpg'
  },
  {
    id: '5',
    title: 'Comfortably Numb',
    artist: 'Pink Floyd',
    duration: '6:21',
    lastPracticed: 'Just now',
    instrument: 'Keys',
    genres: ['Prog', 'Rock'],
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/3e/17/ec/3e17ec6d-f980-c64f-19e0-a6fd8bbf0c10/886445635850.jpg/600x600bb.jpg'
  },
];

// Library view options
type LibraryView = 'songs' | 'setlists';

const viewOptions = [
  { value: 'songs' as LibraryView, label: 'MY SONGS' },
  { value: 'setlists' as LibraryView, label: 'SETLISTS' },
];

// --- Components ---

// Song Card (Data Cassette)
const SongCard = ({ song, onDelete, onPress }: {
  song: Song;
  onDelete?: (id: string) => void;
  onPress?: () => void;
}) => {
  return (
    <Pressable onPress={onPress} style={styles.cardChassis}>
      <View style={styles.cardBody}>
        {/* Recessed Thumbnail */}
        <View style={styles.thumbnailContainer}>
            {song.artwork ? (
              <Image source={{ uri: song.artwork }} style={styles.thumbnailImage} />
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

        {/* Delete Button (temporary for testing) */}
        {onDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(song.id)}
            activeOpacity={0.7}
          >
            <Trash2 size={18} color={Colors.vermilion} />
          </TouchableOpacity>
        )}
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

  // View toggle state
  const [libraryView, setLibraryView] = useState<LibraryView>('songs');
  const [expandedBandId, setExpandedBandId] = useState<string | null>(null);

  // Modal visibility
  const [showCreateBandModal, setShowCreateBandModal] = useState(false);
  const [showJoinBandModal, setShowJoinBandModal] = useState(false);

  // Bands data
  const { bands, isLoading: isBandsLoading, refresh: refreshBands, createBand, joinBandByCode } = useBands();
  const { setlists, isLoading: isSetlistsLoading, refresh: refreshSetlists } = useSetlists(expandedBandId || undefined);

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

  // Handle song card press - navigate to edit song
  const handleSongPress = useCallback(async (song: Song) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playClickSound();
    router.push(`/add-song?songId=${song.id}`);
  }, [playClickSound, router]);

  // Handle band card press - toggle expansion
  const handleBandPress = useCallback((bandId: string) => {
    setExpandedBandId(prev => prev === bandId ? null : bandId);
  }, []);

  // Handle setlist press - navigate to setlist detail (placeholder)
  const handleSetlistPress = useCallback(async (setlistId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playClickSound();
    // TODO: Navigate to setlist detail screen
    showInfo('Coming Soon', 'Setlist management will be available soon!');
  }, [playClickSound, showInfo]);

  // Handle create band - open modal
  const handleCreateBand = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    setShowCreateBandModal(true);
  }, [playSound]);

  // Handle create band submit
  const handleCreateBandSubmit = useCallback(async (name: string) => {
    const band = await createBand(name);
    if (band) {
      showSuccess('Success', `Band "${band.name}" created!\n\nJoin code: ${band.join_code}\n\nShare this code with your bandmates.`);
    }
  }, [createBand, showSuccess]);

  // Handle join band - open modal
  const handleJoinBand = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    setShowJoinBandModal(true);
  }, [playSound]);

  // Handle join band submit
  const handleJoinBandSubmit = useCallback(async (code: string): Promise<boolean> => {
    const band = await joinBandByCode(code);
    if (band) {
      showSuccess('Success', `You joined "${band.name}"!`);
      return true;
    }
    return false;
  }, [joinBandByCode, showSuccess]);

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
          libraryView === 'songs' ? (
            <FrequencyTuner
              label="INST"
              value={instrument}
              onChange={setInstrument}
              options={instrumentOptions}
            />
          ) : null
        }
        genreFilter={
          libraryView === 'songs' ? (
            <RotaryKnob
              label="GENRE"
              value={genre}
              onChange={setGenre}
              options={genreOptions}
            />
          ) : null
        }
      />

      {/* View Toggle */}
      <View style={styles.viewToggleContainer}>
        <GangSwitch
          label=""
          value={libraryView}
          onChange={(val) => val && setLibraryView(val)}
          options={viewOptions}
          allowDeselect={false}
        />
      </View>

      {/* MY SONGS View */}
      {libraryView === 'songs' && (
        <>
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
        </>
      )}

      {/* SETLISTS View */}
      {libraryView === 'setlists' && (
        <>
          {isBandsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.vermilion} />
              <Text style={styles.loadingText}>Loading bands...</Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.bandsListContent}
              showsVerticalScrollIndicator={false}
            >
              {bands.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Users size={48} color={Colors.graphite} />
                  <Text style={styles.emptyText}>No bands yet</Text>
                  <Text style={styles.emptySubtext}>Create or join a band to share setlists</Text>
                </View>
              ) : (
                bands.map((band) => (
                  <BandCard
                    key={band.id}
                    band={band}
                    onPress={() => handleBandPress(band.id)}
                    expanded={expandedBandId === band.id}
                  >
                    {expandedBandId === band.id && (
                      <>
                        {isSetlistsLoading ? (
                          <View style={styles.setlistLoading}>
                            <ActivityIndicator size="small" color={Colors.vermilion} />
                          </View>
                        ) : setlists.length === 0 ? (
                          <Text style={styles.noSetlistsText}>No setlists yet</Text>
                        ) : (
                          setlists.map((setlist) => (
                            <SetlistCard
                              key={setlist.id}
                              setlist={setlist}
                              onPress={() => handleSetlistPress(setlist.id)}
                              compact
                            />
                          ))
                        )}
                      </>
                    )}
                  </BandCard>
                ))
              )}

              {/* Band Action Buttons */}
              <View style={styles.bandActions}>
                <Pressable style={styles.bandActionButton} onPress={handleCreateBand}>
                  <Plus size={18} color={Colors.vermilion} />
                  <Text style={styles.bandActionText}>Create Band</Text>
                </Pressable>
                <Pressable style={styles.bandActionButton} onPress={handleJoinBand}>
                  <Link2 size={18} color={Colors.vermilion} />
                  <Text style={styles.bandActionText}>Join Band</Text>
                </Pressable>
              </View>
            </ScrollView>
          )}
        </>
      )}

      {/* Hero Action Button - Only show on songs view */}
      {libraryView === 'songs' && (
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
      )}

      {/* Band Modals */}
      <CreateBandModal
        visible={showCreateBandModal}
        onClose={() => setShowCreateBandModal(false)}
        onSubmit={handleCreateBandSubmit}
      />
      <JoinBandModal
        visible={showJoinBandModal}
        onClose={() => setShowJoinBandModal(false)}
        onSubmit={handleJoinBandSubmit}
      />
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
  deleteButton: {
      padding: 8,
      marginLeft: 8,
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

  // --- View Toggle ---
  viewToggleContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },

  // --- Bands List ---
  bandsListContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  setlistLoading: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  noSetlistsText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.graphite,
    textAlign: 'center',
    paddingVertical: 12,
  },
  bandActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
  },
  bandActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.softWhite,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 2,
  },
  bandActionText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 12,
    color: Colors.vermilion,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
