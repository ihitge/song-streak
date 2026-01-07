/**
 * Ideas Screen - Voice Memo Recorder
 *
 * Capture musical ideas with the reel-to-reel voice recorder.
 * Features:
 * - Skeuomorphic tape recorder interface
 * - Record, playback, and manage voice memos
 * - Share or delete recordings
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PageHeader } from '@/components/ui/PageHeader';
import { ReelToReelRecorder } from '@/components/ui/recorder';
import { Colors } from '@/constants/Colors';

export default function IdeasScreen() {
  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    console.log('[Ideas] Recording complete:', duration, 'seconds, size:', blob.size);
    // TODO: Save to storage/database
  };

  const handleShare = () => {
    console.log('[Ideas] Share pressed');
    // TODO: Implement share functionality
  };

  const handleDelete = () => {
    console.log('[Ideas] Delete pressed');
    // TODO: Implement delete functionality
  };

  return (
    <View style={styles.container}>
      <PageHeader />

      {/* Main content area - recorder handles its own title */}
      <View style={styles.recorderSection}>
        <ReelToReelRecorder
          onRecordingComplete={handleRecordingComplete}
          onShare={handleShare}
          onDelete={handleDelete}
          fullWidth
          title="VOICE RECORDER"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.matteFog,
  },
  recorderSection: {
    flex: 1,
    backgroundColor: Colors.ink,
  },
});
