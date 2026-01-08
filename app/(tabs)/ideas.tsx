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
import { DeviceCasing } from '@/components/ui/DeviceCasing';

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

      {/* Dark device casing - recorder handles its own title */}
      <DeviceCasing title="VOICE RECORDER">
        <ReelToReelRecorder
          onRecordingComplete={handleRecordingComplete}
          onShare={handleShare}
          onDelete={handleDelete}
          fullWidth
          title=""
        />
      </DeviceCasing>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.matteFog,
  },
});
