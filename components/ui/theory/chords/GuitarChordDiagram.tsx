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
const PADDING = { top: 50, left: 50, right: 30, bottom: 40 };
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

interface GuitarChordDiagramProps {
  fingering: ChordFingering;
  chordName?: string;
  showFingers?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const GuitarChordDiagram: React.FC<GuitarChordDiagramProps> = ({
  fingering,
  chordName,
  showFingers = true,
  size = 'medium',
}) => {
  // Load fonts
  const labelFont = useFont(
    require('@/assets/fonts/LexendDeca-SemiBold.ttf'),
    10,
  );
  const fingerFont = useFont(
    require('@/assets/fonts/LexendDeca-Bold.ttf'),
    11,
  );
  const chordNameFont = useFont(
    require('@/assets/fonts/LexendDeca-Bold.ttf'),
    16,
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
  if (!labelFont || !fingerFont || !chordNameFont || !fretNumberFont) {
    return (
      <View style={[styles.container, styles.loadingContainer, { width: scaledWidth, height: scaledHeight }]}>
        <ActivityIndicator size="small" color={Colors.vermilion} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: scaledWidth, height: scaledHeight }]}>
      <Canvas style={{ width: scaledWidth, height: scaledHeight }}>
        {/* Chord name at top */}
        {chordName && (
          <Text
            x={scaledWidth / 2 - chordNameFont.measureText(chordName).width / 2}
            y={20 * scale}
            text={chordName}
            font={chordNameFont}
            color={Colors.charcoal}
          />
        )}

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
            // Muted string - X marker
            return (
              <Text
                key={`mute-${stringIndex}`}
                x={x - 5 * scale}
                y={y + 4 * scale}
                text="×"
                font={labelFont}
                color={Colors.lobsterPink}
              />
            );
          } else if (fret === 0) {
            // Open string - O marker
            return (
              <Circle
                key={`open-${stringIndex}`}
                cx={x}
                cy={y}
                r={5 * scale}
                style="stroke"
                strokeWidth={1.5 * scale}
                color={Colors.moss}
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

          return (
            <React.Fragment key={`dot-${stringIndex}`}>
              {/* Finger dot */}
              <Circle
                cx={x}
                cy={y}
                r={DOT_RADIUS * scale}
                color={Colors.vermilion}
              />

              {/* Finger number (inside dot) */}
              {showFingers && finger && finger > 0 && (
                <Text
                  x={x - 4 * scale}
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
