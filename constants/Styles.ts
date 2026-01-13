import { StyleSheet } from 'react-native';
import { Colors } from './Colors';

/**
 * Standardized icon sizes for consistent visual hierarchy
 * Use these instead of arbitrary sizes throughout the app
 */
export const ICON_SIZES = {
  /** Extra small - metadata, labels, inline indicators (12px) */
  xs: 12,
  /** Small - inline icons, secondary controls (16px) */
  sm: 16,
  /** Medium - standard controls, navigation (20px) */
  md: 20,
  /** Large - primary controls, buttons (24px) */
  lg: 24,
  /** Extra large - featured elements, FAB icons (28px) */
  xl: 28,
  /** Hero - large displays, modals (32px) */
  hero: 32,
} as const;

/**
 * Minimum touch target sizes for accessibility
 * Apple HIG: 44x44pt, Android: 48x48dp (we use 44 as minimum)
 */
export const TOUCH_TARGETS = {
  /** Minimum touch target size (44pt - Apple HIG minimum) */
  minimum: 44,
  /** Comfortable touch target (48pt - Android recommended) */
  comfortable: 48,
  /** Large touch target for primary actions (56pt) */
  large: 56,
  /** Extra large for FAB and hero buttons (64pt) */
  xl: 64,
} as const;

/**
 * Spacing scale based on 4px grid
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Typography = StyleSheet.create({
  // App branding
  appLogo: {
    fontFamily: 'MomoTrustDisplay',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    color: Colors.charcoal,
    marginBottom: 4,
  },

  // Song card typography
  songTitle: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.ink,
  },
  songArtist: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.warmGray,
    textTransform: 'uppercase',
  },

  // Labels and meta text
  label: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: Colors.vermilion,
  },
  metaText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 10,
    color: Colors.warmGray,
    textTransform: 'uppercase',
  },
});
