import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable, TouchableOpacity, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { SHADOWS, BEVELS, ICON_SIZES, TOUCH_TARGETS } from '@/constants/Styles';
import { Plus, Music, Clock, Trash2, Edit2 } from 'lucide-react-native';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { LibraryHeader } from '@/components/ui/LibraryHeader';
import { PageHeader } from '@/components/ui/PageHeader';
import { DeviceCasing } from '@/components/ui/DeviceCasing';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FrequencyTuner } from '@/components/ui/filters';
import { GlassOverlay } from '@/components/ui/GlassOverlay';
import { InsetShadowOverlay } from '@/components/skia/primitives/InsetShadowOverlay';
import { SurfaceTextureOverlay } from '@/components/skia/primitives/SurfaceTextureOverlay';
import { SongCardSkeletonList } from '@/components/ui/skeleton';
import { instrumentOptions, genreOptions } from '@/config/filterOptions';
import { useSearch } from '@/hooks/useSearch';
import { useSongsQuery } from '@/hooks/queries/useSongsQuery';
import { supabase } from '@/utils/supabase/client';
import { useStyledAlert } from '@/hooks/useStyledAlert';
import type { Instrument, Genre } from '@/types/filters';
import type { Song } from '@/types/song';

// Re-export types for backwards compatibility
export type { Instrument, Fluency, Genre } from '@/types/filters';


// --- Constants for FlatList performance ---
const SONG_CARD_HEIGHT = 98; // Fixed height for getItemLayout optimization

// --- Components ---

// Song Card (Data Cassette) - Memoized to prevent unnecessary re-renders
const SongCard = React.memo(({ song, onDelete, onEdit, onPress }: {
  song: Song;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onPress?: () => void;
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={styles.cardChassis}
      accessibilityLabel={`${song.title} by ${song.artist}`}
      accessibilityRole="button"
      accessibilityHint="Opens song details"
    >
      <View style={styles.cardBody}>
        {/* Recessed Thumbnail */}
        <View style={styles.thumbnailContainer}>
            {song.artwork ? (
              <>
                <Image
                  source={song.artwork}
                  style={styles.thumbnailImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={200}
                />
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
          <Text style={styles.songTitle} maxFontSizeMultiplier={1.3}>{song.title}</Text>
          <Text style={styles.songArtist} maxFontSizeMultiplier={1.3}>{song.artist}</Text>

          <View style={styles.cardMetaRow}>
            <View style={styles.metaItem}>
              <Clock size={12} color={Colors.graphite} />
              <Text style={styles.metaText} maxFontSizeMultiplier={1.2}>{song.duration}</Text>
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
              accessibilityLabel="Edit song"
              accessibilityHint="Opens song editor"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Edit2 size={14} color={Colors.charcoal} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDelete(song.id)}
              activeOpacity={0.7}
              accessibilityLabel="Delete song"
              accessibilityHint="Removes this song from library"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Trash2 size={14} color={Colors.vermilion} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Pressable>
  );
});


// --- Main Screen ---

export default function SetListScreen() {
  const router = useRouter();
  const { showInfo, showError, showConfirm } = useStyledAlert();
  const [instrument, setInstrument] = useState<Instrument>('Guitar');
  const [genre, setGenre] = useState<Genre>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use React Query for songs data with caching
  const {
    songs,
    isLoading,
    error: fetchError,
    refetch,
    invalidate,
  } = useSongsQuery();

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

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
          // Invalidate cache to trigger refetch
          invalidate();
        } catch (err) {
          console.error('Delete error:', err);
          showError('Error', 'Failed to delete song');
        }
      },
      'Delete',
      'Cancel',
      'error'
    );
  }, [invalidate, showInfo, showConfirm, showError]);

  // Handle song card press - navigate to view song
  const handleSongPress = useCallback(async (song: Song) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/add-song?songId=${song.id}`);
  }, [router]);

  // Handle edit button press - navigate to edit song directly in edit mode
  const handleEditSong = useCallback(async (songId: string) => {
    // Check if it's a mock song (IDs 1-5 are mock)
    const mockIds = ['1', '2', '3', '4', '5'];
    if (mockIds.includes(songId)) {
      showInfo('Info', 'Cannot edit demo songs. Only songs you added can be edited.');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/add-song?songId=${songId}&edit=true`);
  }, [router, showInfo]);

  // Memoized renderItem for FlatList performance
  const renderSongCard = useCallback(({ item }: { item: Song }) => (
    <SongCard
      song={item}
      onDelete={handleDeleteSong}
      onEdit={handleEditSong}
      onPress={() => handleSongPress(item)}
    />
  ), [handleDeleteSong, handleEditSong, handleSongPress]);

  // getItemLayout for FlatList scroll performance (fixed height items)
  const getItemLayout = useCallback((data: ArrayLike<Song> | null | undefined, index: number) => ({
    length: SONG_CARD_HEIGHT + 16, // Card height + gap
    offset: (SONG_CARD_HEIGHT + 16) * index,
    index,
  }), []);

  const filteredSongs = useMemo(() => {
    return songs.filter(song => {
      const matchesSearch = searchText === '' ||
        song.title.toLowerCase().includes(searchText.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchText.toLowerCase());
      const matchesInstrument = song.instrument === instrument;
      const matchesGenre = genre === 'All' || (song.genres && song.genres.includes(genre as Exclude<Genre, 'All'>));
      return matchesSearch && matchesInstrument && matchesGenre;
    });
  }, [songs, searchText, instrument, genre]);

  return (
    <View style={styles.container}>
      <PageHeader />

      {/* Dark device casing */}
      <DeviceCasing title="SONG LIBRARY">
        {/* Filter Controls inside dark area */}
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
              variant="light"
            />
          }
          genreFilter={
            <FrequencyTuner
              label="GENRE"
              value={genre}
              onChange={setGenre}
              options={genreOptions}
              showGlassOverlay
              variant="light"
            />
          }
          darkMode
        />
        {isLoading ? (
          <SongCardSkeletonList count={6} />
        ) : fetchError ? (
          <ErrorState
            icon={Music}
            message={fetchError}
            onRetry={refetch}
          />
        ) : (
          <FlatList
            data={filteredSongs}
            keyExtractor={(item) => item.id}
            renderItem={renderSongCard}
            getItemLayout={getItemLayout}
            contentContainerStyle={styles.songListContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={8}
            windowSize={5}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.vermilion}
                colors={[Colors.vermilion]}
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon={Music}
                title="Your library is empty"
                subtitle="Add your first song to start tracking your progress"
              />
            }
          />
        )}

        {/* Hero Action Button - centered at bottom */}
        <View style={styles.fabContainer}>
          <PrimaryButton
            onPress={() => router.push('/add-song')}
            icon={<Plus size={ICON_SIZES.lg} color="#FFFFFF" strokeWidth={2.5} />}
            label="ADD SONG"
            variant="primary"
            size="standard"
            accessibilityLabel="Add new song"
            accessibilityHint="Opens the add song screen"
          />
        </View>
      </DeviceCasing>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ink, // Unified dark casing
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
    borderColor: Colors.border,
    // Raised Shadow
    ...SHADOWS.card,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    // Inner shadow simulation via styling (matching recessed well pattern)
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: Colors.highlights.md, // Lighter (highlight)
    borderLeftColor: Colors.highlights.md, // Lighter (highlight)
    borderBottomColor: Colors.shadows.md, // Darker (shadow)
    borderRightColor: Colors.shadows.md, // Darker (shadow)
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
      backgroundColor: Colors.alloy,
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
      backgroundColor: Colors.shadows.xs, // Charcoal with low opacity
  },
  deleteButton: {
      padding: 8,
      borderRadius: 6,
      backgroundColor: Colors.shadows.sm, // Subtle background for delete action
  },

  // --- Add Song Button Position ---
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },

  // --- Empty State ---
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 18,
    color: Colors.softWhite,
    marginTop: 16,
  },
  emptySubtext: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 14,
    color: Colors.warmGray,
    marginTop: 4,
  },
  // --- Error State ---
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  errorText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 14,
    color: Colors.warmGray,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.vermilion,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 12,
    color: Colors.softWhite,
    letterSpacing: 2,
  },

});
