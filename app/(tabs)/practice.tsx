import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetronomePanel } from '@/components/ui/metronome';
import { GangSwitch } from '@/components/ui/filters/GangSwitch';
import { Colors } from '@/constants/Colors';
import { useMetronome } from '@/hooks/useMetronome';
import { useStyledAlert } from '@/hooks/useStyledAlert';
import { parseBpm, parseTimeSignatureString, Subdivision, SUBDIVISION_OPTIONS } from '@/types/metronome';

/**
 * Practice Screen - Song-Specific Metronome
 *
 * Integrated metronome with:
 * - VU meter in pendulum mode
 * - BPM from song (read-only or adjustable)
 * - Auto-coupled practice timer
 * - Compact controls for embedded context
 */
export default function PracticeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    songId?: string;
    songTitle?: string;
    tempo?: string;
    timeSignature?: string;
  }>();
  const { showSuccess } = useStyledAlert();

  // Parse tempo and time signature from song params
  const initialBpm = parseBpm(params.tempo);
  const initialTimeSignature = parseTimeSignatureString(params.timeSignature);

  // Session timer (auto-coupled with metronome)
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [timerPausedByUser, setTimerPausedByUser] = useState(false);

  // Initialize metronome with song's tempo
  const metronome = useMetronome({
    initialBpm,
    initialTimeSignature,
    initialSubdivision: 1,
    onStateChange: (isPlaying) => {
      if (isPlaying) {
        setTimerPausedByUser(false);
      }
    },
  });

  // Auto-couple timer with metronome
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (metronome.isPlaying && !timerPausedByUser) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [metronome.isPlaying, timerPausedByUser]);

  /**
   * Handle play/pause toggle
   */
  const handlePlayPause = useCallback(() => {
    metronome.toggle();
  }, [metronome]);

  /**
   * Handle reset - stops metronome and resets timer
   */
  const handleReset = useCallback(() => {
    metronome.stop();
    setSessionSeconds(0);
    setTimerPausedByUser(false);
  }, [metronome]);

  /**
   * Handle complete/log - saves session and navigates back
   */
  const handleComplete = useCallback(
    (seconds: number) => {
      metronome.stop();

      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      const timeString =
        minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;

      showSuccess(
        'Practice Complete!',
        `You practiced${params.songTitle ? ` "${params.songTitle}"` : ''} for ${timeString}.`,
        () => {
          if (params.songId) {
            router.back();
          }
        }
      );

      // Reset for next session
      setSessionSeconds(0);
      setTimerPausedByUser(false);
    },
    [metronome, params.songTitle, params.songId, router, showSuccess]
  );

  /**
   * Handle subdivision change
   */
  const handleSubdivisionChange = useCallback(
    (value: string | null) => {
      if (value) {
        metronome.setSubdivision(Number(value) as Subdivision);
      }
    },
    [metronome]
  );

  // Subdivision options for GangSwitch
  const subdivisionOptions = SUBDIVISION_OPTIONS.map((opt) => ({
    value: String(opt.value),
    label: opt.label,
  }));

  return (
    <View style={styles.container}>
      <PageHeader subtitle="STREAK" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Song header */}
        {params.songTitle && (
          <View style={styles.songHeader}>
            <Text style={styles.nowPracticing}>NOW PRACTICING</Text>
            <Text style={styles.songTitle} numberOfLines={2}>
              {params.songTitle}
            </Text>
          </View>
        )}

        {/* Metronome Panel: Time Sig + VU Meter + BPM + Transport + Timer */}
        <View style={styles.meterSection}>
          <MetronomePanel
            beatPosition={metronome.beatPosition}
            isMetronomePlaying={metronome.isPlaying}
            currentBeat={metronome.currentBeat}
            beatsPerMeasure={metronome.beatsPerMeasure}
            timeSignature={metronome.timeSignature}
            onTimeSignatureChange={metronome.setTimeSignature}
            bpm={metronome.bpm}
            onBpmChange={metronome.setBpm}
            onTapTempo={metronome.tapTempo}
            onPlayPause={handlePlayPause}
            onReset={handleReset}
            onComplete={handleComplete}
            showComplete={true}
            sessionSeconds={sessionSeconds}
          />
        </View>

        {/* Subdivision selector */}
        <View style={styles.subdivisionSection}>
          <GangSwitch
            label="SUBDIVISION"
            value={String(metronome.subdivision)}
            options={subdivisionOptions}
            onChange={handleSubdivisionChange}
            orientation="horizontal"
            allowDeselect={false}
          />
        </View>

        {/* Status indicator */}
        <View style={styles.statusContainer}>
          <View
            style={[styles.statusLed, metronome.isPlaying && styles.statusLedActive]}
          />
          <Text style={styles.statusText}>
            {metronome.isPlaying
              ? 'PLAYING'
              : sessionSeconds > 0
              ? 'PAUSED'
              : 'READY'}
          </Text>
        </View>
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
    paddingHorizontal: 24,
    paddingBottom: 120,
    gap: 24,
  },
  songHeader: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  nowPracticing: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    color: Colors.warmGray,
    letterSpacing: 2,
  },
  songTitle: {
    fontFamily: 'LexendDecaBold',
    fontSize: 18,
    color: Colors.ink,
    textAlign: 'center',
  },
  meterSection: {
    alignItems: 'center',
  },
  subdivisionSection: {
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.alloy,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.05)',
  },
  statusLed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.graphite,
  },
  statusLedActive: {
    backgroundColor: Colors.vermilion,
    shadowColor: Colors.vermilion,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  statusText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    color: Colors.graphite,
    letterSpacing: 2,
  },
});
