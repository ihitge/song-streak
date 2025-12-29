import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Colors } from '@/constants/Colors';
import { PATH_COLORS } from '@/types/mastery';
import { StarRating } from './StarRating';

interface MiniSkillTreeProps {
  theoryProgress: number; // 0-100
  techniqueProgress: number; // 0-100
  performanceProgress: number; // 0-100
  starRating: 0 | 1 | 2 | 3;
  size?: number;
  onPress?: () => void;
}

/**
 * Compact skill tree preview for library song cards - Web fallback using CSS
 * Shows three progress bars arranged radially to represent path completion
 */
export const MiniSkillTree: React.FC<MiniSkillTreeProps> = ({
  theoryProgress,
  techniqueProgress,
  performanceProgress,
  starRating,
  size = 48,
  onPress,
}) => {
  const strokeWidth = 4;
  const innerSize = size - strokeWidth * 2;

  // Create a simplified radial progress using three arc segments
  // We use SVG-like approach with rotated bars
  const renderProgressArc = (
    startAngle: number,
    progress: number,
    color: string,
    key: string
  ) => {
    const arcLength = 112; // degrees for each segment
    const progressAngle = (arcLength * progress) / 100;

    // Simple approach: show a colored arc segment
    const arcStyle = {
      position: 'absolute' as const,
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: strokeWidth,
      borderColor: 'transparent',
      borderTopColor: progress > 0 ? color : '#333333',
      borderRightColor: progress > 33 ? color : '#333333',
      borderBottomColor: progress > 66 ? color : '#333333',
      transform: [{ rotate: `${startAngle}deg` }],
    };

    return <View key={key} style={arcStyle} />;
  };

  return (
    <Pressable
      style={[styles.container, { width: size, height: size }]}
      onPress={onPress}
      disabled={!onPress}
    >
      {/* Background ring */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: '#333333',
          },
        ]}
      />

      {/* Progress indicators - simplified as three colored segments */}
      {/* Performance (top-right area) */}
      {performanceProgress > 0 && (
        <View
          style={[
            styles.progressSegment,
            {
              width: size * 0.3,
              height: strokeWidth,
              backgroundColor: PATH_COLORS.performance,
              top: strokeWidth,
              right: size * 0.15,
              transform: [{ rotate: '45deg' }],
              opacity: performanceProgress / 100,
            },
          ]}
        />
      )}

      {/* Theory (left area) */}
      {theoryProgress > 0 && (
        <View
          style={[
            styles.progressSegment,
            {
              width: size * 0.3,
              height: strokeWidth,
              backgroundColor: PATH_COLORS.theory,
              left: strokeWidth,
              top: size * 0.4,
              transform: [{ rotate: '-45deg' }],
              opacity: theoryProgress / 100,
            },
          ]}
        />
      )}

      {/* Technique (bottom-right area) */}
      {techniqueProgress > 0 && (
        <View
          style={[
            styles.progressSegment,
            {
              width: size * 0.3,
              height: strokeWidth,
              backgroundColor: PATH_COLORS.technique,
              bottom: strokeWidth * 2,
              right: size * 0.15,
              transform: [{ rotate: '-30deg' }],
              opacity: techniqueProgress / 100,
            },
          ]}
        />
      )}

      {/* Center star rating */}
      <View style={styles.centerOverlay}>
        <StarRating rating={starRating} size="small" />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  progressSegment: {
    position: 'absolute',
    borderRadius: 2,
  },
  centerOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
