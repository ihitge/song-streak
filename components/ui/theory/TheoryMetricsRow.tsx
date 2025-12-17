import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Music, Clock, Hash, Guitar } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface TheoryMetricsRowProps {
  tuning: string;
  keyValue: string;
  tempo: string;
  timeSignature: string;
}

/**
 * TheoryMetricsRow - 2x2 grid display for Tuning, Key, Tempo, Time Signature.
 * Each metric shows an icon, label, and value in a centered column layout.
 */
export const TheoryMetricsRow: React.FC<TheoryMetricsRowProps> = ({
  tuning,
  keyValue,
  tempo,
  timeSignature,
}) => {
  return (
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

        {/* Key */}
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Music size={14} color={Colors.vermilion} />
            <Text style={styles.metricLabel}>KEY</Text>
          </View>
          <Text style={styles.metricValue}>{keyValue || 'Unknown'}</Text>
        </View>
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
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
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
});
