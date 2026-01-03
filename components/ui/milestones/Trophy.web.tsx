import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  Footprints,
  Flame,
  BookOpen,
  Guitar,
  Star,
  Crown,
  Trophy as TrophyIcon,
  Music,
  Disc,
  Layers,
  ListMusic,
  Library,
  Infinity,
  CalendarCheck,
  Calendar,
  CalendarRange,
  Skull,
  Scroll,
  Sun,
  Zap,
  Feather,
  Award,
  Lock,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { LifetimeMilestone, MILESTONE_TIER_COLORS } from '@/types/milestones';

interface TrophyProps {
  milestone: LifetimeMilestone;
  unlocked: boolean;
  progress?: number;
  isNew?: boolean;
  compact?: boolean;
  onPress?: () => void;
}

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  footprints: Footprints,
  flame: Flame,
  'book-open': BookOpen,
  guitar: Guitar,
  star: Star,
  crown: Crown,
  trophy: TrophyIcon,
  music: Music,
  disc: Disc,
  layers: Layers,
  'list-music': ListMusic,
  library: Library,
  infinity: Infinity,
  'calendar-check': CalendarCheck,
  calendar: Calendar,
  'calendar-range': CalendarRange,
  skull: Skull,
  scroll: Scroll,
  sun: Sun,
  zap: Zap,
  feather: Feather,
  award: Award,
  'music-2': Music,
  'music-3': Music,
};

/**
 * Individual trophy component - Web fallback using CSS
 */
export const Trophy: React.FC<TrophyProps> = ({
  milestone,
  unlocked,
  progress = 0,
  isNew = false,
  compact = false,
  onPress,
}) => {
  const tierColors = MILESTONE_TIER_COLORS[milestone.tier];
  const IconComponent = ICON_MAP[milestone.icon] || TrophyIcon;

  const size = compact ? 48 : 64;
  const iconSize = compact ? 20 : 28;

  // Generate CSS gradient from tier colors
  const gradientColors = unlocked ? tierColors.gradient : ['#3a3a3a', Colors.deepSpaceBlue];
  const gradientStyle = {
    background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1] || gradientColors[0]} 100%)`,
  };

  // Glow effect for unlocked trophies
  const glowStyle = unlocked
    ? {
        boxShadow: isNew
          ? `0 0 20px ${tierColors.primary}80, 0 0 40px ${tierColors.primary}40`
          : `0 0 12px ${tierColors.primary}60`,
      }
    : {};

  return (
    <Pressable
      style={[styles.container, { width: size, height: size + (compact ? 0 : 24) }]}
      onPress={onPress}
      disabled={!onPress}
    >
      {/* Trophy body with CSS gradients */}
      <View
        style={[
          styles.trophyBody,
          {
            width: size,
            height: size,
            borderRadius: 10,
          },
          // @ts-ignore - web-specific style
          gradientStyle,
          glowStyle,
        ]}
      >
        {/* Highlight overlay */}
        <View
          style={[
            styles.highlight,
            {
              width: size - 20,
              height: (size - 12) / 2,
              opacity: unlocked ? 0.3 : 0.1,
            },
          ]}
        />

        {/* Icon */}
        <View style={styles.iconContainer}>
          {unlocked ? (
            <IconComponent
              size={iconSize}
              color={milestone.tier === 'diamond' ? '#0E273C' : Colors.softWhite}
              strokeWidth={2}
            />
          ) : (
            <Lock size={iconSize * 0.8} color={Colors.warmGray} strokeWidth={2} />
          )}
        </View>
      </View>

      {/* Label (non-compact only) */}
      {!compact && (
        <Text
          style={[styles.label, !unlocked && styles.labelLocked]}
          numberOfLines={1}
        >
          {milestone.title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  trophyBody: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    top: 6,
    left: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'LexendDeca-Medium',
    fontSize: 10,
    color: Colors.graphite,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 70,
  },
  labelLocked: {
    color: Colors.warmGray,
    opacity: 0.7,
  },
});
