/**
 * SkeletonText Component
 *
 * Text placeholder with configurable width for simulating text lines.
 * Uses SkeletonBase for the underlying shimmer animation.
 */

import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SkeletonBase, SkeletonVariant } from './SkeletonBase';

type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface SkeletonTextProps {
  /**
   * Width as percentage string (e.g., '70%') or number for pixels
   */
  width?: number | `${number}%`;
  /**
   * Preset text size affecting height
   * - xs: 10px (meta text)
   * - sm: 12px (subtitle)
   * - md: 14px (body text)
   * - lg: 16px (title)
   * - xl: 20px (heading)
   */
  size?: TextSize;
  /**
   * Variant for different backgrounds
   */
  variant?: SkeletonVariant;
  /**
   * Additional styles
   */
  style?: StyleProp<ViewStyle>;
}

// Height mappings for text sizes (matching LexendDeca font metrics)
const sizeHeights: Record<TextSize, number> = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
};

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  width = '100%',
  size = 'md',
  variant = 'dark',
  style,
}) => {
  return (
    <SkeletonBase
      width={width}
      height={sizeHeights[size]}
      borderRadius={3}
      variant={variant}
      style={style}
    />
  );
};

export default SkeletonText;
