import React, { useState, ReactNode } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { Search, LogOut } from 'lucide-react-native';
import { supabase } from '@/utils/supabase/client';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Styles';
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

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Sign Out Error', error.message);
    }
  };

  const handleSearchFocus = () => {
    setShowSuggestions(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <View style={styles.chassis}>
      {/* 1. Top Bar (Branding & User) */}
      <View style={styles.topBar}>
        {/* Left */}
        <View>
          <Text style={styles.h1Title}>SongStreak</Text>
          <Text style={styles.subtitle}>LIBRARY</Text>
        </View>

        {/* Right (Controls) */}
        <View style={styles.topBarControls}>
          {/* User Avatar */}
          <Pressable style={styles.avatarButton}>
            <Text style={styles.avatarText}>JD</Text>
          </Pressable>
          {/* Logout */}
          <Pressable style={styles.logoutButton} onPress={handleSignOut}>
            <LogOut size={20} color="#333" />
          </Pressable>
        </View>
      </View>

      {/* 2. Filter Deck (The Control Surface) */}
      <View style={styles.filterDeck}>
        {/* Row 1: Search | Difficulty */}
        <View style={[styles.filterRow, { zIndex: 10 }]}>
          <View style={styles.filterCell}>
            <View style={styles.widgetContainer}>
              <Text style={styles.label}>FIND</Text>
              <View style={styles.searchRow}>
                <Search size={16} color="#888" style={styles.searchIcon} />
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
    </View>
  );
};

const styles = StyleSheet.create({
  chassis: {
    backgroundColor: Colors.matteFog, // Chassis Color
    paddingBottom: 0, // No padding at bottom, border handles seam
  },
  // --- 1. Top Bar ---
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24, // px-6
    paddingVertical: 16, // py-4
    // Highlights: border-b border-white (seam at the bottom of the topBar)
    borderBottomWidth: 1,
    borderBottomColor: 'white',
  },
  h1Title: {
    fontFamily: 'MomoTrustDisplay',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    color: Colors.deepSpaceBlue,
  },
  subtitle: Typography.pageSubtitle,
  topBarControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, // Spacing between controls
  },
  avatarButton: {
    width: 32, // w-8
    height: 32, // h-8
    borderRadius: 16, // circular
    backgroundColor: '#e0e0e0', // Recessed or flat look
    justifyContent: 'center',
    alignItems: 'center',
    // Recessed shadow simulation
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#c0c0c0',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    // Styling for circular icon button, can be similar to avatar if desired
    padding: 6, // Make it pressable
  },

  // --- 2. Filter Deck ---
  filterDeck: {
    backgroundColor: '#e8e8e8', // Deck Color: #e8e8e8
    paddingVertical: 16, // py-4
    paddingHorizontal: 24, // px-6
    gap: 12, // Spacing between rows
    // Highlights: border-b border-white (seam at the bottom of the filterDeck)
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
    height: 44, // Increased from 38px by 15%
    backgroundColor: Colors.alloy, // Background for the input field to simulate recessed well
    borderRadius: 6,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.5)', // Lighter (highlight)
    borderLeftColor: 'rgba(255,255,255,0.5)', // Lighter (highlight)
    borderBottomColor: 'rgba(0,0,0,0.15)', // Darker (shadow)
    borderRightColor: 'rgba(0,0,0,0.15)', // Darker (shadow)
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 24, // Adjust input height
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    // No default border (transparent background handled by parent view)
  },
});
