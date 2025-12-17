import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Music, Clock, Hash } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface TheoryMetricsRowProps {
  keyValue: string;
  tempo: string;
  timeSignature: string;
}

/**
 * TheoryMetricsRow - 3-column display for Key, Tempo, Time Signature.
 * Each metric shows an icon, label, and value in a centered column layout.
 */
export const TheoryMetricsRow: React.FC<TheoryMetricsRowProps> = ({
  keyValue,
  tempo,
  timeSignature,
}) => {
  return (
    <View style={styles.metricsRow}>
      {/* Key */}
      <View style={styles.metricItem}>
        <View style={styles.metricHeader}>
          <Music size={14} color={Colors.vermilion} />
          <Text style={styles.metricLabel}>KEY</Text>
        </View>
        <Text style={styles.metricValue}>{keyValue || 'Unknown'}</Text>
      </View>

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
  );
};

const styles = StyleSheet.create({
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
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
    fontSize: 16,
    fontFamily: 'LexendDecaBold',
    color: Colors.charcoal,
  },
});
