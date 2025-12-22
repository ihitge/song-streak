/**
 * TunerStringSelector Component
 *
 * Row of buttons for selecting guitar strings.
 * Shows all 6 strings with visual feedback for:
 * - Currently detected string (auto-highlight)
 * - In-tune status (green glow)
 *
 * Uses CSS styling for web compatibility.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useGangSwitchSound } from '@/hooks/useGangSwitchSound';
import { GUITAR_STRINGS_ARRAY, type GuitarString } from '@/types/tuner';

interface TunerStringSelectorProps {
  /** Currently detected string (auto-selected) */
  detectedString: GuitarString | null;
  /** Whether currently in tune */
  isInTune: boolean;
  /** Optional: manually select a string (for reference tone) */
  onStringSelect?: (string: GuitarString) => void;
  /** Whether tuner is active */
  isActive: boolean;
}

const BUTTON_HEIGHT = 48;
const WELL_HEIGHT = 60;
const BORDER_RADIUS = 4;

export const TunerStringSelector: React.FC<TunerStringSelectorProps> = ({
  detectedString,
  isInTune,
  onStringSelect,
  isActive,
}) => {
  const { playSound } = useGangSwitchSound();

  const handlePress = async (guitarString: GuitarString) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    onStringSelect?.(guitarString);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>STRINGS</Text>

      <View style={styles.wellContainer}>
        {/* String Buttons Row */}
        <View style={styles.buttonsRow}>
          {GUITAR_STRINGS_ARRAY.map((guitarString) => {
            const isDetected =
              detectedString?.stringNumber === guitarString.stringNumber;
            const isInTuneForString = isDetected && isInTune;

            return (
              <Pressable
                key={guitarString.stringNumber}
                onPress={() => handlePress(guitarString)}
                style={[
                  styles.buttonCap,
                  isDetected && styles.buttonCapActive,
                ]}
              >
                {/* Button Content */}
                <View style={styles.buttonContent}>
                  {/* String number */}
                  <Text
                    style={[
                      styles.stringNumber,
                      isDetected && styles.stringNumberActive,
                      isInTuneForString && styles.stringNumberInTune,
                    ]}
                  >
                    {guitarString.stringNumber}
                  </Text>

                  {/* Note name */}
                  <Text
                    style={[
                      styles.stringNote,
                      isDetected && styles.stringNoteActive,
                      isInTuneForString && styles.stringNoteInTune,
                    ]}
                  >
                    {guitarString.note}
                  </Text>

                  {/* LED Indicator - when detected */}
                  {isDetected && (
                    <View style={styles.ledContainer}>
                      <View
                        style={[
                          styles.ledDot,
                          isInTuneForString && styles.ledDotInTune,
                        ]}
                      />
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
    width: '100%',
    paddingHorizontal: 16,
  },
  label: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.warmGray,
    textTransform: 'uppercase',
  },
  wellContainer: {
    position: 'relative',
    height: WELL_HEIGHT,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: Colors.alloy,
  },
  buttonsRow: {
    flex: 1,
    flexDirection: 'row',
    padding: 6,
    gap: 2,
  },
  buttonCap: {
    flex: 1,
    height: BUTTON_HEIGHT,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Colors.softWhite,
  },
  buttonCapActive: {
    backgroundColor: Colors.charcoal,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    zIndex: 1,
  },
  stringNumber: {
    fontFamily: 'LexendDecaBold',
    fontSize: 16,
    color: Colors.charcoal,
  },
  stringNumberActive: {
    color: Colors.softWhite,
  },
  stringNumberInTune: {
    color: Colors.moss,
  },
  stringNote: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 9,
    color: Colors.graphite,
    marginTop: -2,
  },
  stringNoteActive: {
    color: 'rgba(255,255,255,0.7)',
  },
  stringNoteInTune: {
    color: Colors.moss,
  },
  ledContainer: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  ledDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.vermilion,
  },
  ledDotInTune: {
    backgroundColor: Colors.moss,
  },
});
