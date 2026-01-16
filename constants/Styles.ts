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
  '2xl': 24,
  xxl: 24,  // Alias for backwards compatibility
  xxxl: 32,
} as const;

/**
 * Border radius scale for consistent rounded corners
 */
export const BORDER_RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

/**
 * Font size scale for typography
 */
export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
} as const;

/**
 * Pre-defined shadow styles for consistent elevation
 * Eliminates duplicate inline shadow declarations across components
 */
export const SHADOWS = {
  /** Standard button shadow - subtle depth */
  button: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  /** Housing/chassis shadow - deep, prominent */
  housing: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  /** FAB shadow - medium depth, focused */
  fab: {
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  /** Card shadow - subtle, offset */
  card: {
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 4,
  },
  /** VU meter housing shadow - for reel-to-reel and practice meters */
  vuMeter: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
} as const;

/**
 * Pre-defined bevel styles for tactile button effects
 * Creates raised/pressed appearance with highlight and shadow borders
 */
export const BEVELS = {
  /** Standard raised button bevel */
  raised: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.5)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  /** Housing/chassis bevel - more pronounced */
  housing: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0,0,0,0.4)',
  },
  /** Subtle bevel for smaller controls */
  subtle: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
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
