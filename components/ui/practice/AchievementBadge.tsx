import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Footprints,
  Flame,
  BookOpen,
  Guitar,
  Star,
  Crown,
  Trophy,
  Lock,
  LucideIcon,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Achievement, AchievementTier, TIER_COLORS } from '@/types/practice';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  compact?: boolean;
}

// Map icon names to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  footprints: Footprints,
  flame: Flame,
  'book-open': BookOpen,
  guitar: Guitar,
  star: Star,
  crown: Crown,
  trophy: Trophy,
};

// Gradient colors by tier (static, doesn't need memoization)
const TIER_GRADIENTS: Record<AchievementTier, [string, string]> = {
  bronze: ['#CD7F32', '#8B4513'],
  silver: ['#E8E8E8', '#A0A0A0'],
  gold: ['#FFD700', '#DAA520'],
  platinum: ['#E5E4E2', '#B0B0B0'],
};

/**
 * Individual achievement badge with tier-colored ring
 * Shows locked/unlocked state with appropriate styling
 * Memoized to prevent unnecessary re-renders in grids
 */
export const AchievementBadge: React.FC<AchievementBadgeProps> = React.memo(({
  achievement,
  unlocked,
  compact = false,
}) => {
  const IconComponent = ICON_MAP[achievement.icon] || Star;
  const tierColor = TIER_COLORS[achievement.tier];
  const gradientColors = TIER_GRADIENTS[achievement.tier];

  // Memoize computed dimensions
  const dimensions = useMemo(() => {
    const size = compact ? 48 : 64;
    const iconSize = compact ? 20 : 28;
    const ringWidth = compact ? 3 : 4;
    const innerSize = size - ringWidth * 2 - 4;
    return { size, iconSize, ringWidth, innerSize };
  }, [compact]);

  // Memoize outer ring style
  const outerRingStyle = useMemo((): ViewStyle => ({
    width: dimensions.size,
    height: dimensions.size,
    borderRadius: dimensions.size / 2,
    borderWidth: dimensions.ringWidth,
    borderColor: unlocked ? tierColor : Colors.graphite,
    opacity: unlocked ? 1 : 0.4,
  }), [dimensions, unlocked, tierColor]);

  // Memoize inner badge style
  const innerBadgeStyle = useMemo((): ViewStyle => ({
    width: dimensions.innerSize,
    height: dimensions.innerSize,
    borderRadius: dimensions.innerSize / 2,
  }), [dimensions.innerSize]);

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Outer ring with tier color */}
      <View style={[styles.outerRing, outerRingStyle]}>
        {/* Inner badge */}
        {unlocked ? (
          <LinearGradient
            colors={gradientColors}
            style={[styles.innerBadge, innerBadgeStyle]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <IconComponent size={dimensions.iconSize} color={Colors.ink} strokeWidth={2.5} />
          </LinearGradient>
        ) : (
          <View style={[styles.innerBadgeLocked, innerBadgeStyle]}>
            <Lock size={dimensions.iconSize - 4} color={Colors.graphite} strokeWidth={2} />
          </View>
        )}
      </View>

      {/* Badge title */}
      {!compact && (
        <Text
          style={[styles.title, !unlocked && styles.titleLocked]}
          numberOfLines={2}
        >
          {achievement.title}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 80,
    gap: 6,
  },
  containerCompact: {
    width: 56,
    gap: 4,
  },
  outerRing: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  innerBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    // Emboss effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  innerBadgeLocked: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.alloy,
  },
  title: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    color: Colors.charcoal,
    textAlign: 'center',
    lineHeight: 12,
  },
  titleLocked: {
    color: Colors.graphite,
    opacity: 0.6,
  },
});
