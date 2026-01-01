/**
 * GuitarChordDiagram.web - SVG-based guitar fretboard chord visualization for web
 * Renders finger positions, fret numbers, open/muted strings, and barre indicators
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Line, Circle, Rect, G, Text as SvgText } from 'react-native-svg';
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

  return (
    <View style={[styles.container, { width: scaledWidth, height: scaledHeight }]}>
      <Svg width={scaledWidth} height={scaledHeight} viewBox={`0 0 ${scaledWidth} ${scaledHeight}`}>
        {/* Base fret indicator (for barre/movable chords) */}
        {showBaseFret && (
          <SvgText
            x={10 * scale}
            y={getDotY(baseFret) + 4 * scale}
            fontSize={12 * scale}
            fontFamily="LexendDeca-SemiBold"
            fill={Colors.warmGray}
          >
            {`${baseFret}fr`}
          </SvgText>
        )}

        {/* Nut (thick line at top) - only for open position chords */}
        {!showBaseFret && (
          <Line
            x1={getStringX(0)}
            y1={getFretY(0)}
            x2={getStringX(5)}
            y2={getFretY(0)}
            stroke={Colors.charcoal}
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
              x1={getStringX(0)}
              y1={getFretY(fretIndex)}
              x2={getStringX(5)}
              y2={getFretY(fretIndex)}
              stroke={Colors.graphite}
              strokeWidth={FRET_THICKNESS * scale}
            />
          );
        })}

        {/* String lines */}
        {Array.from({ length: STRINGS }).map((_, stringIndex) => (
          <Line
            key={`string-${stringIndex}`}
            x1={getStringX(stringIndex)}
            y1={getFretY(0)}
            x2={getStringX(stringIndex)}
            y2={getFretY(FRETS_SHOWN)}
            stroke={Colors.charcoal}
            strokeWidth={STRING_THICKNESS * scale}
          />
        ))}

        {/* Open/Muted string markers (above nut) */}
        {fingering.frets.map((fret, stringIndex) => {
          const x = getStringX(stringIndex);
          const y = (PADDING.top - 18) * scale;

          if (fret === null) {
            // Muted string - X marker
            return (
              <SvgText
                key={`mute-${stringIndex}`}
                x={x}
                y={y + 7 * scale}
                fontSize={18 * scale}
                fontFamily="LexendDeca-Bold"
                fill={Colors.lobsterPink}
                textAnchor="middle"
              >
                ×
              </SvgText>
            );
          } else if (fret === 0) {
            // Open string - O marker
            const openStringNote = getNoteAtPosition(stringIndex, 0, baseFret);
            const isRoot = rootNote && isRootNote(openStringNote, rootNote);
            return (
              <Circle
                key={`open-${stringIndex}`}
                cx={x}
                cy={y}
                r={5 * scale}
                fill="none"
                stroke={isRoot ? Colors.moss : Colors.charcoal}
                strokeWidth={1.5 * scale}
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
            <Rect
              key={`barre-${barreIndex}`}
              x={startX}
              y={y - DOT_RADIUS * scale}
              width={width}
              height={DOT_RADIUS * 2 * scale}
              rx={DOT_RADIUS * scale}
              ry={DOT_RADIUS * scale}
              fill={Colors.vermilion}
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
            <G key={`dot-${stringIndex}`}>
              {/* Finger dot */}
              <Circle
                cx={x}
                cy={y}
                r={DOT_RADIUS * scale}
                fill={dotColor}
              />

              {/* Finger number (centered inside dot) */}
              {showFingers && finger && finger > 0 && (
                <SvgText
                  x={x}
                  y={y + 4 * scale}
                  fontSize={11 * scale}
                  fontFamily="LexendDeca-Bold"
                  fill={Colors.softWhite}
                  textAnchor="middle"
                >
                  {String(finger)}
                </SvgText>
              )}
            </G>
          );
        })}

        {/* String labels at bottom */}
        {STRING_LABELS.map((label, stringIndex) => {
          const x = getStringX(stringIndex);
          const y = getFretY(FRETS_SHOWN) + 20 * scale;

          return (
            <SvgText
              key={`label-${stringIndex}`}
              x={x}
              y={y}
              fontSize={10 * scale}
              fontFamily="LexendDeca-SemiBold"
              fill={Colors.graphite}
              textAnchor="middle"
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GuitarChordDiagram;
