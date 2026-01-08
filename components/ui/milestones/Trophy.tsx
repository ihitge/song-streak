import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  Canvas,
  RoundedRect,
  Group,
  LinearGradient,
  BlurMask,
  vec,
} from '@shopify/react-native-skia';
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
  CalendarDays,
  Brain,
  Gem,
  Hourglass,
  Skull,
  Scroll,
  Sun,
  Zap,
  Feather,
  Award,
  Lock,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { LifetimeMilestone, MilestoneTier, MILESTONE_TIER_COLORS } from '@/types/milestones';

interface TrophyProps {
  milestone: LifetimeMilestone;
  unlocked: boolean;
  progress?: number; // 0-100
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
  'calendar-days': CalendarDays,
  brain: Brain,
  gem: Gem,
  hourglass: Hourglass,
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
 * Individual trophy component with metallic appearance
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

  return (
    <Pressable
      style={[styles.container, { width: size, height: size + (compact ? 0 : 24) }]}
      onPress={onPress}
      disabled={!onPress}
    >
      {/* Trophy body with Skia */}
      <View style={{ width: size, height: size }}>
        <Canvas style={{ width: size, height: size }}>
          <Group>
            {/* Glow effect (unlocked only) */}
            {unlocked && (
              <RoundedRect
                x={4}
                y={4}
                width={size - 8}
                height={size - 8}
                r={8}
              >
                <BlurMask blur={isNew ? 12 : 6} style="normal" />
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(size, size)}
                  colors={[`${tierColors.primary}80`, `${tierColors.primary}40`]}
                />
              </RoundedRect>
            )}

            {/* Trophy base */}
            <RoundedRect
              x={2}
              y={2}
              width={size - 4}
              height={size - 4}
              r={10}
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(size, size)}
                colors={unlocked ? tierColors.gradient : ['#3a3a3a', Colors.deepSpaceBlue]}
              />
            </RoundedRect>

            {/* Highlight */}
            <RoundedRect
              x={6}
              y={6}
              width={size - 20}
              height={(size - 12) / 2}
              r={4}
              opacity={unlocked ? 0.3 : 0.1}
            >
              <LinearGradient
                start={vec(0, 6)}
                end={vec(0, 6 + (size - 12) / 2)}
                colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
              />
            </RoundedRect>
          </Group>
        </Canvas>

        {/* Icon overlay */}
        <View style={[styles.iconContainer, { width: size, height: size }]}>
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
          style={[
            styles.label,
            !unlocked && styles.labelLocked,
          ]}
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
  iconContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'LexendDecaMedium',
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
