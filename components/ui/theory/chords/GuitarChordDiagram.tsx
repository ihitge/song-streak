/**
 * GuitarChordDiagram - Skia-based guitar fretboard chord visualization
 * Renders finger positions, fret numbers, open/muted strings, and barre indicators
 */

import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import {
  Canvas,
  Line,
  Circle,
  Text,
  useFont,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';
import { Colors } from '@/constants/Colors';
import type { ChordFingering } from '@/types/chords';

// Layout constants
const STRINGS = 6;
const FRETS_SHOWN = 4;
const STRING_SPACING = 28;
const FRET_SPACING = 32;
const PADDING = { top: 50, left: 40, right: 40, bottom: 40 };
const DOT_RADIUS = 10;
const NUT_THICKNESS = 4;
const FRET_THICKNESS = 1.5;
const STRING_THICKNESS = 1;

// Calculate canvas dimensions
const FRETBOARD_WIDTH = (STRINGS - 1) * STRING_SPACING;
const FRETBOARD_HEIGHT = FRETS_SHOWN * FRET_SPACING;
const CANVAS_WIDTH = PADDING.left + FRETBOARD_WIDTH + PADDING.right;
const CANVAS_HEIGHT = PADDING.top + FRETBOARD_HEIGHT + PADDING.bottom;

// String tuning labels (low E to high e)
const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'e'];

// Standard tuning open string notes (low E to high e)
const OPEN_STRINGS = ['E', 'A', 'D', 'G', 'B', 'E'];

// Chromatic scale for note calculation
const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Normalize note name (convert flats to sharps for comparison)
const normalizeNote = (note: string): string => {
  const flatToSharp: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#',
    'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B',
  };
  return flatToSharp[note] || note;
};

// Get the note at a specific string/fret position
const getNoteAtPosition = (stringIndex: number, fret: number, baseFret: number = 1): string => {
  const openNote = OPEN_STRINGS[stringIndex];
  const openIndex = CHROMATIC.indexOf(openNote);
  // For fret 0 (open string), no offset; otherwise add baseFret offset
  const actualFret = fret === 0 ? 0 : fret + baseFret - 1;
  return CHROMATIC[(openIndex + actualFret) % 12];
};

// Check if a note matches the root note (handles enharmonics)
const isRootNote = (note: string, rootNote: string): boolean => {
  return normalizeNote(note) === normalizeNote(rootNote);
};

interface GuitarChordDiagramProps {
  fingering: ChordFingering;
  rootNote?: string; // Root note of the chord (e.g., 'C', 'F#', 'Bb')
  showFingers?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const GuitarChordDiagram: React.FC<GuitarChordDiagramProps> = ({
  fingering,
  rootNote,
  showFingers = true,
  size = 'medium',
}) => {
  // Load fonts
  const labelFont = useFont(
    require('@/assets/fonts/LexendDeca-SemiBold.ttf'),
    10,
  );
  const muteFont = useFont(
    require('@/assets/fonts/LexendDeca-Bold.ttf'),
    18,
  );
  const fingerFont = useFont(
    require('@/assets/fonts/LexendDeca-Bold.ttf'),
    11,
  );
  const fretNumberFont = useFont(
    require('@/assets/fonts/LexendDeca-SemiBold.ttf'),
    12,
  );

  // Calculate scale factor based on size
  const scale = size === 'small' ? 0.7 : size === 'large' ? 1.2 : 1;
  const scaledWidth = CANVAS_WIDTH * scale;
  const scaledHeight = CANVAS_HEIGHT * scale;

  // Base fret for movable chords
  const baseFret = fingering.baseFret || 1;
  const showBaseFret = baseFret > 1;

  // Helper: get X position for a string (0 = low E, 5 = high e)
  const getStringX = (stringIndex: number) =>
    (PADDING.left + stringIndex * STRING_SPACING) * scale;

  // Helper: get Y position for a fret (0 = nut, 1-4 = frets)
  const getFretY = (fretIndex: number) =>
    (PADDING.top + fretIndex * FRET_SPACING) * scale;

  // Helper: get Y position for finger dot (centered between frets)
  const getDotY = (fretNumber: number) => {
    const adjustedFret = fretNumber - baseFret + 1;
    return (PADDING.top + adjustedFret * FRET_SPACING - FRET_SPACING / 2) * scale;
  };

  // Show loading state while fonts are loading
  if (!labelFont || !muteFont || !fingerFont || !fretNumberFont) {
    return (
      <View style={[styles.container, styles.loadingContainer, { width: scaledWidth, height: scaledHeight }]}>
        <ActivityIndicator size="small" color={Colors.vermilion} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: scaledWidth, height: scaledHeight }]}>
      <Canvas style={{ width: scaledWidth, height: scaledHeight }}>
        {/* Base fret indicator (for barre/movable chords) */}
        {showBaseFret && (
          <Text
            x={10 * scale}
            y={getDotY(baseFret) + 4 * scale}
            text={`${baseFret}fr`}
            font={fretNumberFont}
            color={Colors.warmGray}
          />
        )}

        {/* Nut (thick line at top) - only for open position chords */}
        {!showBaseFret && (
          <Line
            p1={vec(getStringX(0), getFretY(0))}
            p2={vec(getStringX(5), getFretY(0))}
            color={Colors.charcoal}
            strokeWidth={NUT_THICKNESS * scale}
          />
        )}

        {/* Fret lines */}
        {Array.from({ length: FRETS_SHOWN + 1 }).map((_, fretIndex) => {
          // Skip the nut line if we already drew it
          if (fretIndex === 0 && !showBaseFret) return null;
          return (
            <Line
              key={`fret-${fretIndex}`}
              p1={vec(getStringX(0), getFretY(fretIndex))}
              p2={vec(getStringX(5), getFretY(fretIndex))}
              color={Colors.graphite}
              strokeWidth={FRET_THICKNESS * scale}
            />
          );
        })}

        {/* String lines */}
        {Array.from({ length: STRINGS }).map((_, stringIndex) => (
          <Line
            key={`string-${stringIndex}`}
            p1={vec(getStringX(stringIndex), getFretY(0))}
            p2={vec(getStringX(stringIndex), getFretY(FRETS_SHOWN))}
            color={Colors.charcoal}
            strokeWidth={STRING_THICKNESS * scale}
          />
        ))}

        {/* Open/Muted string markers (above nut) */}
        {fingering.frets.map((fret, stringIndex) => {
          const x = getStringX(stringIndex);
          const y = (PADDING.top - 18) * scale;

          if (fret === null) {
            // Muted string - X marker (sized to match open string circle)
            // y offset of ~7 centers 18px text vertically with circle at y
            return (
              <Text
                key={`mute-${stringIndex}`}
                x={x - 7 * scale}
                y={y + 7 * scale}
                text="×"
                font={muteFont}
                color={Colors.lobsterPink}
              />
            );
          } else if (fret === 0) {
            // Open string - O marker
            // Check if this open string is the root note
            const openStringNote = getNoteAtPosition(stringIndex, 0, baseFret);
            const isRoot = rootNote && isRootNote(openStringNote, rootNote);
            return (
              <Circle
                key={`open-${stringIndex}`}
                cx={x}
                cy={y}
                r={5 * scale}
                style="stroke"
                strokeWidth={1.5 * scale}
                color={isRoot ? Colors.moss : Colors.charcoal}
              />
            );
          }
          return null;
        })}

        {/* Barre indicators */}
        {fingering.barres?.map((barre, barreIndex) => {
          const startX = getStringX(barre.fromString);
          const endX = getStringX(barre.toString);
          const y = getDotY(barre.fret);
          const width = endX - startX;

          return (
            <RoundedRect
              key={`barre-${barreIndex}`}
              x={startX}
              y={y - DOT_RADIUS * scale}
              width={width}
              height={DOT_RADIUS * 2 * scale}
              r={DOT_RADIUS * scale}
              color={Colors.vermilion}
              opacity={0.85}
            />
          );
        })}

        {/* Finger position dots */}
        {fingering.frets.map((fret, stringIndex) => {
          if (fret === null || fret === 0) return null;

          // Skip dots that are covered by barre
          const isCoveredByBarre = fingering.barres?.some(
            (barre) =>
              barre.fret === fret &&
              stringIndex >= barre.fromString &&
              stringIndex <= barre.toString,
          );

          if (isCoveredByBarre) return null;

          const x = getStringX(stringIndex);
          const y = getDotY(fret);
          const finger = fingering.fingers?.[stringIndex];

          // Check if this position plays the root note
          const noteAtPosition = getNoteAtPosition(stringIndex, fret, baseFret);
          const isRoot = rootNote && isRootNote(noteAtPosition, rootNote);
          const dotColor = isRoot ? Colors.moss : Colors.vermilion;

          return (
            <React.Fragment key={`dot-${stringIndex}`}>
              {/* Finger dot */}
              <Circle
                cx={x}
                cy={y}
                r={DOT_RADIUS * scale}
                color={dotColor}
              />

              {/* Finger number (centered inside dot) */}
              {showFingers && finger && finger > 0 && (
                <Text
                  x={x - 3 * scale}
                  y={y + 4 * scale}
                  text={String(finger)}
                  font={fingerFont}
                  color={Colors.softWhite}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* String labels at bottom */}
        {STRING_LABELS.map((label, stringIndex) => {
          const x = getStringX(stringIndex);
          const y = getFretY(FRETS_SHOWN) + 20 * scale;

          return (
            <Text
              key={`label-${stringIndex}`}
              x={x - 4 * scale}
              y={y}
              text={label}
              font={labelFont}
              color={Colors.graphite}
            />
          );
        })}
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    backgroundColor: Colors.softWhite,
    borderRadius: 8,
  },
});

export default GuitarChordDiagram;
