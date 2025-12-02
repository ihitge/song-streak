import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Styles';
import { GangSwitch } from '@/components/ui/filters/GangSwitch';
import { Mic, BookOpen, StickyNote, LogOut } from 'lucide-react-native';
import { FilterOption } from '@/types/filters';
import { supabase } from '@/utils/supabase/client';
import { fetchAlbumArtwork } from '@/utils/artwork';

type AddSongTab = 'Basics' | 'Theory' | 'Lyrics';

const TAB_OPTIONS: FilterOption<AddSongTab>[] = [
  { value: 'Basics', label: 'BASICS', icon: Mic },
  { value: 'Theory', label: 'THEORY', icon: BookOpen },
  { value: 'Lyrics', label: 'LYRICS', icon: StickyNote },
];

export default function AddSongScreen() {
  const [activeTab, setActiveTab] = useState<AddSongTab>('Basics');

  // TODO: Implement save logic.
  // When saving:
  // 1. Get title and artist from inputs
  // 2. const artwork = await fetchAlbumArtwork(title, artist);
  // 3. Save song data with artwork.artworkUrl to Supabase

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Sign Out Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Header matching LibraryHeader */}
      <View style={styles.topBar}>
        {/* Left */}
        <View>
          <Text style={styles.h1Title}>SongStreak</Text>
          <Text style={styles.subtitle}>ADD SONG</Text>
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
      
      <View style={styles.content}>
        <GangSwitch
          label="SECTIONS"
          value={activeTab}
          onChange={setActiveTab}
          options={TAB_OPTIONS}
          allowDeselect={false}
        />
        
        <View style={styles.tabContent}>
            <Text style={styles.placeholderText}>Content for {activeTab}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.matteFog,
  },
  // --- Top Bar (Copied from LibraryHeader) ---
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
    gap: 16,
  },
  avatarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 6,
  },

  content: {
    padding: 24,
    gap: 24,
  },
  tabContent: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.softWhite,
      borderRadius: 12,
      padding: 24,
      minHeight: 200,
      borderWidth: 1,
      borderColor: '#ccc',
  },
  placeholderText: {
      fontFamily: 'LexendDecaRegular',
      color: Colors.graphite,
  }
});
