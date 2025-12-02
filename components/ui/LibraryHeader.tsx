import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { Search, LogOut } from 'lucide-react-native';
import { supabase } from '@/utils/supabase/client';
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
}

export const LibraryHeader: React.FC<LibraryHeaderProps> = ({
  searchText,
  onSearchChange,
  searchSuggestions,
  onSuggestionSelect,
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
          <Text style={styles.h1Title}>SONG STREAK</Text>
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
        {/* Search Row with Suggestions */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchRow}>
            <Search size={16} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="SEARCH"
              placeholderTextColor="#888"
              value={searchText}
              onChangeText={onSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
          </View>
          {showSuggestions && searchSuggestions.length > 0 && (
            <SearchSuggestions
              suggestions={searchSuggestions}
              onSelect={onSuggestionSelect}
              onClose={() => setShowSuggestions(false)}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chassis: {
    backgroundColor: '#e6e6e6', // Chassis Color: #e6e6e6
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
    fontSize: 20, // Adjust size as needed for H1
    fontWeight: 'bold',
    letterSpacing: -1, // tight tracking
    color: '#333', // #333 (Primary)
  },
  subtitle: {
    fontSize: 10, // 10px
    fontFamily: 'SpaceMono', // monospace (using SpaceMono which is in project)
    textTransform: 'uppercase', // uppercase
    letterSpacing: 2, // tracking-widest
    color: '#888', // #888 (Labels/Secondary)
  },
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
    // Highlights: border-b border-white (seam at the bottom of the filterDeck)
    borderBottomWidth: 1,
    borderBottomColor: 'white',
  },
  searchWrapper: {
    position: 'relative',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0', // Background for the input field to simulate recessed well
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    // Shadow for recessed input
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#c0c0c0',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: '#f0f0f0',
    borderRightColor: '#f0f0f0',
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
