/**
 * TunerNoteDisplay Component
 *
 * Large note display showing:
 * - Current detected note name
 * - String label (e.g., "6th String")
 * - Frequency in Hz
 * - Cents deviation
 * - Tuning guidance text
 *
 * Uses CSS styling for web compatibility.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { getTuningGuidance } from '@/utils/tuner/noteDetection';
import type { GuitarString, TunerStatus, TuningDirection } from '@/types/tuner';

interface TunerNoteDisplayProps {
  /** Currently detected string */
  detectedString: GuitarString | null;
  /** Detected frequency in Hz */
  frequency: number | null;
  /** Cents deviation from target */
  cents: number | null;
  /** Tuning direction */
  direction: TuningDirection;
  /** Current tuner status */
  status: TunerStatus;
  /** Whether currently in tune */
  isInTune: boolean;
}

/**
 * Get status color based on tuner state
 */
function getStatusColor(status: TunerStatus, isInTune: boolean): string {
  if (isInTune) return Colors.moss;
  if (status === 'detecting') return Colors.vermilion;
  return Colors.graphite;
}

/**
 * Get status text based on tuner state
 */
function getStatusText(status: TunerStatus): string {
  switch (status) {
    case 'idle':
      return 'TAP START TO BEGIN';
    case 'initializing':
      return 'STARTING...';
    case 'listening':
      return 'PLAY A STRING';
    case 'no_signal':
      return 'NO SIGNAL';
    case 'detecting':
      return 'TUNING...';
    case 'in_tune':
      return 'IN TUNE!';
    default:
      return '';
  }
}

/**
 * Get ordinal suffix (1st, 2nd, 3rd, etc.)
 */
function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export const TunerNoteDisplay: React.FC<TunerNoteDisplayProps> = ({
  detectedString,
  frequency,
  cents,
  direction,
  status,
  isInTune,
}) => {
  const statusColor = getStatusColor(status, isInTune);
  const statusText = getStatusText(status);

  // Get tuning guidance
  const guidance = cents !== null && direction
    ? getTuningGuidance(cents, direction)
    : null;

  return (
    <View style={styles.container}>
      {/* Content */}
      <View style={styles.content}>
        {/* Status indicator */}
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>

        {/* Main note display */}
        <View style={styles.noteSection}>
          {detectedString ? (
            <>
              <Text style={[styles.noteName, isInTune && styles.noteNameInTune]}>
                {detectedString.note}
              </Text>
              <Text style={styles.stringLabel}>
                {detectedString.fullName} ({detectedString.stringNumber}
                {getOrdinalSuffix(detectedString.stringNumber)} String)
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.notePlaceholder}>--</Text>
              <Text style={styles.stringLabel}>Waiting for input...</Text>
            </>
          )}
        </View>

        {/* Frequency and cents display */}
        <View style={styles.dataRow}>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>FREQUENCY</Text>
            <Text style={styles.dataValue}>
              {frequency ? `${frequency.toFixed(1)} Hz` : '--- Hz'}
            </Text>
          </View>

          <View style={styles.dataDivider} />

          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>DEVIATION</Text>
            <Text
              style={[
                styles.dataValue,
                cents !== null && {
                  color:
                    Math.abs(cents) <= 5
                      ? Colors.moss
                      : Math.abs(cents) <= 15
                        ? '#ebcb8b'
                        : Colors.vermilion,
                },
              ]}
            >
              {cents !== null
                ? `${cents >= 0 ? '+' : ''}${cents.toFixed(1)} ¢`
                : '--- ¢'}
            </Text>
          </View>
        </View>

        {/* Tuning guidance */}
        {guidance && status === 'detecting' && (
          <View style={styles.guidanceSection}>
            <Text
              style={[
                styles.guidanceText,
                {
                  color:
                    guidance.urgency === 'perfect'
                      ? Colors.moss
                      : guidance.urgency === 'low'
                        ? '#a3be8c'
                        : guidance.urgency === 'medium'
                          ? '#ebcb8b'
                          : Colors.vermilion,
                },
              ]}
            >
              {guidance.action === 'tighten' && '↑ '}
              {guidance.action === 'loosen' && '↓ '}
              {guidance.message.toUpperCase()}
            </Text>
          </View>
        )}

        {/* In tune celebration */}
        {isInTune && (
          <View style={styles.inTuneSection}>
            <Text style={styles.inTuneText}>PERFECT</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    alignSelf: 'center',
    backgroundColor: Colors.deepSpaceBlue,
    // @ts-ignore - web-specific CSS for radial gradient with darker corners
    backgroundImage: 'radial-gradient(circle, #0E273C 30%, #061219 100%)',
  },
  content: {
    flex: 1,
    padding: 16,
    zIndex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    letterSpacing: 1.5,
  },
  noteSection: {
    alignItems: 'center',
    marginVertical: 8,
  },
  noteName: {
    fontFamily: 'LexendDecaBold',
    fontSize: 64,
    color: Colors.softWhite,
    letterSpacing: 2,
  },
  noteNameInTune: {
    color: Colors.moss,
  },
  notePlaceholder: {
    fontFamily: 'LexendDecaBold',
    fontSize: 64,
    color: Colors.graphite,
    letterSpacing: 2,
  },
  stringLabel: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.graphite,
    marginTop: -4,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginTop: 8,
  },
  dataItem: {
    alignItems: 'center',
  },
  dataLabel: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 8,
    letterSpacing: 1.5,
    color: Colors.warmGray,
  },
  dataValue: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.softWhite,
    marginTop: 2,
  },
  dataDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  guidanceSection: {
    alignItems: 'center',
    marginTop: 12,
  },
  guidanceText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 12,
    letterSpacing: 1,
  },
  inTuneSection: {
    alignItems: 'center',
    marginTop: 12,
  },
  inTuneText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.moss,
    letterSpacing: 2,
  },
});
