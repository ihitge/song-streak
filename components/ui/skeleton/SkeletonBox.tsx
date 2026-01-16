/**
 * SkeletonBox Component
 *
 * Rectangular placeholder for images, thumbnails, and container elements.
 * Uses SkeletonBase for the underlying shimmer animation.
 */

import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SkeletonBase, SkeletonVariant } from './SkeletonBase';

interface SkeletonBoxProps {
  /**
   * Width in pixels or percentage
   */
  width: number | `${number}%`;
  /**
   * Height in pixels
   */
  height: number;
  /**
   * Border radius (default: 8 for card-like elements)
   */
  borderRadius?: number;
  /**
   * Make it a circle (sets borderRadius to width/2)
   */
  circle?: boolean;
  /**
   * Variant for different backgrounds
   */
  variant?: SkeletonVariant;
  /**
   * Additional styles
   */
  style?: StyleProp<ViewStyle>;
}

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width,
  height,
  borderRadius = 8,
  circle = false,
  variant = 'dark',
  style,
}) => {
  const computedRadius = circle && typeof width === 'number'
    ? width / 2
    : borderRadius;

  return (
    <SkeletonBase
      width={width}
      height={height}
      borderRadius={computedRadius}
      variant={variant}
      style={style}
    />
  );
};

export default SkeletonBox;
