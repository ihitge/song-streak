import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { Search, Guitar, Signal, Music, LogOut, ChevronDown, MinusCircle, Star } from 'lucide-react-native';
import { SelectorKey } from './SelectorKey';
import { InstrumentPicker } from './InstrumentPicker'; // Restored InstrumentPicker import
import { supabase } from '@/utils/supabase/client';
import { Instrument, Difficulty, Fluency, Genre } from '@/app/(tabs)/index';
import { GenrePicker } from './GenrePicker';
import { DifficultyPicker } from './DifficultyPicker';
import { FluencyPicker } from './FluencyPicker';

interface LibraryHeaderProps {
  instrumentFilter: Instrument;
  onInstrumentFilterChange: (instrument: Instrument) => void;
  instrumentOptions: { instrument: Instrument; IconComponent: React.ComponentType<any>; }[];
  difficultyFilter: Difficulty;
  onDifficultyFilterChange: (difficulty: Difficulty) => void;
  difficultyOptions: { difficulty: Difficulty; IconComponent: React.ComponentType<any>; }[];
  fluencyFilter: Fluency;
  onFluencyFilterChange: (fluency: Fluency) => void;
  fluencyOptions: { fluency: Fluency; IconComponent: React.ComponentType<any>; }[];
  genreFilter: Genre;
  onGenreFilterChange: (genre: Genre) => void;
  genreOptions: { genre: Genre; IconComponent: React.ComponentType<any>; }[];
}

export const LibraryHeader: React.FC<LibraryHeaderProps> = ({
  instrumentFilter,
  onInstrumentFilterChange,
  instrumentOptions,
  difficultyFilter,
  onDifficultyFilterChange,
  difficultyOptions,
  fluencyFilter,
  onFluencyFilterChange,
  fluencyOptions,
  genreFilter,
  onGenreFilterChange,
  genreOptions,
}) => {
  const [searchText, setSearchText] = useState('');
  const [showInstrumentOptions, setShowInstrumentOptions] = useState(false);
  const [showDifficultyOptions, setShowDifficultyOptions] = useState(false);
  const [showFluencyOptions, setShowFluencyOptions] = useState(false);
  const [showGenreOptions, setShowGenreOptions] = useState(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Sign Out Error', error.message);
    }
  };

  const handleInstSelectorPress = () => {
    setShowInstrumentOptions(prev => !prev);
    setShowDifficultyOptions(false);
    setShowFluencyOptions(false);
    setShowGenreOptions(false);
  };

  const handleInstrumentSelect = (instrument: Instrument) => {
    onInstrumentFilterChange(instrument);
    setShowInstrumentOptions(false);
  };

  const handleDifficultySelectorPress = () => {
    setShowDifficultyOptions(prev => !prev);
    setShowInstrumentOptions(false);
    setShowFluencyOptions(false);
    setShowGenreOptions(false);
  };

  const handleDifficultySelect = (difficulty: Difficulty) => {
    onDifficultyFilterChange(difficulty);
    setShowDifficultyOptions(false);
  };

  const handleFluencySelectorPress = () => {
    setShowFluencyOptions(prev => !prev);
    setShowInstrumentOptions(false);
    setShowDifficultyOptions(false);
    setShowGenreOptions(false);
  };

  const handleFluencySelect = (fluency: Fluency) => {
    onFluencyFilterChange(fluency);
    setShowFluencyOptions(false);
  };

  const handleGenreSelectorPress = () => {
    setShowGenreOptions(prev => !prev);
    setShowInstrumentOptions(false);
    setShowDifficultyOptions(false);
    setShowFluencyOptions(false);
  };

  const handleGenreSelect = (genre: Genre) => {
    onGenreFilterChange(genre);
    setShowGenreOptions(false);
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
        {/* Search Row */}
        <View style={styles.searchRow}>
          <Search size={16} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="SEARCH"
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Filter Keys (Row of 4) */}
        <View style={styles.filterKeysRow}>
          <View style={{ position: 'relative', zIndex: 100 }}>
            <SelectorKey
              label="INST"
              value={instrumentFilter}
              IconComponent={instrumentOptions.find(opt => opt.instrument === instrumentFilter)?.IconComponent || MinusCircle}
              onPress={handleInstSelectorPress}
            />
            {showInstrumentOptions && (
              <InstrumentPicker
                options={instrumentOptions}
                onSelect={handleInstrumentSelect}
                onClose={() => setShowInstrumentOptions(false)}
                currentValue={instrumentFilter}
              />
            )}
          </View>
          <View style={{ position: 'relative', zIndex: 99 }}>
            <SelectorKey
              label="DIFFICULTY"
              value={difficultyFilter}
              IconComponent={difficultyOptions.find(opt => opt.difficulty === difficultyFilter)?.IconComponent || Signal}
              onPress={handleDifficultySelectorPress}
            />
            {showDifficultyOptions && (
              <DifficultyPicker
                options={difficultyOptions}
                onSelect={handleDifficultySelect}
                onClose={() => setShowDifficultyOptions(false)}
                currentValue={difficultyFilter}
              />
            )}
          </View>
          <View style={{ position: 'relative', zIndex: 98 }}>
            <SelectorKey
              label="FLUENCY"
              value={fluencyFilter}
              IconComponent={fluencyOptions.find(opt => opt.fluency === fluencyFilter)?.IconComponent || Star}
              onPress={handleFluencySelectorPress}
            />
            {showFluencyOptions && (
              <FluencyPicker
                options={fluencyOptions}
                onSelect={handleFluencySelect}
                onClose={() => setShowFluencyOptions(false)}
                currentValue={fluencyFilter}
              />
            )}
          </View>
          <View style={{ position: 'relative', zIndex: 97 }}>
            <SelectorKey
              label="GENRE"
              value={genreFilter}
              IconComponent={genreOptions.find(opt => opt.genre === genreFilter)?.IconComponent || Music}
              onPress={handleGenreSelectorPress}
            />
            {showGenreOptions && (
              <GenrePicker
                options={genreOptions}
                onSelect={handleGenreSelect}
                onClose={() => setShowGenreOptions(false)}
                currentValue={genreFilter}
              />
            )}
          </View>
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
    marginBottom: 16, // Spacing before divider
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
  divider: {
    height: 1, // 1px
    backgroundColor: 'white', // 1px white horizontal line
    marginVertical: 16, // Spacing around divider
  },
  filterKeysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 8,
  },
});
