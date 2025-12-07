import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { FrequencyTuner, GangSwitch } from '@/components/ui/filters';
import { PageHeader } from '@/components/ui/PageHeader';
import { Mic, BookOpen, Target, StickyNote, Play } from 'lucide-react-native';
import { FilterOption, Instrument } from '@/types/filters';
import { useClickSound } from '@/hooks/useClickSound';
import * as Haptics from 'expo-haptics';
import { ProcessingSignal } from '@/components/ui/ProcessingSignal';
import { VideoPlaceholder } from '@/components/ui/VideoPlaceholder';
import { instrumentOptions } from '@/config/filterOptions';

type AddSongTab = 'Basics' | 'Theory' | 'Practice' | 'Lyrics';

interface InstrumentAnalysisData {
  videoUrl: string;
  title: string;
  artist: string;
  theoryData: {
    key: string;
    tempo: string;
    timeSignature: string;
  };
  practiceData: {
    difficulty: string;
    techniques: string[];
  };
  analyzed: boolean;
}

const TAB_OPTIONS: FilterOption<AddSongTab>[] = [
  { value: 'Basics', label: 'BASICS', icon: Mic },
  { value: 'Theory', label: 'THEORY', icon: BookOpen },
  { value: 'Practice', label: 'PRACTICE', icon: Target },
  { value: 'Lyrics', label: 'LYRICS', icon: StickyNote },
];

// Filter out 'All' option for creation context (only show specific instruments)
const ADD_SONG_INSTRUMENT_OPTIONS = instrumentOptions.filter(opt => opt.value !== 'All');

export default function AddSongScreen() {
  const [activeTab, setActiveTab] = useState<AddSongTab>('Basics');
  const [videoUrl, setVideoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentInstrument, setCurrentInstrument] = useState<Instrument>('Guitar');
  const [instrumentData, setInstrumentData] = useState<Partial<Record<Instrument, InstrumentAnalysisData | null>>>({
    Guitar: null,
    Bass: null,
    Drums: null,
    Keys: null,
  });
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const { playSound } = useClickSound();

  const handleInstrumentChange = (instrument: Instrument) => {
    setCurrentInstrument(instrument);
    const data = instrumentData[instrument];
    setVideoUrl(data?.videoUrl || '');
    setSongTitle(data?.title || '');
    setArtist(data?.artist || '');
  };

  const handleAnalyze = async () => {
    if (!videoUrl.trim()) {
      Alert.alert('Error', 'Please enter a video URL');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();

    setIsAnalyzing(true);

    setTimeout(() => {
      const mockData: InstrumentAnalysisData = {
        videoUrl: videoUrl,
        title: songTitle,
        artist: artist,
        theoryData: {
          key: 'E Minor',
          tempo: '120 BPM',
          timeSignature: '4/4',
        },
        practiceData: {
          difficulty: 'Medium',
          techniques: ['Fingerpicking', 'Barre Chords'],
        },
        analyzed: true,
      };

      setInstrumentData(prev => ({
        ...prev,
        [currentInstrument]: mockData,
      }));

      setIsAnalyzing(false);
    }, 3000);
  };

  // TODO: Implement save logic.
  // When saving:
  // 1. Get title and artist from inputs
  // 2. const artwork = await fetchAlbumArtwork(title, artist);
  // 3. Save song data with artwork.artworkUrl to Supabase

  const tabLoadingStates: Record<AddSongTab, boolean> = {
    Basics: false,
    Theory: isAnalyzing,
    Practice: isAnalyzing,
    Lyrics: false,
  };

  const tabDataAvailable: Record<AddSongTab, boolean> = {
    Basics: false,
    Theory: instrumentData[currentInstrument]?.analyzed || false,
    Practice: instrumentData[currentInstrument]?.analyzed || false,
    Lyrics: false,
  };

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
          loadingStates={tabLoadingStates}
          dataAvailable={tabDataAvailable}
        />

        <View style={styles.tabContent}>
          {activeTab === 'Basics' ? (
            <View style={styles.basicsContainer}>
              <Text style={styles.sectionTitle}>Source Input (Generate Data)</Text>

              {isAnalyzing ? (
                <ProcessingSignal />
              ) : instrumentData[currentInstrument]?.analyzed ? (
                <View style={styles.inputGroup}>
                  <VideoPlaceholder videoUrl={instrumentData[currentInstrument]!.videoUrl} />
                </View>
              ) : (
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
              )}

              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.analyzeButtonContainer}
                onPress={handleAnalyze}
                disabled={isAnalyzing}
              >
                <LinearGradient
                  colors={[Colors.vermilion, '#d04620']}
                  style={styles.analyzeButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                >
                  {isAnalyzing ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.analyzeButtonText}>
                      {instrumentData[currentInstrument]?.analyzed ? 'RE-ANALYZE VIDEO' : 'ANALYZE VIDEO'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Song Title</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter song title"
                  placeholderTextColor={Colors.graphite}
                  value={songTitle}
                  onChangeText={setSongTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Artist</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter artist name"
                  placeholderTextColor={Colors.graphite}
                  value={artist}
                  onChangeText={setArtist}
                />
              </View>

              <FrequencyTuner
                label="INSTRUMENT"
                value={currentInstrument}
                onChange={handleInstrumentChange}
                options={ADD_SONG_INSTRUMENT_OPTIONS}
              />
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
    letterSpacing: 2,
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
