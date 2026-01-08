import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
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
 * Web fallback for TodayProgressHero using SVG arc
 * Replaces Skia-based progress ring with SVG for web compatibility
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
  const badgeScale = useRef(new Animated.Value(0)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;

  // Goal met celebration
  useEffect(() => {
    if (goalMet) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        // Haptics not available on web
      }

      Animated.sequence([
        Animated.timing(badgeScale, {
          toValue: 1.2,
          duration: 200,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
        Animated.spring(badgeScale, {
          toValue: 1,
          damping: 8,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.timing(badgeOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      badgeScale.setValue(0);
      badgeOpacity.setValue(0);
    }
  }, [goalMet, badgeScale, badgeOpacity]);

  // SVG arc dimensions
  const size = 200;
  const center = size / 2;
  const radius = 80;
  const strokeWidth = 12;

  // Calculate arc path for SVG
  // 270-degree arc starting from bottom-left (135 degrees)
  const createArcPath = (percentage: number) => {
    const startAngle = 135;
    const sweepAngle = (percentage / 100) * 270;
    const endAngle = startAngle + sweepAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const startX = center + radius * Math.cos(startRad);
    const startY = center + radius * Math.sin(startRad);
    const endX = center + radius * Math.cos(endRad);
    const endY = center + radius * Math.sin(endRad);

    const largeArcFlag = sweepAngle > 180 ? 1 : 0;

    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  };

  // Colors
  const trackColor = Colors.charcoal;
  const progressColor = goalMet ? Colors.moss : Colors.vermilion;
  const glowColor = goalMet ? `${Colors.moss}60` : `${Colors.vermilion}40`;

  return (
    <View style={styles.container}>
      {/* SVG Arc progress display */}
      <View style={styles.arcContainer}>
        <svg width={size} height={size} style={{ position: 'absolute' }}>
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={goalMet ? Colors.moss : Colors.vermilion} />
              <stop offset="100%" stopColor={goalMet ? '#2DD4BF' : '#FF8A65'} />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <path
            d={createArcPath(100)}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Progress arc with glow when > 80% */}
          {progress > 80 && (
            <path
              d={createArcPath(progress)}
              fill="none"
              stroke={glowColor}
              strokeWidth={strokeWidth + 8}
              strokeLinecap="round"
              filter="url(#glow)"
            />
          )}

          {/* Progress arc */}
          {progress > 0 && (
            <path
              d={createArcPath(progress)}
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          )}
        </svg>

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
      <Animated.View
        style={[
          styles.goalBadge,
          {
            transform: [{ scale: badgeScale }],
            opacity: badgeOpacity,
          },
        ]}
      >
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
