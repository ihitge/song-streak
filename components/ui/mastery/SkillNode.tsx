import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  RadialGradient,
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
  Trophy,
  Music,
  ListTree,
  Key,
  MoveHorizontal,
  GraduationCap,
  Mic,
  Headphones,
  Users,
  Sparkles,
  Award,
  Dumbbell,
  Lock,
  Check,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { MasteryNode, NodeStatus, MasteryPath, PATH_COLORS } from '@/types/mastery';

interface SkillNodeProps {
  node: MasteryNode;
  status: NodeStatus;
  size?: number;
  showLabel?: boolean;
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
  trophy: Trophy,
  music: Music,
  'list-tree': ListTree,
  key: Key,
  'move-horizontal': MoveHorizontal,
  'graduation-cap': GraduationCap,
  mic: Mic,
  headphones: Headphones,
  users: Users,
  sparkles: Sparkles,
  award: Award,
  dumbbell: Dumbbell,
};

/**
 * Individual skill node with locked/unlocked/completed states
 */
export const SkillNode: React.FC<SkillNodeProps> = ({
  node,
  status,
  size = 48,
  showLabel = false,
  onPress,
}) => {
  const pathColor = PATH_COLORS[node.path];
  const IconComponent = ICON_MAP[node.icon] || Star;

  // Canvas dimensions
  const padding = 8;
  const canvasSize = size + padding * 2;
  const center = canvasSize / 2;
  const radius = size / 2;

  // Colors based on status
  const getColors = () => {
    switch (status) {
      case 'completed':
        return {
          fill: pathColor,
          glow: pathColor,
          icon: Colors.softWhite,
        };
      case 'unlocked':
        return {
          fill: '#3a3a3a',
          glow: pathColor,
          icon: pathColor,
        };
      case 'locked':
      default:
        return {
          fill: '#2a2a2a',
          glow: 'transparent',
          icon: Colors.warmGray,
        };
    }
  };

  const colors = getColors();

  return (
    <Pressable
      style={[
        styles.container,
        { width: size + padding * 2, height: size + padding * 2 + (showLabel ? 24 : 0) },
      ]}
      onPress={onPress}
      disabled={status === 'locked' || node.isFuture}
    >
      {/* Skia Canvas for glow and background */}
      <View style={{ width: canvasSize, height: canvasSize }}>
        <Canvas style={{ width: canvasSize, height: canvasSize }}>
          <Group>
            {/* Outer glow (completed only) */}
            {status === 'completed' && (
              <Circle cx={center} cy={center} r={radius + 4}>
                <BlurMask blur={8} style="normal" />
                <RadialGradient
                  c={vec(center, center)}
                  r={radius + 4}
                  colors={[`${pathColor}80`, 'transparent']}
                  positions={[0.5, 1]}
                />
              </Circle>
            )}

            {/* Pulsing ring (unlocked only) */}
            {status === 'unlocked' && (
              <Circle
                cx={center}
                cy={center}
                r={radius}
                style="stroke"
                strokeWidth={2}
                color={pathColor}
                opacity={0.6}
              />
            )}

            {/* Node body */}
            <Circle cx={center} cy={center} r={radius - 2}>
              {status === 'completed' ? (
                <LinearGradient
                  start={vec(center - radius, center - radius)}
                  end={vec(center + radius, center + radius)}
                  colors={[pathColor, darkenColor(pathColor, 0.3)]}
                />
              ) : (
                <LinearGradient
                  start={vec(center - radius, center - radius)}
                  end={vec(center + radius, center + radius)}
                  colors={[colors.fill, darkenColor(colors.fill, 0.2)]}
                />
              )}
            </Circle>

            {/* Inner highlight */}
            <Circle
              cx={center - radius * 0.2}
              cy={center - radius * 0.2}
              r={radius * 0.15}
              color="white"
              opacity={status === 'completed' ? 0.3 : 0.1}
            >
              <BlurMask blur={2} style="normal" />
            </Circle>
          </Group>
        </Canvas>

        {/* Icon overlay */}
        <View style={[styles.iconContainer, { width: canvasSize, height: canvasSize }]}>
          {status === 'locked' && !node.isFuture ? (
            <Lock size={size * 0.4} color={colors.icon} />
          ) : status === 'completed' ? (
            <View style={styles.iconWithCheck}>
              <IconComponent size={size * 0.35} color={colors.icon} />
              <View style={styles.checkBadge}>
                <Check size={10} color={Colors.softWhite} strokeWidth={3} />
              </View>
            </View>
          ) : (
            <IconComponent
              size={size * 0.4}
              color={colors.icon}
              opacity={node.isFuture ? 0.5 : 1}
            />
          )}
        </View>
      </View>

      {/* Label */}
      {showLabel && (
        <Text
          style={[
            styles.label,
            status === 'locked' && styles.labelLocked,
            node.isFuture && styles.labelFuture,
          ]}
          numberOfLines={1}
        >
          {node.title}
        </Text>
      )}
    </Pressable>
  );
};

// Helper to darken a hex color
function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0x0000ff) - Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWithCheck: {
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.moss,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'LexendDeca-Medium',
    fontSize: 11,
    color: Colors.graphite,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 80,
  },
  labelLocked: {
    color: Colors.warmGray,
    opacity: 0.7,
  },
  labelFuture: {
    fontStyle: 'italic',
  },
});
