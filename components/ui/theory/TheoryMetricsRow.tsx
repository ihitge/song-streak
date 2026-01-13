import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Music, Clock, Hash, Guitar, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { CircleOfFifthsModal } from './CircleOfFifthsModal';

interface TheoryMetricsRowProps {
  tuning: string;
  keyValue: string;
  tempo: string;
  timeSignature: string;
  songTitle?: string;
  artist?: string;
}

/**
 * TheoryMetricsRow - 2x2 grid display for Tuning, Key, Tempo, Time Signature.
 * Each metric shows an icon, label, and value in a centered column layout.
 * Key cell is tappable to open Circle of Fifths modal.
 */
export const TheoryMetricsRow: React.FC<TheoryMetricsRowProps> = ({
  tuning,
  keyValue,
  tempo,
  timeSignature,
  songTitle,
  artist,
}) => {
  const [showCircleOfFifths, setShowCircleOfFifths] = useState(false);

  const handleKeyPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowCircleOfFifths(true);
  };

  return (
    <>
      <View style={styles.metricsGrid}>
        {/* Row 1: Tuning | Key */}
        <View style={styles.metricsRow}>
          {/* Tuning */}
          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Guitar size={14} color={Colors.vermilion} />
              <Text style={styles.metricLabel}>TUNING</Text>
            </View>
            <Text style={styles.metricValue}>{tuning || 'Standard'}</Text>
          </View>

          {/* Key - Tappable */}
          <Pressable
            style={({ pressed }) => [
              styles.metricItem,
              styles.metricItemTappable,
              pressed && styles.metricItemPressed,
            ]}
            onPress={handleKeyPress}
          >
            <View style={styles.metricHeader}>
              <Music size={14} color={Colors.vermilion} />
              <Text style={styles.metricLabel}>KEY</Text>
              <ChevronRight size={12} color={Colors.graphite} style={styles.chevron} />
            </View>
            <Text style={[styles.metricValue, styles.metricValueTappable]}>
              {keyValue || 'Unknown'}
            </Text>
          </Pressable>
        </View>

        {/* Row 2: Tempo | Time */}
        <View style={styles.metricsRow}>
          {/* Tempo */}
          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Clock size={14} color={Colors.vermilion} />
              <Text style={styles.metricLabel}>TEMPO</Text>
            </View>
            <Text style={styles.metricValue}>{tempo || 'Unknown'}</Text>
          </View>

          {/* Time Signature */}
          <View style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Hash size={14} color={Colors.vermilion} />
              <Text style={styles.metricLabel}>TIME</Text>
            </View>
            <Text style={styles.metricValue}>{timeSignature || '4/4'}</Text>
          </View>
        </View>
      </View>

      {/* Circle of Fifths Modal */}
      <CircleOfFifthsModal
        visible={showCircleOfFifths}
        onClose={() => setShowCircleOfFifths(false)}
        songKey={keyValue || 'C Major'}
        songTitle={songTitle}
        artist={artist}
      />
    </>
  );
};

const styles = StyleSheet.create({
  metricsGrid: {
    gap: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  metricItemTappable: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
    marginTop: -8,
    marginBottom: -8,
  },
  metricItemPressed: {
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  chevron: {
    marginLeft: 'auto',
  },
  metricLabel: {
    fontSize: 10,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.warmGray,
    letterSpacing: 1,
  },
  metricValue: {
    fontSize: 13,
    fontFamily: 'LexendDecaBold',
    color: Colors.charcoal,
  },
  metricValueTappable: {
    color: Colors.vermilion,
    textDecorationLine: 'underline',
  },
});
