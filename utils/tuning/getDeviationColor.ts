/**
 * Tuning Deviation Color Utility
 *
 * Returns a color based on how far the current pitch deviates from the target note.
 * Used by TunerVUMeter, TunerMeter, and TunerNoteDisplay components.
 *
 * Color scale:
 * - Green (#417B5A / Colors.moss): In tune (±5 cents)
 * - Light green (#a3be8c): Close (±15 cents)
 * - Yellow (#ebcb8b): Slightly off (±25 cents)
 * - Orange (#d08770): Moderately off (±35 cents)
 * - Red (Colors.vermilion): Far off (>35 cents)
 */

import { Colors } from '@/constants/Colors';

/**
 * Get color based on tuning deviation in cents
 *
 * @param cents - Deviation from target note in cents (positive = sharp, negative = flat)
 * @param isInTune - Override flag that returns green regardless of cents value
 * @returns Hex color string
 */
export function getDeviationColor(cents: number | null, isInTune: boolean = false): string {
  // If explicitly in tune, return green
  if (isInTune) return Colors.moss;

  // If no reading, return neutral gray
  if (cents === null) return Colors.graphite;

  const absCents = Math.abs(cents);

  // Color thresholds (in cents)
  if (absCents <= 5) return Colors.moss;      // In tune: green
  if (absCents <= 15) return '#a3be8c';       // Close: light green
  if (absCents <= 25) return '#ebcb8b';       // Slightly off: yellow
  if (absCents <= 35) return '#d08770';       // Moderately off: orange
  return Colors.vermilion;                     // Far off: red
}

/**
 * Get background glow color for tuning state
 * Returns a semi-transparent version of the deviation color
 * for use in LED glow effects
 *
 * @param cents - Deviation from target note in cents
 * @param isInTune - Override flag for in-tune state
 * @returns RGBA color string
 */
export function getDeviationGlowColor(cents: number | null, isInTune: boolean = false): string {
  const baseColor = getDeviationColor(cents, isInTune);

  // Convert hex to rgba with 0.3 opacity
  const hexToRgba = (hex: string, alpha: number): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return `rgba(0, 0, 0, ${alpha})`;
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return hexToRgba(baseColor, 0.3);
}
