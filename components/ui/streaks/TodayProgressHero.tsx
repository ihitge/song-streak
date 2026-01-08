import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  LinearGradient,
  BlurMask,
  vec,
  Group,
} from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { StreakFlame } from './StreakFlame';
import { getFlameLevel } from '@/types/streak';

interface TodayProgressHeroProps {
  currentMinutes: number;
  goalMinutes: number;
  goalMet: boolean;
  streakDays: number;
  isActive: boolean;
}

/**
 * VU meter arc-style progress display with centered flame
 * Shows today's practice progress toward daily goal
 */
export const TodayProgressHero: React.FC<TodayProgressHeroProps> = ({
  currentMinutes,
  goalMinutes,
  goalMet,
  streakDays,
  isActive,
}) => {
  const progress = Math.min(100, Math.round((currentMinutes / goalMinutes) * 100));
  const flameLevel = getFlameLevel(streakDays);

  // Animation values
  const badgeScale = useSharedValue(0);
  const progressGlow = useSharedValue(0);

  // Goal met celebration
  useEffect(() => {
    if (goalMet) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      badgeScale.value = withSequence(
        withTiming(1.2, { duration: 200, easing: Easing.out(Easing.back(2)) }),
        withSpring(1, { damping: 8, stiffness: 200 })
      );
      progressGlow.value = withTiming(1, { duration: 500 });
    } else {
      badgeScale.value = 0;
      progressGlow.value = 0;
    }
  }, [goalMet, badgeScale, progressGlow]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
    opacity: badgeScale.value,
  }));

  // Canvas dimensions
  const size = 200; // Total canvas size
  const center = size / 2;
  const radius = 80; // Arc radius
  const strokeWidth = 12;

  // Background track arc
  const createTrackPath = () => {
    const path = Skia.Path.Make();
    const trackRadius = radius;

    // Create thick arc using two arcs (outer and inner) connected
    const outerRadius = trackRadius + strokeWidth / 2;
    const innerRadius = trackRadius - strokeWidth / 2;

    // Outer arc (clockwise)
    path.addArc(
      {
        x: center - outerRadius,
        y: center - outerRadius,
        width: outerRadius * 2,
        height: outerRadius * 2,
      },
      135,
      270
    );

    return path;
  };

  // Progress arc
  const progressAngle = (progress / 100) * 270;

  const createProgressPath = () => {
    if (progress <= 0) return Skia.Path.Make();

    const path = Skia.Path.Make();
    const outerRadius = radius + strokeWidth / 2;

    path.addArc(
      {
        x: center - outerRadius,
        y: center - outerRadius,
        width: outerRadius * 2,
        height: outerRadius * 2,
      },
      135,
      progressAngle
    );

    return path;
  };

  // Color based on state
  const getProgressColor = () => {
    if (goalMet) return Colors.moss;
    return Colors.vermilion;
  };

  const getGlowColor = () => {
    if (goalMet) return `${Colors.moss}60`;
    return `${Colors.vermilion}40`;
  };

  return (
    <View style={styles.container}>
      {/* Arc progress display */}
      <View style={styles.arcContainer}>
        <Canvas style={{ width: size, height: size }}>
          <Group>
            {/* Background track */}
            <Path
              path={createTrackPath()}
              style="stroke"
              strokeWidth={strokeWidth}
              strokeCap="round"
            >
              <LinearGradient
                start={vec(0, size)}
                end={vec(size, 0)}
                colors={[Colors.charcoal, '#1a1a1a']}
              />
            </Path>

            {/* Progress glow (when goal met or high progress) */}
            {progress > 80 && (
              <Path
                path={createProgressPath()}
                style="stroke"
                strokeWidth={strokeWidth + 8}
                strokeCap="round"
              >
                <BlurMask blur={12} style="normal" />
                <LinearGradient
                  start={vec(0, size)}
                  end={vec(size, 0)}
                  colors={[getGlowColor(), 'transparent']}
                />
              </Path>
            )}

            {/* Progress arc */}
            <Path
              path={createProgressPath()}
              style="stroke"
              strokeWidth={strokeWidth}
              strokeCap="round"
            >
              <LinearGradient
                start={vec(0, size)}
                end={vec(size, 0)}
                colors={
                  goalMet
                    ? [Colors.moss, '#2DD4BF']
                    : [Colors.vermilion, '#FF8A65']
                }
              />
            </Path>

            {/* Inner glow highlight on progress */}
            {progress > 0 && (
              <Path
                path={createProgressPath()}
                style="stroke"
                strokeWidth={strokeWidth - 4}
                strokeCap="round"
              >
                <LinearGradient
                  start={vec(center, center - radius)}
                  end={vec(center, center + radius)}
                  colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0)']}
                />
              </Path>
            )}
          </Group>
        </Canvas>

        {/* Centered flame */}
        <View style={styles.flameContainer}>
          <StreakFlame
            streakDays={streakDays}
            size={60}
            animated={isActive}
          />
        </View>
      </View>

      {/* Progress text */}
      <View style={styles.progressInfo}>
        <Text style={styles.progressValue}>
          {currentMinutes} / {goalMinutes}
        </Text>
        <Text style={styles.progressLabel}>MINUTES TODAY</Text>
      </View>

      {/* Goal Met badge */}
      <Animated.View style={[styles.goalBadge, badgeStyle]}>
        <Text style={styles.goalBadgeText}>GOAL MET!</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  arcContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  progressValue: {
    fontFamily: 'LexendDecaBold',
    fontSize: 28,
    color: Colors.softWhite,
    letterSpacing: 1,
  },
  progressLabel: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    color: Colors.warmGray,
    letterSpacing: 2,
    marginTop: 4,
  },
  goalBadge: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: Colors.moss,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    // Glow effect
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  goalBadgeText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 12,
    color: Colors.softWhite,
    letterSpacing: 2,
  },
});
