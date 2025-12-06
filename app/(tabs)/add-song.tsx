import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
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
  },
});
