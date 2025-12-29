import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import {
  Canvas,
  Group,
  Path,
  Skia,
} from '@shopify/react-native-skia';
import { Colors } from '@/constants/Colors';
import { MasteryPath, PATH_COLORS } from '@/types/mastery';
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
 * Compact skill tree preview for library song cards
 * Shows three arcs representing path completion
 */
export const MiniSkillTree: React.FC<MiniSkillTreeProps> = ({
  theoryProgress,
  techniqueProgress,
  performanceProgress,
  starRating,
  size = 48,
  onPress,
}) => {
  const center = size / 2;
  const radius = size / 2 - 4;
  const strokeWidth = 4;

  // Create arc path for a segment
  const createArcPath = (
    startAngle: number,
    endAngle: number,
    progress: number
  ) => {
    const path = Skia.Path.Make();
    const progressEndAngle = startAngle + (endAngle - startAngle) * (progress / 100);

    // Convert to radians
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (progressEndAngle - 90) * (Math.PI / 180);

    // Calculate points
    const startX = center + radius * Math.cos(startRad);
    const startY = center + radius * Math.sin(startRad);
    const endX = center + radius * Math.cos(endRad);
    const endY = center + radius * Math.sin(endRad);

    // Arc sweep flag
    const largeArc = progressEndAngle - startAngle > 180 ? 1 : 0;

    path.moveTo(startX, startY);
    path.arcToOval(
      { x: center - radius, y: center - radius, width: radius * 2, height: radius * 2 },
      startAngle - 90,
      (progressEndAngle - startAngle),
      false
    );

    return path;
  };

  // Arc angles (120° each, with small gaps)
  const gap = 8; // degrees
  const arcSize = 120 - gap;

  // Performance: 30° to 150° (top-right)
  // Theory: 150° to 270° (left)
  // Technique: 270° to 390° (bottom-right / right)

  return (
    <Pressable
      style={[styles.container, { width: size, height: size }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Canvas style={{ width: size, height: size }}>
        <Group>
          {/* Background arcs (dim) */}
          <Path
            path={createArcPath(30, 30 + arcSize, 100)}
            style="stroke"
            strokeWidth={strokeWidth}
            color="#333333"
            strokeCap="round"
          />
          <Path
            path={createArcPath(150, 150 + arcSize, 100)}
            style="stroke"
            strokeWidth={strokeWidth}
            color="#333333"
            strokeCap="round"
          />
          <Path
            path={createArcPath(270, 270 + arcSize, 100)}
            style="stroke"
            strokeWidth={strokeWidth}
            color="#333333"
            strokeCap="round"
          />

          {/* Progress arcs */}
          {performanceProgress > 0 && (
            <Path
              path={createArcPath(30, 30 + arcSize, performanceProgress)}
              style="stroke"
              strokeWidth={strokeWidth}
              color={PATH_COLORS.performance}
              strokeCap="round"
            />
          )}
          {theoryProgress > 0 && (
            <Path
              path={createArcPath(150, 150 + arcSize, theoryProgress)}
              style="stroke"
              strokeWidth={strokeWidth}
              color={PATH_COLORS.theory}
              strokeCap="round"
            />
          )}
          {techniqueProgress > 0 && (
            <Path
              path={createArcPath(270, 270 + arcSize, techniqueProgress)}
              style="stroke"
              strokeWidth={strokeWidth}
              color={PATH_COLORS.technique}
              strokeCap="round"
            />
          )}
        </Group>
      </Canvas>

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
  centerOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
