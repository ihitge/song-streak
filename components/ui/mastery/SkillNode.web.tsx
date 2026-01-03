import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
import { MasteryNode, NodeStatus, PATH_COLORS } from '@/types/mastery';

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

// Helper to darken a hex color
function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0x0000ff) - Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Individual skill node with locked/unlocked/completed states - Web fallback using CSS
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

  const padding = 8;

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
          fill: Colors.deepSpaceBlue,
          glow: 'transparent',
          icon: Colors.warmGray,
        };
    }
  };

  const colors = getColors();

  // Generate CSS styles for node body
  const nodeBodyStyle = {
    width: size - 4,
    height: size - 4,
    borderRadius: (size - 4) / 2,
    background:
      status === 'completed'
        ? `linear-gradient(135deg, ${pathColor} 0%, ${darkenColor(pathColor, 0.3)} 100%)`
        : `linear-gradient(135deg, ${colors.fill} 0%, ${darkenColor(colors.fill, 0.2)} 100%)`,
    boxShadow:
      status === 'completed'
        ? `0 0 12px ${pathColor}80, 0 0 24px ${pathColor}40`
        : status === 'unlocked'
        ? `inset 0 0 0 2px ${pathColor}99`
        : 'none',
  };

  return (
    <Pressable
      style={[
        styles.container,
        { width: size + padding * 2, height: size + padding * 2 + (showLabel ? 24 : 0) },
      ]}
      onPress={onPress}
      disabled={status === 'locked' || node.isFuture}
    >
      {/* Node body with CSS gradients */}
      <View
        style={[
          styles.nodeBody,
          // @ts-ignore - web-specific style
          nodeBodyStyle,
        ]}
      >
        {/* Inner highlight */}
        <View
          style={[
            styles.highlight,
            {
              opacity: status === 'completed' ? 0.3 : 0.1,
            },
          ]}
        />

        {/* Icon */}
        <View style={styles.iconContainer}>
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
              style={{ opacity: node.isFuture ? 0.5 : 1 }}
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

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeBody: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  highlight: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  iconContainer: {
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
