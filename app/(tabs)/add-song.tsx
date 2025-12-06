import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { GangSwitch } from '@/components/ui/filters/GangSwitch';
import { PageHeader } from '@/components/ui/PageHeader';
import { Mic, BookOpen, Target, StickyNote } from 'lucide-react-native';
import { FilterOption } from '@/types/filters';

type AddSongTab = 'Basics' | 'Theory' | 'Practice' | 'Lyrics';

const TAB_OPTIONS: FilterOption<AddSongTab>[] = [
  { value: 'Basics', label: 'BASICS', icon: Mic },
  { value: 'Theory', label: 'THEORY', icon: BookOpen },
  { value: 'Practice', label: 'PRACTICE', icon: Target },
  { value: 'Lyrics', label: 'LYRICS', icon: StickyNote },
];

export default function AddSongScreen() {
  const [activeTab, setActiveTab] = useState<AddSongTab>('Basics');
  const [videoUrl, setVideoUrl] = useState('');

  // TODO: Implement save logic.
  // When saving:
  // 1. Get title and artist from inputs
  // 2. const artwork = await fetchAlbumArtwork(title, artist);
  // 3. Save song data with artwork.artworkUrl to Supabase

  return (
    <View style={styles.container}>
      <PageHeader subtitle="ADD SONG" />

      <View style={styles.content}>
        <GangSwitch
          label="SECTIONS"
          value={activeTab}
          onChange={setActiveTab}
          options={TAB_OPTIONS}
          allowDeselect={false}
          showIcons={true}
        />

        <View style={styles.tabContent}>
          {activeTab === 'Basics' ? (
            <View style={styles.basicsContainer}>
              <Text style={styles.sectionTitle}>Source Input (Generate Data)</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Video URL</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Paste video URL to extract theory"
                  placeholderTextColor={Colors.graphite}
                  value={videoUrl}
                  onChangeText={setVideoUrl}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.analyzeButtonContainer}
              >
                <LinearGradient
                  colors={[Colors.vermilion, '#d04620']}
                  style={styles.analyzeButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                >
                  <Text style={styles.analyzeButtonText}>ANALYZE VIDEO</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.placeholderText}>Content for {activeTab}</Text>
          )}
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
  content: {
    padding: 24,
    gap: 24,
  },
  tabContent: {
    backgroundColor: Colors.softWhite,
    borderRadius: 12,
    padding: 24,
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  basicsContainer: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.charcoal,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 10,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.warmGray,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  textInput: {
    backgroundColor: Colors.alloy,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'LexendDecaRegular',
    color: Colors.charcoal,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.5)',
    borderLeftColor: 'rgba(255,255,255,0.5)',
    borderBottomColor: 'rgba(0,0,0,0.15)',
    borderRightColor: 'rgba(0,0,0,0.15)',
  },
  placeholderText: {
    fontFamily: 'LexendDecaRegular',
    color: Colors.graphite,
    textAlign: 'center',
  },
  analyzeButtonContainer: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  analyzeButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  analyzeButtonText: {
    fontFamily: 'LexendDecaBold',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
