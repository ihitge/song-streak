import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent, ActivityIndicator } from 'react-native';
import { Canvas, Box, BoxShadow, rrect, rect, LinearGradient, vec } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { SearchX, ChevronDown } from 'lucide-react-native';
import { useClickSound } from '@/hooks/useClickSound';
import type { SongSuggestion } from '@/types/song';

// --- Constants ---
const CONTAINER_BORDER_RADIUS = 6;
const CONTAINER_PADDING = 6;
const ITEM_HEIGHT = 52;
const ITEM_BORDER_RADIUS = 4;

// --- Highlighted Text Component ---
interface HighlightedTextProps {
  text: string;
  highlight: string;
  style: object;
  highlightStyle: object;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  highlight,
  style,
  highlightStyle,
}) => {
  if (!highlight || highlight.length < 2) {
    return <Text style={style} numberOfLines={1}>{text}</Text>;
  }

  const lowerText = text.toLowerCase();
  const lowerHighlight = highlight.toLowerCase();
  const index = lowerText.indexOf(lowerHighlight);

  if (index === -1) {
    return <Text style={style} numberOfLines={1}>{text}</Text>;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + highlight.length);
  const after = text.slice(index + highlight.length);

  return (
    <Text style={style} numberOfLines={1}>
      {before}
      <Text style={highlightStyle}>{match}</Text>
      {after}
    </Text>
  );
};

// --- Empty State Component ---
interface EmptyStateProps {
  query: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ query }) => (
  <View style={styles.emptyStateContainer}>
    <SearchX size={24} color={Colors.graphite} />
    <Text style={styles.emptyStateText}>
      No songs match "{query}"
    </Text>
  </View>
);

// --- Loading State Component ---
const LoadingState: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="small" color={Colors.graphite} />
    <Text style={styles.loadingText}>Searching...</Text>
  </View>
);

// --- Suggestion Item Component ---
interface SuggestionItemProps {
  song: SongSuggestion;
  searchQuery: string;
  onSelect: () => void;
  itemWidth: number;
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({
  song,
  searchQuery,
  onSelect,
  itemWidth,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const { playSound } = useClickSound();

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    onSelect();
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={styles.itemOuter}
    >
      <View style={[styles.itemInner, isPressed && styles.itemInnerPressed]}>
        {/* Skia Background */}
        <Canvas style={StyleSheet.absoluteFill}>
          <Box
            box={rrect(rect(0, 0, itemWidth, ITEM_HEIGHT), ITEM_BORDER_RADIUS, ITEM_BORDER_RADIUS)}
            color={isPressed ? Colors.matteFog : Colors.softWhite}
          >
            {!isPressed ? (
              <>
                {/* Raised appearance */}
                <BoxShadow dx={0} dy={2} blur={3} color="rgba(0,0,0,0.12)" />
                <BoxShadow dx={0} dy={-1} blur={1} color="rgba(255,255,255,0.9)" />
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(0, ITEM_HEIGHT)}
                  colors={['#fafafa', '#e8e8e8']}
                />
              </>
            ) : (
              /* Pressed appearance */
              <BoxShadow dx={1} dy={1} blur={3} color="rgba(0,0,0,0.25)" inner />
            )}
          </Box>
        </Canvas>

        {/* Text Content */}
        <View style={styles.itemContent}>
          <HighlightedText
            text={song.title}
            highlight={searchQuery}
            style={styles.titleText}
            highlightStyle={styles.titleTextHighlight}
          />
          <HighlightedText
            text={song.artist}
            highlight={searchQuery}
            style={styles.artistText}
            highlightStyle={styles.artistTextHighlight}
          />
        </View>
      </View>
    </Pressable>
  );
};

// --- Main Component ---
interface SearchSuggestionsProps {
  suggestions: SongSuggestion[];
  onSelect: (song: SongSuggestion) => void;
  onClose: () => void;
  searchQuery: string;
  totalResults?: number;
  maxVisible?: number;
  isLoading?: boolean;
  onShowMore?: () => void;
  headerLabel?: string;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  onSelect,
  onClose,
  searchQuery,
  totalResults = suggestions.length,
  maxVisible = 5,
  isLoading = false,
  onShowMore,
  headerLabel,
}) => {
  const [containerWidth, setContainerWidth] = useState(200);
  const [containerHeight, setContainerHeight] = useState(100);
  const { playSound } = useClickSound();

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerWidth(width);
    setContainerHeight(height);
  };

  const handleSelect = (song: SongSuggestion) => {
    onSelect(song);
    onClose();
  };

  const handleShowMore = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    onShowMore?.();
  };

  // Calculate item width (container width minus padding on both sides minus gap)
  const itemWidth = containerWidth - (CONTAINER_PADDING * 2);

  // Determine what to show
  const showEmpty = !isLoading && searchQuery.length >= 2 && suggestions.length === 0;
  const showResults = !isLoading && suggestions.length > 0;
  const showMoreIndicator = showResults && totalResults > maxVisible;

  // Don't render if nothing to show
  if (!isLoading && suggestions.length === 0 && searchQuery.length < 2) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* Skia Recessed Panel Background */}
      <View style={styles.wellBackground}>
        <Canvas style={StyleSheet.absoluteFill}>
          <Box
            box={rrect(rect(0, 0, containerWidth, containerHeight), CONTAINER_BORDER_RADIUS, CONTAINER_BORDER_RADIUS)}
            color={Colors.alloy}
          >
            <BoxShadow dx={2} dy={2} blur={5} color="rgba(0,0,0,0.15)" inner />
            <BoxShadow dx={-1} dy={-1} blur={3} color="rgba(255,255,255,0.5)" inner />
          </Box>
        </Canvas>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {/* Optional Header Label */}
        {headerLabel && showResults && (
          <Text style={styles.headerLabel}>{headerLabel}</Text>
        )}

        {/* Loading State */}
        {isLoading && <LoadingState />}

        {/* Empty State */}
        {showEmpty && <EmptyState query={searchQuery} />}

        {/* Suggestion Items */}
        {showResults && (
          <View style={styles.itemsContainer}>
            {suggestions.map((song) => (
              <SuggestionItem
                key={song.id}
                song={song}
                searchQuery={searchQuery}
                onSelect={() => handleSelect(song)}
                itemWidth={itemWidth}
              />
            ))}
          </View>
        )}

        {/* Show More Indicator */}
        {showMoreIndicator && (
          <Pressable
            onPress={handleShowMore}
            style={({ pressed }) => [
              styles.showMoreRow,
              pressed && styles.showMoreRowPressed,
            ]}
          >
            <Text style={styles.showMoreText}>
              +{totalResults - maxVisible} more results
            </Text>
            <ChevronDown size={14} color={Colors.graphite} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderRadius: CONTAINER_BORDER_RADIUS,
    overflow: 'hidden',
    zIndex: 1000,
    minHeight: 60,
  },
  wellBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    padding: CONTAINER_PADDING,
  },
  headerLabel: {
    fontSize: 9,
    fontFamily: 'LexendDecaSemiBold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: Colors.warmGray,
    marginBottom: 6,
    marginLeft: 4,
  },
  itemsContainer: {
    gap: 4,
  },
  itemOuter: {
    borderRadius: ITEM_BORDER_RADIUS,
    overflow: 'hidden',
  },
  itemInner: {
    height: ITEM_HEIGHT,
    borderRadius: ITEM_BORDER_RADIUS,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    transform: [{ translateY: -1 }],
  },
  itemInnerPressed: {
    transform: [{ translateY: 1 }],
  },
  itemContent: {
    paddingHorizontal: 12,
    zIndex: 1,
  },
  titleText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.charcoal,
    marginBottom: 2,
  },
  titleTextHighlight: {
    color: Colors.vermilion,
  },
  artistText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.graphite,
  },
  artistTextHighlight: {
    color: Colors.vermilion,
  },
  emptyStateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyStateText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.warmGray,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.graphite,
  },
  showMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    marginTop: 4,
    borderRadius: ITEM_BORDER_RADIUS,
    backgroundColor: 'rgba(255,255,255,0.3)',
    gap: 4,
  },
  showMoreRowPressed: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  showMoreText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.graphite,
  },
});
