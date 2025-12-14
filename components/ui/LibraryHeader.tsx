import React, { useState, ReactNode, useRef } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Styles';
import { PageHeader } from './PageHeader';
import { SearchSuggestions } from './SearchSuggestions';
import type { SongSuggestion } from '@/types/song';

interface LibraryHeaderProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  searchSuggestions: SongSuggestion[];
  onSuggestionSelect: (song: SongSuggestion) => void;
  totalResults?: number;
  isLoading?: boolean;
  recentSuggestions?: SongSuggestion[];
  instrumentFilter?: ReactNode;
  genreFilter?: ReactNode;
}

export const LibraryHeader: React.FC<LibraryHeaderProps> = ({
  searchText,
  onSearchChange,
  searchSuggestions,
  onSuggestionSelect,
  totalResults = searchSuggestions.length,
  isLoading = false,
  recentSuggestions = [],
  instrumentFilter,
  genreFilter,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPressingRef = useRef(false);

  const handleSearchFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleSearchBlur = () => {
    setIsFocused(false);
    // Only close if not actively pressing a suggestion
    setTimeout(() => {
      if (!isPressingRef.current) {
        setShowSuggestions(false);
      }
    }, 150);
  };

  // Determine which suggestions to show
  const isEmptySearch = searchText.length === 0;
  const showRecentOnEmptyFocus = isFocused && isEmptySearch && recentSuggestions.length > 0;
  const displaySuggestions = showRecentOnEmptyFocus ? recentSuggestions : searchSuggestions;
  const displayHeaderLabel = showRecentOnEmptyFocus ? 'RECENT' : undefined;

  // Determine if we should show the dropdown
  const shouldShowDropdown = showSuggestions && (
    isLoading ||
    displaySuggestions.length > 0 ||
    (searchText.length >= 2 && searchSuggestions.length === 0)
  );

  return (
    <PageHeader subtitle="SONGS">
      {/* Filter Deck (The Control Surface) */}
      <View style={styles.filterDeck}>
        {/* Row 1: Search */}
        <View style={[styles.filterRow, { zIndex: 10 }]}>
          <View style={styles.filterCell}>
            <View style={styles.widgetContainer}>
              <Text style={styles.label}>FIND</Text>
              <View style={styles.searchRow}>
                <Search size={16} color={Colors.graphite} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  value={searchText}
                  onChangeText={onSearchChange}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  placeholder="Search songs..."
                  placeholderTextColor={Colors.graphite}
                />
              </View>
            </View>
            {shouldShowDropdown && (
              <SearchSuggestions
                suggestions={displaySuggestions}
                onSelect={onSuggestionSelect}
                onClose={() => setShowSuggestions(false)}
                searchQuery={searchText}
                totalResults={showRecentOnEmptyFocus ? displaySuggestions.length : totalResults}
                isLoading={isLoading && !showRecentOnEmptyFocus}
                headerLabel={displayHeaderLabel}
              />
            )}
          </View>
        </View>

        {/* Row 2: Instrument | Genre */}
        <View style={[styles.filterRow, { zIndex: 1 }]}>
          {instrumentFilter && (
            <View style={styles.filterCell}>
              {instrumentFilter}
            </View>
          )}
          {genreFilter && (
            <View style={styles.filterCell}>
              {genreFilter}
            </View>
          )}
        </View>
      </View>
    </PageHeader>
  );
};

const styles = StyleSheet.create({
  // --- Filter Deck ---
  filterDeck: {
    backgroundColor: '#e8e8e8',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 24,
  },
  filterCell: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
    position: 'relative',
  },
  widgetContainer: {
    width: '100%',
    gap: 6,
  },
  label: Typography.label,
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: Colors.alloy,
    borderRadius: 6,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.5)',
    borderLeftColor: 'rgba(255,255,255,0.5)',
    borderBottomColor: 'rgba(0,0,0,0.15)',
    borderRightColor: 'rgba(0,0,0,0.15)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 24,
    fontSize: 16,
    fontFamily: 'LexendDecaBold',
    color: Colors.charcoal,
  },
});
