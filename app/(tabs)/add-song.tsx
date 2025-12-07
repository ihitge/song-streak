import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { FrequencyTuner, GangSwitch } from '@/components/ui/filters';
import { PageHeader } from '@/components/ui/PageHeader';
import { Mic, BookOpen, Target, StickyNote, Play, Search, Save } from 'lucide-react-native';
import { FilterOption, Instrument } from '@/types/filters';
import { useClickSound } from '@/hooks/useClickSound';
import * as Haptics from 'expo-haptics';
import { ProcessingSignal } from '@/components/ui/ProcessingSignal';
import { VideoPlaceholder } from '@/components/ui/VideoPlaceholder';
import { instrumentOptions } from '@/config/filterOptions';
import { analyzeVideoWithGemini, getMockGeminiResponse } from '@/utils/gemini';
import { fetchAlbumArtwork } from '@/utils/artwork';
import { supabase } from '@/utils/supabase/client';

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
  const [isSaving, setIsSaving] = useState(false);
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

    try {
      // Call Gemini API to analyze video
      // TODO: Switch to real Gemini API once configured
      let analysisResult;

      try {
        analysisResult = await analyzeVideoWithGemini(videoUrl);
      } catch (geminiError) {
        console.warn('Gemini API unavailable, using mock data:', geminiError);
        analysisResult = getMockGeminiResponse();
      }

      // Auto-fill form fields with Gemini's analysis
      setSongTitle(analysisResult.title);
      setArtist(analysisResult.artist);
      setCurrentInstrument(analysisResult.instrument);

      // Save analyzed data to instrument state
      const analyzedData: InstrumentAnalysisData = {
        videoUrl: videoUrl,
        title: analysisResult.title,
        artist: analysisResult.artist,
        theoryData: analysisResult.theoryData,
        practiceData: analysisResult.practiceData,
        analyzed: true,
      };

      setInstrumentData(prev => ({
        ...prev,
        [analysisResult.instrument]: analyzedData,
      }));

      setIsAnalyzing(false);
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', 'Failed to analyze video. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    // Validation (double-check)
    if (!songTitle.trim() || !artist.trim()) {
      Alert.alert('Validation Error', 'Please enter both song title and artist');
      return;
    }

    const currentData = instrumentData[currentInstrument];
    if (!currentData?.analyzed) {
      Alert.alert('Validation Error', 'Please analyze the video first');
      return;
    }

    // Haptic + Audio feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();

    setIsSaving(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert('Error', 'You must be logged in to save songs');
        setIsSaving(false);
        return;
      }

      // 1. Fetch album artwork
      const artwork = await fetchAlbumArtwork(songTitle, artist);

      // 2. Prepare song data for Supabase
      const songData = {
        user_id: user.id,
        title: songTitle,
        artist: artist,
        instrument: currentInstrument,
        video_url: currentData.videoUrl,
        artwork_url: artwork.artworkUrl || null,
        key: currentData.theoryData.key,
        tempo: currentData.theoryData.tempo,
        time_signature: currentData.theoryData.timeSignature,
        difficulty: currentData.practiceData.difficulty,
        techniques: currentData.practiceData.techniques,
      };

      // 3. Save to Supabase
      const { data, error } = await supabase
        .from('songs')
        .insert([songData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Failed to save to database');
      }

      Alert.alert('Success', 'Song saved successfully!');

      // TODO: Navigate to Library or reset form
      // Reset form fields
      setVideoUrl('');
      setSongTitle('');
      setArtist('');
      setInstrumentData({
        Guitar: null,
        Bass: null,
        Drums: null,
        Keys: null,
      });

    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save song. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

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

              {/* Button Group - Analyze and Save */}
              {(() => {
                const canSave = !!(
                  songTitle.trim() &&
                  artist.trim() &&
                  instrumentData[currentInstrument]?.analyzed
                );

                return (
                  <View style={styles.buttonGroup}>
                    {/* Analyze Video Button - 70% width */}
                    <TouchableOpacity
                      activeOpacity={0.9}
                      style={[styles.buttonContainer, { flex: 0.7 }]}
                      onPress={handleAnalyze}
                      disabled={isAnalyzing || isSaving}
                    >
                      <LinearGradient
                        colors={[Colors.vermilion, '#d04620']}
                        style={styles.actionButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                      >
                        {isAnalyzing ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <View style={styles.buttonContent}>
                            <Search size={16} color="#fff" />
                            <Text style={styles.buttonText}>
                              {instrumentData[currentInstrument]?.analyzed ? 'RE-ANALYZE' : 'ANALYZE'}
                            </Text>
                          </View>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Save Button */}
                    <TouchableOpacity
                      activeOpacity={0.9}
                      style={[styles.buttonContainer, { flex: 0.3 }]}
                      onPress={handleSave}
                      disabled={!canSave || isAnalyzing || isSaving}
                    >
                      <LinearGradient
                        colors={canSave ? [Colors.moss, '#356B47'] : [Colors.graphite, '#6a6a6a']}
                        style={styles.actionButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                      >
                        {isSaving ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <View style={styles.buttonContent}>
                            <Save size={16} color="#fff" />
                            <Text style={styles.buttonText}>SAVE</Text>
                          </View>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                );
              })()}

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
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  buttonContainer: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontFamily: 'LexendDecaBold',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
