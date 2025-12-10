import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { FrequencyTuner, GangSwitch } from '@/components/ui/filters';
import { PageHeader } from '@/components/ui/PageHeader';
import { Mic, BookOpen, Target, StickyNote, Search, Save, Music, Clock, Hash, ExternalLink, Edit2 } from 'lucide-react-native';
import { FilterOption, Instrument } from '@/types/filters';
import { useClickSound } from '@/hooks/useClickSound';
import * as Haptics from 'expo-haptics';
import { ProcessingSignal } from '@/components/ui/ProcessingSignal';
import { VideoPlaceholder } from '@/components/ui/VideoPlaceholder';
import { VideoPlayerModal } from '@/components/ui/VideoPlayerModal';
import { PracticeTimer } from '@/components/ui/practice/PracticeTimer';
import { instrumentOptions } from '@/config/filterOptions';
import { analyzeVideoWithGemini, getMockGeminiResponse } from '@/utils/gemini';
import { fetchAlbumArtwork } from '@/utils/artwork';
import { fetchLyrics } from '@/utils/lyrics';
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
    chords: string[];
    scales: string[];
  };
  practiceData: {
    difficulty: string;
    techniques: string[];
    strummingPattern?: string;
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
  // Get songId from query params (for viewing existing songs)
  const { songId } = useLocalSearchParams<{ songId?: string }>();
  const isEditMode = !!songId;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AddSongTab>('Basics');
  const [isEditing, setIsEditing] = useState(false); // Toggle for view/edit mode
  const [videoUrl, setVideoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingSong, setIsLoadingSong] = useState(false);
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
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [showDebug, setShowDebug] = useState(false);
  const [formKey, setFormKey] = useState(0); // Force re-render key
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false); // Video player modal
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const { playSound } = useClickSound();

  // Load existing song data when songId is provided
  useEffect(() => {
    if (songId) {
      loadExistingSong(songId);
    }
  }, [songId]);

  const loadExistingSong = async (id: string) => {
    setIsLoadingSong(true);
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Pre-populate form fields
      setSongTitle(data.title);
      setArtist(data.artist);
      setVideoUrl(data.video_url);
      setCurrentInstrument(data.instrument);

      // Build InstrumentAnalysisData from DB fields
      const loadedData: InstrumentAnalysisData = {
        videoUrl: data.video_url,
        title: data.title,
        artist: data.artist,
        theoryData: {
          key: data.key || 'Unknown',
          tempo: data.tempo || 'Unknown',
          timeSignature: data.time_signature || '4/4',
          chords: data.chords || [],
          scales: data.scales || [],
        },
        practiceData: {
          difficulty: data.difficulty || 'Medium',
          techniques: data.techniques || [],
        },
        analyzed: true,
      };

      setInstrumentData(prev => ({
        ...prev,
        [data.instrument]: loadedData,
      }));

      // Load lyrics if available
      if (data.lyrics) {
        setLyrics(data.lyrics);
      }

      // Force form re-render
      setFormKey(prev => prev + 1);
    } catch (err) {
      console.error('Error loading song:', err);
      Alert.alert('Error', 'Failed to load song data');
    } finally {
      setIsLoadingSong(false);
    }
  };

  const handleOpenVideo = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    setIsVideoModalVisible(true);
  };

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
      let analysisResult;

      try {
        analysisResult = await analyzeVideoWithGemini(videoUrl);
        console.log('✅ Analysis successful:', analysisResult);
        setDebugInfo('✅ SUCCESS: Real data from Gemini API');
        setShowDebug(true);
      } catch (geminiError) {
        console.error('Gemini API Error:', geminiError);

        const errorMessage = geminiError instanceof Error ? geminiError.message : 'Unknown error';
        setDebugInfo(`❌ ERROR: ${errorMessage}`);
        setShowDebug(true);

        // Handle validation/config errors that should stop processing
        if (errorMessage.includes('VALIDATION_ERROR')) {
          Alert.alert(
            'Input Error',
            errorMessage.replace('VALIDATION_ERROR: ', ''),
            [{ text: 'OK' }]
          );
          setIsAnalyzing(false);
          return;
        } else if (errorMessage.includes('CONFIG_ERROR')) {
          Alert.alert(
            'Configuration Error',
            errorMessage.replace('CONFIG_ERROR: ', ''),
            [{ text: 'OK' }]
          );
          setIsAnalyzing(false);
          return;
        }

        // For other errors, show alert and continue with mock data
        if (errorMessage.includes('QUOTA_EXCEEDED')) {
          Alert.alert(
            'API Quota Exceeded',
            'The Gemini API quota has been exhausted for now.\n\nOptions:\n• Wait for quota reset (daily/monthly)\n• Upgrade to paid tier\n• Continuing with sample data for testing'
          );
        } else if (errorMessage.includes('MODEL_NOT_FOUND')) {
          Alert.alert(
            'Configuration Error',
            'The Gemini model is not available. Please check your API configuration.\n\nUsing sample data for testing.'
          );
        } else if (errorMessage.includes('AUTH_ERROR')) {
          Alert.alert(
            'Authentication Error',
            'Invalid API key or insufficient permissions. Please check your credentials.\n\nUsing sample data for testing.'
          );
        } else {
          Alert.alert(
            'Analysis Error',
            'Unable to analyze video with Gemini API.\n\nUsing sample data for testing.\n\nError: ' + errorMessage
          );
        }

        // Fall back to mock data
        console.log('⚠️ Using mock data as fallback');
        analysisResult = getMockGeminiResponse();
      }

      // Auto-fill form fields with analysis result (real or mock)
      console.log('Setting form fields:', {
        title: analysisResult.title,
        artist: analysisResult.artist,
        instrument: analysisResult.instrument,
      });

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

      // Force form re-render to ensure TextInputs update on iOS
      setFormKey(prev => prev + 1);
      console.log('Form state updated, formKey incremented');

      setIsAnalyzing(false);

      // Fetch lyrics in the background (non-blocking)
      setIsLoadingLyrics(true);
      fetchLyrics(analysisResult.title, analysisResult.artist)
        .then(fetchedLyrics => {
          setLyrics(fetchedLyrics);
        })
        .catch(err => {
          console.error('Lyrics fetch error:', err);
        })
        .finally(() => {
          setIsLoadingLyrics(false);
        });
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
        chords: currentData.theoryData.chords,
        scales: currentData.theoryData.scales,
        difficulty: currentData.practiceData.difficulty,
        techniques: currentData.practiceData.techniques,
        lyrics: lyrics || null,
      };

      // 3. Save to Supabase
      console.log('📝 Attempting to save song data:', JSON.stringify(songData, null, 2));

      const { data, error } = await supabase
        .from('songs')
        .insert([songData])
        .select();

      console.log('💾 Supabase save result:', { data, error });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw new Error(error.message || 'Failed to save to database');
      }

      console.log('✅ Song saved successfully:', data);
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

  const handleUpdate = async () => {
    if (!songTitle.trim() || !artist.trim()) {
      Alert.alert('Validation Error', 'Please enter both song title and artist');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    setIsSaving(true);

    try {
      const currentData = instrumentData[currentInstrument];

      const updateData = {
        title: songTitle,
        artist: artist,
        instrument: currentInstrument,
        video_url: currentData?.videoUrl || videoUrl,
        key: currentData?.theoryData?.key,
        tempo: currentData?.theoryData?.tempo,
        time_signature: currentData?.theoryData?.timeSignature,
        chords: currentData?.theoryData?.chords,
        scales: currentData?.theoryData?.scales,
        difficulty: currentData?.practiceData?.difficulty,
        techniques: currentData?.practiceData?.techniques,
        lyrics: lyrics || null,
      };

      const { error } = await supabase
        .from('songs')
        .update(updateData)
        .eq('id', songId);

      if (error) throw error;

      Alert.alert('Success', 'Song updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update song. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabLoadingStates: Record<AddSongTab, boolean> = {
    Basics: false,
    Theory: isAnalyzing,
    Practice: false,
    Lyrics: isLoadingLyrics,
  };

  const tabDataAvailable: Record<AddSongTab, boolean> = {
    Basics: false,
    Theory: instrumentData[currentInstrument]?.analyzed || false,
    Practice: instrumentData[currentInstrument]?.analyzed || false,
    Lyrics: false,
  };

  return (
    <View style={styles.container}>
      <PageHeader subtitle={isEditMode ? (isEditing ? "EDIT SONG" : "VIEW SONG") : "ADD SONG"} />

      {/* Edit button for view mode */}
      {isEditMode && !isEditing && !isLoadingSong && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await playSound();
            setIsEditing(true);
          }}
        >
          <Edit2 size={16} color={Colors.vermilion} />
          <Text style={styles.editButtonText}>Edit Song</Text>
        </TouchableOpacity>
      )}

      {isLoadingSong ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.vermilion} />
          <Text style={styles.loadingText}>Loading song...</Text>
        </View>
      ) : (
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
            <ScrollView style={styles.basicsContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.basicsScrollContent}>
              <Text style={styles.sectionTitle}>Source Input (Generate Data)</Text>

              {showDebug && (
                <View style={styles.debugBox}>
                  <Text style={styles.debugText}>{debugInfo}</Text>
                  <TouchableOpacity onPress={() => setShowDebug(false)}>
                    <Text style={styles.debugClose}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              {isAnalyzing ? (
                <ProcessingSignal />
              ) : (
                <>
                  {/* Show URL input in edit mode or when not analyzed */}
                  {((isEditMode && isEditing) || !instrumentData[currentInstrument]?.analyzed) && (
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

                  {/* Show thumbnail in view mode when analyzed */}
                  {instrumentData[currentInstrument]?.analyzed && !(isEditMode && isEditing) && (
                    <TouchableOpacity
                      style={styles.inputGroup}
                      onPress={handleOpenVideo}
                      activeOpacity={0.8}
                    >
                      <VideoPlaceholder videoUrl={instrumentData[currentInstrument]!.videoUrl} />
                      <View style={styles.tapToPlayHint}>
                        <ExternalLink size={12} color={Colors.graphite} />
                        <Text style={styles.tapToPlayText}>Tap to open in YouTube</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </>
              )}

              {/* Button Group - Analyze and Save/Update (only show when adding new song or editing existing) */}
              {(!isEditMode || isEditing) && (() => {
                const canSave = !!(
                  songTitle.trim() &&
                  artist.trim() &&
                  instrumentData[currentInstrument]?.analyzed
                );

                return (
                  <>
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
                                {instrumentData[currentInstrument]?.analyzed && !isEditing ? 'RE-ANALYZE' : 'ANALYZE'}
                              </Text>
                            </View>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>

                      {/* Save/Update Button */}
                      <TouchableOpacity
                        activeOpacity={0.9}
                        style={[styles.buttonContainer, { flex: 0.3 }]}
                        onPress={isEditMode ? handleUpdate : handleSave}
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

                    {/* Cancel button when editing existing song */}
                    {isEditMode && isEditing && (
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={async () => {
                          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          await playSound();
                          setIsEditing(false);
                          if (songId) {
                            loadExistingSong(songId); // Reload original data
                          }
                        }}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    )}
                  </>
                );
              })()}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Song Title</Text>
                <TextInput
                  key={`title-${formKey}`}
                  style={[styles.textInput, (isEditMode && !isEditing) && styles.textInputDisabled]}
                  placeholder="Enter song title"
                  placeholderTextColor={Colors.graphite}
                  value={songTitle}
                  onChangeText={setSongTitle}
                  editable={!isEditMode || isEditing}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Artist</Text>
                <TextInput
                  key={`artist-${formKey}`}
                  style={[styles.textInput, (isEditMode && !isEditing) && styles.textInputDisabled]}
                  placeholder="Enter artist name"
                  placeholderTextColor={Colors.graphite}
                  value={artist}
                  onChangeText={setArtist}
                  editable={!isEditMode || isEditing}
                />
              </View>

              <FrequencyTuner
                label="INSTRUMENT"
                value={currentInstrument}
                onChange={handleInstrumentChange}
                options={ADD_SONG_INSTRUMENT_OPTIONS}
                disabled={isEditMode && !isEditing}
              />
            </ScrollView>
          ) : activeTab === 'Theory' ? (
            <ScrollView style={styles.theoryContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.theoryScrollContent}>
              {instrumentData[currentInstrument]?.analyzed ? (
                <>
                  {/* Key, Tempo, Time Signature Row */}
                  <View style={styles.theoryRow}>
                    <View style={styles.theoryCard}>
                      <View style={styles.theoryCardHeader}>
                        <Music size={14} color={Colors.vermilion} />
                        <Text style={styles.theoryCardLabel}>KEY</Text>
                      </View>
                      <Text style={styles.theoryCardValue}>
                        {instrumentData[currentInstrument]?.theoryData.key || 'Unknown'}
                      </Text>
                    </View>
                    <View style={styles.theoryCard}>
                      <View style={styles.theoryCardHeader}>
                        <Clock size={14} color={Colors.vermilion} />
                        <Text style={styles.theoryCardLabel}>TEMPO</Text>
                      </View>
                      <Text style={styles.theoryCardValue}>
                        {instrumentData[currentInstrument]?.theoryData.tempo || 'Unknown'}
                      </Text>
                    </View>
                    <View style={styles.theoryCard}>
                      <View style={styles.theoryCardHeader}>
                        <Hash size={14} color={Colors.vermilion} />
                        <Text style={styles.theoryCardLabel}>TIME</Text>
                      </View>
                      <Text style={styles.theoryCardValue}>
                        {instrumentData[currentInstrument]?.theoryData.timeSignature || '4/4'}
                      </Text>
                    </View>
                  </View>

                  {/* Chords Section */}
                  <View style={styles.theorySection}>
                    <Text style={styles.theorySectionTitle}>CHORDS</Text>
                    <View style={styles.chipContainer}>
                      {instrumentData[currentInstrument]?.theoryData.chords?.length > 0 ? (
                        instrumentData[currentInstrument]?.theoryData.chords.map((chord, index) => (
                          <View key={index} style={styles.chip}>
                            <Text style={styles.chipText}>{chord}</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noDataText}>No chords detected</Text>
                      )}
                    </View>
                  </View>

                  {/* Scales Section */}
                  <View style={styles.theorySection}>
                    <Text style={styles.theorySectionTitle}>SCALES</Text>
                    <View style={styles.chipContainer}>
                      {instrumentData[currentInstrument]?.theoryData.scales?.length > 0 ? (
                        instrumentData[currentInstrument]?.theoryData.scales.map((scale, index) => (
                          <View key={index} style={[styles.chip, styles.chipScale]}>
                            <Text style={styles.chipText}>{scale}</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noDataText}>No scales detected</Text>
                      )}
                    </View>
                  </View>

                  {/* Difficulty Badge (moved from Practice) */}
                  <View style={styles.difficultyContainer}>
                    <Text style={styles.theorySectionTitle}>DIFFICULTY</Text>
                    <View style={[
                      styles.difficultyBadge,
                      instrumentData[currentInstrument]?.practiceData.difficulty === 'Easy' && styles.difficultyEasy,
                      instrumentData[currentInstrument]?.practiceData.difficulty === 'Medium' && styles.difficultyMedium,
                      instrumentData[currentInstrument]?.practiceData.difficulty === 'Hard' && styles.difficultyHard,
                    ]}>
                      <Text style={styles.difficultyText}>
                        {instrumentData[currentInstrument]?.practiceData.difficulty || 'Medium'}
                      </Text>
                    </View>
                  </View>

                  {/* Techniques Section (moved from Practice) */}
                  <View style={styles.theorySection}>
                    <Text style={styles.theorySectionTitle}>TECHNIQUES</Text>
                    <View style={styles.chipContainer}>
                      {instrumentData[currentInstrument]?.practiceData.techniques?.length > 0 ? (
                        instrumentData[currentInstrument]?.practiceData.techniques.map((technique, index) => (
                          <View key={index} style={[styles.chip, styles.chipTechnique]}>
                            <Text style={styles.chipText}>{technique}</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noDataText}>No techniques detected</Text>
                      )}
                    </View>
                  </View>

                  {/* Strumming Pattern (moved from Practice) */}
                  {instrumentData[currentInstrument]?.practiceData.strummingPattern && (
                    <View style={styles.theorySection}>
                      <Text style={styles.theorySectionTitle}>STRUMMING PATTERN</Text>
                      <View style={styles.strummingContainer}>
                        <Text style={styles.strummingText}>
                          {instrumentData[currentInstrument]?.practiceData.strummingPattern}
                        </Text>
                      </View>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.noAnalysisContainer}>
                  <Text style={styles.noAnalysisText}>
                    Analyze a video first to see music theory data
                  </Text>
                </View>
              )}
            </ScrollView>
          ) : activeTab === 'Practice' ? (
            <View style={styles.practiceTimerContainer}>
              <PracticeTimer compact />
            </View>
          ) : activeTab === 'Lyrics' ? (
            <ScrollView style={styles.lyricsContainer} showsVerticalScrollIndicator={false}>
              {isLoadingLyrics ? (
                <View style={styles.lyricsLoadingContainer}>
                  <ActivityIndicator size="small" color={Colors.vermilion} />
                  <Text style={styles.lyricsLoadingText}>Searching for lyrics...</Text>
                </View>
              ) : lyrics ? (
                <Text style={styles.lyricsText}>{lyrics}</Text>
              ) : instrumentData[currentInstrument]?.analyzed ? (
                <View style={styles.noLyricsContainer}>
                  <Text style={styles.noLyricsText}>No lyrics found for this song</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={async () => {
                      if (songTitle && artist) {
                        setIsLoadingLyrics(true);
                        const fetchedLyrics = await fetchLyrics(songTitle, artist);
                        setLyrics(fetchedLyrics);
                        setIsLoadingLyrics(false);
                      }
                    }}
                  >
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.noAnalysisContainer}>
                  <Text style={styles.noAnalysisText}>
                    Analyze a video first to fetch lyrics
                  </Text>
                </View>
              )}
            </ScrollView>
          ) : (
            <Text style={styles.placeholderText}>Unknown tab</Text>
          )}
          </View>
        </View>
      )}

      {/* Video Player Modal */}
      <VideoPlayerModal
        visible={isVideoModalVisible}
        videoUrl={instrumentData[currentInstrument]?.videoUrl || ''}
        title={songTitle}
        artist={artist}
        onClose={() => setIsVideoModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.matteFog,
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 14,
    color: Colors.graphite,
    marginTop: 12,
  },
  tabContent: {
    flex: 1,
    backgroundColor: Colors.softWhite,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    minHeight: 0, // Important: allows flex to calculate correctly
  },
  basicsContainer: {
    flex: 1,
  },
  basicsScrollContent: {
    gap: 20,
    paddingBottom: 20,
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
  textInputDisabled: {
    opacity: 0.7,
    backgroundColor: Colors.softWhite,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 24,
    marginTop: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.vermilion,
    backgroundColor: 'transparent',
  },
  editButtonText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 12,
    color: Colors.vermilion,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 14,
    color: Colors.vermilion,
    letterSpacing: 1,
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
  debugBox: {
    backgroundColor: '#f0f0f0',
    borderLeftWidth: 4,
    borderLeftColor: Colors.lobsterPink,
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  debugText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.charcoal,
    flex: 1,
  },
  debugClose: {
    fontSize: 18,
    color: Colors.charcoal,
    paddingLeft: 12,
  },
  // Theory Tab Styles
  theoryContainer: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  theoryScrollContent: {
    gap: 20,
    paddingBottom: 20,
  },
  theoryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  theoryCard: {
    flex: 1,
    backgroundColor: Colors.alloy,
    borderRadius: 8,
    padding: 12,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#d0d0d0',
  },
  theoryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  theoryCardLabel: {
    fontSize: 10,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.warmGray,
    letterSpacing: 1,
  },
  theoryCardValue: {
    fontSize: 16,
    fontFamily: 'LexendDecaBold',
    color: Colors.charcoal,
  },
  theorySection: {
    marginBottom: 20,
  },
  theorySectionTitle: {
    fontSize: 10,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.warmGray,
    letterSpacing: 2,
    marginBottom: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.vermilion,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipScale: {
    backgroundColor: Colors.deepSpaceBlue,
  },
  chipTechnique: {
    backgroundColor: Colors.moss,
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'LexendDecaSemiBold',
    color: '#FFFFFF',
  },
  noDataText: {
    fontSize: 12,
    fontFamily: 'LexendDecaRegular',
    color: Colors.graphite,
    fontStyle: 'italic',
  },
  noAnalysisContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noAnalysisText: {
    fontSize: 14,
    fontFamily: 'LexendDecaRegular',
    color: Colors.graphite,
    textAlign: 'center',
  },
  // Practice Tab Styles
  practiceTimerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  difficultyContainer: {
    marginBottom: 20,
  },
  difficultyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    backgroundColor: Colors.graphite,
  },
  difficultyEasy: {
    backgroundColor: Colors.moss,
  },
  difficultyMedium: {
    backgroundColor: '#D4A017',
  },
  difficultyHard: {
    backgroundColor: Colors.lobsterPink,
  },
  difficultyText: {
    fontSize: 14,
    fontFamily: 'LexendDecaBold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  strummingContainer: {
    backgroundColor: Colors.alloy,
    borderRadius: 8,
    padding: 16,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#d0d0d0',
  },
  strummingText: {
    fontSize: 20,
    fontFamily: 'LexendDecaBold',
    color: Colors.charcoal,
    letterSpacing: 4,
    textAlign: 'center',
  },
  watchVideoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.vermilion,
    marginTop: 20,
  },
  watchVideoText: {
    fontSize: 14,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.vermilion,
  },
  tapToPlayHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  tapToPlayText: {
    fontSize: 11,
    fontFamily: 'LexendDecaRegular',
    color: Colors.graphite,
  },
  // Lyrics Tab Styles
  lyricsContainer: {
    flex: 1,
  },
  lyricsLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  lyricsLoadingText: {
    fontSize: 14,
    fontFamily: 'LexendDecaRegular',
    color: Colors.graphite,
  },
  lyricsText: {
    fontSize: 14,
    fontFamily: 'LexendDecaRegular',
    color: Colors.charcoal,
    lineHeight: 24,
    paddingBottom: 20,
  },
  noLyricsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  noLyricsText: {
    fontSize: 14,
    fontFamily: 'LexendDecaRegular',
    color: Colors.graphite,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.vermilion,
  },
  retryButtonText: {
    fontSize: 12,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.vermilion,
    letterSpacing: 1,
  },
});
