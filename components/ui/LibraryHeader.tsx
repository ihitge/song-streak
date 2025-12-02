import React, { useState, ReactNode } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { PageHeader } from './PageHeader';
import { SearchSuggestions } from './SearchSuggestions';

interface Song {
  id: string;
  title: string;
  artist: string;
}

interface LibraryHeaderProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  searchSuggestions: Song[];
  onSuggestionSelect: (song: Song) => void;
  difficultyFilter?: ReactNode;
  instrumentFilter?: ReactNode;
  genreFilter?: ReactNode;
}

export const LibraryHeader: React.FC<LibraryHeaderProps> = ({
  searchText,
  onSearchChange,
  searchSuggestions,
  onSuggestionSelect,
  difficultyFilter,
  instrumentFilter,
  genreFilter,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearchFocus = () => {
    setShowSuggestions(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <PageHeader subtitle="LIBRARY">
      {/* Filter Deck (The Control Surface) */}
      <View style={styles.filterDeck}>
        {/* Row 1: Search | Difficulty */}
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
                />
              </View>
            </View>
            {showSuggestions && searchSuggestions.length > 0 && (
              <SearchSuggestions
                suggestions={searchSuggestions}
                onSelect={onSuggestionSelect}
                onClose={() => setShowSuggestions(false)}
              />
            )}
          </View>
          {difficultyFilter && (
            <View style={styles.filterCell}>
              {difficultyFilter}
            </View>
          )}
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
  label: {
    fontSize: 9,
    fontFamily: 'LexendDecaSemiBold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: Colors.warmGray,
  },
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
    fontWeight: 'bold',
    color: Colors.charcoal,
  },
});
