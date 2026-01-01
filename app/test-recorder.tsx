/**
 * Test Page: Voice Recorder
 *
 * Preview page for the reel-to-reel voice recorder component.
 * Navigate to /test-recorder to view.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mic } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { ReelToReelRecorder } from '@/components/ui/recorder';
import { VoiceMemoModal } from '@/components/ui/modals';
import { useClickSound } from '@/hooks/useClickSound';

export default function TestRecorderPage() {
  const router = useRouter();
  const { playSound } = useClickSound();
  const [showModal, setShowModal] = useState(false);

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    router.back();
  };

  const handleOpenModal = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    setShowModal(true);
  };

  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    console.log('[TestRecorder] Recording complete:', duration, 'seconds, size:', blob.size);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.charcoal} />
        </Pressable>
        <Text style={styles.title}>VOICE RECORDER TEST</Text>
        <Pressable onPress={handleOpenModal} style={styles.modalButton}>
          <Mic size={20} color={Colors.softWhite} />
        </Pressable>
      </View>

      {/* Recorder Preview */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>INLINE RECORDER</Text>
        <ReelToReelRecorder
          onRecordingComplete={handleRecordingComplete}
          onShare={() => console.log('[TestRecorder] Share pressed')}
          onDelete={() => console.log('[TestRecorder] Delete pressed')}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>MODAL TRIGGER</Text>
        <Text style={styles.description}>
          Tap the microphone icon in the header to open the full voice memo modal.
        </Text>
      </ScrollView>

      {/* Voice Memo Modal */}
      <VoiceMemoModal
        visible={showModal}
        onClose={() => setShowModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.matteFog,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: Colors.alloy,
  },
  title: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    letterSpacing: 2,
    color: Colors.ink,
  },
  modalButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: Colors.vermilion,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontFamily: 'LexendDecaBold',
    fontSize: 12,
    letterSpacing: 2,
    color: Colors.graphite,
    marginBottom: 16,
  },
  description: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 14,
    color: Colors.warmGray,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 32,
  },
});
