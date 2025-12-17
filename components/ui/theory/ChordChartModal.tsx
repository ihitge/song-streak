/**
 * ChordChartModal - Full-screen modal displaying guitar chord diagram
 * Shows chord visualization with voicing selector and close button
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Pressable,
} from 'react-native';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useClickSound } from '@/hooks/useClickSound';
import { lookupChord, getDefaultVoicing } from '@/data/chords';
import type { InstrumentType } from '@/types/chords';
import { ChordVisualization } from './chords/ChordVisualization';

interface ChordChartModalProps {
  visible: boolean;
  chordName: string;
  instrument: InstrumentType;
  onClose: () => void;
}

export const ChordChartModal: React.FC<ChordChartModalProps> = ({
  visible,
  chordName,
  instrument,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const { playSound } = useClickSound();
  const [voicingIndex, setVoicingIndex] = useState(0);

  // Get chord data
  const lookupResult = lookupChord(chordName);
  const hasChord =
    (lookupResult.status === 'found' ||
      lookupResult.status === 'generated' ||
      lookupResult.status === 'partial') &&
    lookupResult.chord &&
    lookupResult.chord.voicings.length > 0;
  const totalVoicings = hasChord ? lookupResult.chord!.voicings.length : 1;
  const hasMultipleVoicings = hasChord && totalVoicings > 1;
  const isGenerated = lookupResult.isGenerated === true;
  const isPartial = lookupResult.status === 'partial';

  // Reset voicing index when chord changes
  useEffect(() => {
    setVoicingIndex(0);
  }, [chordName]);

  // Animation
  useEffect(() => {
    if (visible) {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    onClose();
  };

  const handlePrevVoicing = async () => {
    if (voicingIndex > 0) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await playSound();
      setVoicingIndex(voicingIndex - 1);
    }
  };

  const handleNextVoicing = async () => {
    if (voicingIndex < totalVoicings - 1) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await playSound();
      setVoicingIndex(voicingIndex + 1);
    }
  };

  // Safe voicing access with bounds checking
  const safeVoicingIndex = hasChord
    ? Math.min(voicingIndex, Math.max(0, totalVoicings - 1))
    : 0;
  const currentVoicing = hasChord
    ? lookupResult.chord?.voicings[safeVoicingIndex] ?? null
    : null;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>CHORD DIAGRAM</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <X size={20} color={Colors.warmGray} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Chord Visualization */}
            <View style={styles.diagramContainer}>
              <ChordVisualization
                chord={chordName}
                instrument={instrument}
                voicingIndex={voicingIndex}
                showFingers={true}
                size="large"
                showChordName={true}
              />
            </View>

            {/* Voicing Selector (if multiple voicings) */}
            {hasMultipleVoicings && (
              <View style={styles.voicingSelector}>
                <TouchableOpacity
                  style={[
                    styles.voicingButton,
                    voicingIndex === 0 && styles.voicingButtonDisabled,
                  ]}
                  onPress={handlePrevVoicing}
                  disabled={voicingIndex === 0}
                  activeOpacity={0.7}
                >
                  <ChevronLeft
                    size={20}
                    color={voicingIndex === 0 ? Colors.graphite : Colors.charcoal}
                    strokeWidth={2}
                  />
                </TouchableOpacity>

                <View style={styles.voicingInfo}>
                  <Text style={styles.voicingName}>
                    {currentVoicing?.name || 'Default'}
                  </Text>
                  <Text style={styles.voicingCount}>
                    {voicingIndex + 1} of {totalVoicings}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.voicingButton,
                    voicingIndex === totalVoicings - 1 &&
                      styles.voicingButtonDisabled,
                  ]}
                  onPress={handleNextVoicing}
                  disabled={voicingIndex === totalVoicings - 1}
                  activeOpacity={0.7}
                >
                  <ChevronRight
                    size={20}
                    color={
                      voicingIndex === totalVoicings - 1
                        ? Colors.graphite
                        : Colors.charcoal
                    }
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* Partial Chord Warning */}
            {isPartial && lookupResult.warning && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>{lookupResult.warning}</Text>
              </View>
            )}

            {/* Badges Row */}
            <View style={styles.badgesRow}>
              {/* Generated Badge */}
              {isGenerated && (
                <View style={styles.generatedBadge}>
                  <Text style={styles.generatedText}>GENERATED</Text>
                </View>
              )}

              {/* Partial Badge */}
              {isPartial && (
                <View style={styles.partialBadge}>
                  <Text style={styles.partialText}>PARTIAL</Text>
                </View>
              )}

              {/* Difficulty Badge */}
              {currentVoicing?.difficulty && (
                <View
                  style={[
                    styles.difficultyBadge,
                    {
                      backgroundColor:
                        currentVoicing.difficulty === 'easy'
                          ? Colors.moss
                          : currentVoicing.difficulty === 'intermediate'
                            ? '#D4A017'
                            : Colors.vermilion,
                    },
                  ]}
                >
                  <Text style={styles.difficultyText}>
                    {currentVoicing.difficulty.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 340,
  },
  content: {
    backgroundColor: Colors.matteFog,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    // Bevel effect
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.5)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.15)',
    // Shadow
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.warmGray,
  },
  closeButton: {
    padding: 4,
  },
  diagramContainer: {
    backgroundColor: Colors.softWhite,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // Recessed effect
    borderWidth: 1,
    borderColor: Colors.alloy,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  voicingSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  voicingButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.alloy,
    justifyContent: 'center',
    alignItems: 'center',
    // Recessed
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.5)',
  },
  voicingButtonDisabled: {
    opacity: 0.5,
  },
  voicingInfo: {
    alignItems: 'center',
    minWidth: 100,
  },
  voicingName: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 14,
    color: Colors.charcoal,
  },
  voicingCount: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 10,
    color: Colors.warmGray,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  generatedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.deepSpaceBlue,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  generatedText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 8,
    letterSpacing: 1.5,
    color: Colors.softWhite,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 9,
    letterSpacing: 1,
    color: Colors.softWhite,
  },
  warningContainer: {
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(212, 160, 23, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 23, 0.3)',
  },
  warningText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 11,
    color: '#B8860B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  partialBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#D4A017',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  partialText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 8,
    letterSpacing: 1.5,
    color: Colors.softWhite,
  },
});

export default ChordChartModal;
