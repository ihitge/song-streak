import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PageHeader } from '@/components/ui/PageHeader';
import { PracticeTimer } from '@/components/ui/practice/PracticeTimer';
import { Colors } from '@/constants/Colors';
import { useStyledAlert } from '@/hooks/useStyledAlert';

export default function PracticeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ songId?: string; songTitle?: string }>();
  const { showSuccess } = useStyledAlert();

  const handleComplete = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const timeString = `${minutes}m ${remainingSeconds}s`;

    showSuccess(
      'Practice Complete!',
      `You practiced${params.songTitle ? ` "${params.songTitle}"` : ''} for ${timeString}.`,
      () => {
        // Navigate back or to streak summary
        if (params.songId) {
          router.back();
        }
      }
    );
  }, [params.songTitle, params.songId, router, showSuccess]);

  return (
    <View style={styles.container}>
      <PageHeader subtitle="STREAK" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PracticeTimer
          songTitle={params.songTitle}
          onComplete={handleComplete}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.matteFog,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 100, // Account for tab bar
  },
});