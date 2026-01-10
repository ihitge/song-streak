import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import {
  LifetimeMilestone,
  MilestoneCategory,
  UserGlobalStats,
  getMilestonesByCategory,
  getMilestoneProgress,
  ALL_MILESTONES,
} from '@/types/milestones';
import { Trophy } from './Trophy';
import { useClickSound } from '@/hooks/useClickSound';

interface TrophyCaseProps {
  stats: UserGlobalStats;
  unlockedIds: string[];
  onTrophyPress?: (milestone: LifetimeMilestone) => void;
  compact?: boolean;
  variant?: 'light' | 'dark';
  collapsible?: boolean;
  initiallyExpanded?: boolean;
}

interface TrophyShelfProps {
  title: string;
  milestones: LifetimeMilestone[];
  stats: UserGlobalStats;
  unlockedIds: string[];
  onTrophyPress?: (milestone: LifetimeMilestone) => void;
  compact?: boolean;
  variant?: 'light' | 'dark';
}

const TrophyShelf: React.FC<TrophyShelfProps> = ({
  title,
  milestones,
  stats,
  unlockedIds,
  onTrophyPress,
  compact,
  variant = 'light',
}) => {
  const unlockedCount = milestones.filter(m => unlockedIds.includes(m.id)).length;
  const isDark = variant === 'dark';

  return (
    <View style={[styles.shelf, isDark && styles.shelfDark]}>
      {/* Shelf header */}
      <View style={styles.shelfHeader}>
        <Text style={[styles.shelfTitle, isDark && styles.shelfTitleDark]}>{title}</Text>
        <Text style={[styles.shelfCount, isDark && styles.shelfCountDark]}>
          {unlockedCount} / {milestones.length}
        </Text>
      </View>

      {/* Trophy row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.trophyRow}
      >
        {milestones.map((milestone) => {
          const unlocked = unlockedIds.includes(milestone.id);
          const progress = getMilestoneProgress(milestone, stats);

          return (
            <Trophy
              key={milestone.id}
              milestone={milestone}
              unlocked={unlocked}
              progress={progress}
              compact={compact}
              onPress={() => onTrophyPress?.(milestone)}
            />
          );
        })}
      </ScrollView>

      {/* Shelf bottom edge */}
      <View style={[styles.shelfEdge, isDark && styles.shelfEdgeDark]} />
    </View>
  );
};

/**
 * Trophy case displaying all milestone categories
 * Supports light/dark variants and collapsible mode
 */
export const TrophyCase: React.FC<TrophyCaseProps> = ({
  stats,
  unlockedIds,
  onTrophyPress,
  compact = false,
  variant = 'light',
  collapsible = false,
  initiallyExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const expandProgress = useSharedValue(initiallyExpanded ? 1 : 0);
  const { playSound } = useClickSound();
  const isDark = variant === 'dark';

  const categories: { category: MilestoneCategory; title: string }[] = [
    { category: 'time', title: 'Practice Time' },
    { category: 'songs', title: 'Songs Mastered' },
    { category: 'streak', title: 'Practice Streaks' },
    { category: 'genre', title: 'Genre Mastery' },
  ];

  // Total trophy count
  const totalUnlocked = unlockedIds.length;
  const totalMilestones = ALL_MILESTONES.length;

  const handleToggleExpand = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    setIsExpanded(!isExpanded);
    expandProgress.value = withTiming(isExpanded ? 0 : 1, { duration: 300 });
  };

  const expandedStyle = useAnimatedStyle(() => ({
    height: interpolate(
      expandProgress.value,
      [0, 1],
      [0, 600], // Approximate height for all shelves
      Extrapolation.CLAMP
    ),
    opacity: expandProgress.value,
    overflow: 'hidden' as const,
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(expandProgress.value, [0, 1], [0, 180])}deg`,
      },
    ],
  }));

  // If not collapsible, render all shelves
  if (!collapsible) {
    return (
      <View style={styles.container}>
        <Text style={[styles.caseTitle, isDark && styles.caseTitleDark]}>
          Trophy Case
        </Text>

        {categories.map(({ category, title }) => (
          <TrophyShelf
            key={category}
            title={title}
            milestones={getMilestonesByCategory(category)}
            stats={stats}
            unlockedIds={unlockedIds}
            onTrophyPress={onTrophyPress}
            compact={compact}
            variant={variant}
          />
        ))}
      </View>
    );
  }

  // Collapsible mode: show first category + expand button
  return (
    <View style={styles.container}>
      {/* Header with expand toggle */}
      <Pressable style={styles.collapsibleHeader} onPress={handleToggleExpand}>
        <View>
          <Text style={[styles.caseTitle, isDark && styles.caseTitleDark]}>
            Trophy Case
          </Text>
          <Text style={[styles.trophyCount, isDark && styles.trophyCountDark]}>
            {totalUnlocked} / {totalMilestones} unlocked
          </Text>
        </View>
        <Animated.View style={chevronStyle}>
          <ChevronDown
            size={20}
            color={isDark ? Colors.graphite : Colors.warmGray}
          />
        </Animated.View>
      </Pressable>

      {/* First category always visible */}
      <TrophyShelf
        title={categories[0].title}
        milestones={getMilestonesByCategory(categories[0].category)}
        stats={stats}
        unlockedIds={unlockedIds}
        onTrophyPress={onTrophyPress}
        compact={compact}
        variant={variant}
      />

      {/* Expandable remaining categories */}
      <Animated.View style={expandedStyle}>
        {categories.slice(1).map(({ category, title }) => (
          <TrophyShelf
            key={category}
            title={title}
            milestones={getMilestonesByCategory(category)}
            stats={stats}
            unlockedIds={unlockedIds}
            onTrophyPress={onTrophyPress}
            compact={compact}
            variant={variant}
          />
        ))}
      </Animated.View>

      {/* View All / Collapse button */}
      <Pressable style={styles.viewAllButton} onPress={handleToggleExpand}>
        <Text style={[styles.viewAllText, isDark && styles.viewAllTextDark]}>
          {isExpanded ? 'Show Less' : 'View All Trophies'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  caseTitle: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.ink,
  },
  caseTitleDark: {
    color: Colors.softWhite,
  },
  trophyCount: {
    fontFamily: 'LexendDecaMedium',
    fontSize: 11,
    color: Colors.warmGray,
    marginTop: 2,
  },
  trophyCountDark: {
    color: Colors.graphite,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 8,
  },
  shelf: {
    backgroundColor: Colors.charcoal,
    borderRadius: 12,
    overflow: 'hidden',
    // Inset effect
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
    borderTopColor: 'rgba(0,0,0,0.4)',
    borderBottomColor: 'rgba(255,255,255,0.05)',
    marginTop: 4,
  },
  shelfDark: {
    backgroundColor: Colors.charcoal,
  },
  shelfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  shelfTitle: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 9,
    color: Colors.warmGray,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  shelfTitleDark: {
    color: Colors.graphite,
  },
  shelfCount: {
    fontFamily: 'LexendDecaMedium',
    fontSize: 10,
    color: Colors.warmGray,
  },
  shelfCountDark: {
    color: Colors.graphite,
  },
  trophyRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  shelfEdge: {
    height: 4,
    backgroundColor: '#1a1a1a',
    // Wood grain effect
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  shelfEdgeDark: {
    backgroundColor: '#1a1a1a',
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  viewAllText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 12,
    color: Colors.vermilion,
    letterSpacing: 1,
  },
  viewAllTextDark: {
    color: Colors.vermilion,
  },
});
