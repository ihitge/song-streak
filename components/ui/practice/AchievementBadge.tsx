import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

/**
 * Individual achievement badge with tier-colored ring
 * Shows locked/unlocked state with appropriate styling
 */
export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  unlocked,
  compact = false,
}) => {
  const IconComponent = ICON_MAP[achievement.icon] || Star;
  const tierColor = TIER_COLORS[achievement.tier];

  // Get gradient colors based on tier
  const getGradientColors = (tier: AchievementTier): [string, string] => {
    switch (tier) {
      case 'bronze':
        return ['#CD7F32', '#8B4513'];
      case 'silver':
        return ['#E8E8E8', '#A0A0A0'];
      case 'gold':
        return ['#FFD700', '#DAA520'];
      case 'platinum':
        return ['#E5E4E2', '#B0B0B0'];
    }
  };

  const size = compact ? 48 : 64;
  const iconSize = compact ? 20 : 28;
  const ringWidth = compact ? 3 : 4;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Outer ring with tier color */}
      <View
        style={[
          styles.outerRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: ringWidth,
            borderColor: unlocked ? tierColor : Colors.graphite,
            opacity: unlocked ? 1 : 0.4,
          },
        ]}
      >
        {/* Inner badge */}
        {unlocked ? (
          <LinearGradient
            colors={getGradientColors(achievement.tier)}
            style={[
              styles.innerBadge,
              {
                width: size - ringWidth * 2 - 4,
                height: size - ringWidth * 2 - 4,
                borderRadius: (size - ringWidth * 2 - 4) / 2,
              },
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <IconComponent size={iconSize} color={Colors.ink} strokeWidth={2.5} />
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.innerBadgeLocked,
              {
                width: size - ringWidth * 2 - 4,
                height: size - ringWidth * 2 - 4,
                borderRadius: (size - ringWidth * 2 - 4) / 2,
              },
            ]}
          >
            <Lock size={iconSize - 4} color={Colors.graphite} strokeWidth={2} />
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
};

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
