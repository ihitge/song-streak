import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import {
  LifetimeMilestone,
  MilestoneCategory,
  UserGlobalStats,
  getMilestonesByCategory,
  getMilestoneProgress,
} from '@/types/milestones';
import { Trophy } from './Trophy';

interface TrophyCaseProps {
  stats: UserGlobalStats;
  unlockedIds: string[];
  onTrophyPress?: (milestone: LifetimeMilestone) => void;
  compact?: boolean;
}

interface TrophyShelfProps {
  title: string;
  milestones: LifetimeMilestone[];
  stats: UserGlobalStats;
  unlockedIds: string[];
  onTrophyPress?: (milestone: LifetimeMilestone) => void;
  compact?: boolean;
}

const TrophyShelf: React.FC<TrophyShelfProps> = ({
  title,
  milestones,
  stats,
  unlockedIds,
  onTrophyPress,
  compact,
}) => {
  const unlockedCount = milestones.filter(m => unlockedIds.includes(m.id)).length;

  return (
    <View style={styles.shelf}>
      {/* Shelf header */}
      <View style={styles.shelfHeader}>
        <Text style={styles.shelfTitle}>{title}</Text>
        <Text style={styles.shelfCount}>
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
      <View style={styles.shelfEdge} />
    </View>
  );
};

/**
 * Trophy case displaying all milestone categories
 */
export const TrophyCase: React.FC<TrophyCaseProps> = ({
  stats,
  unlockedIds,
  onTrophyPress,
  compact = false,
}) => {
  const categories: { category: MilestoneCategory; title: string }[] = [
    { category: 'time', title: 'Practice Time' },
    { category: 'songs', title: 'Songs Mastered' },
    { category: 'streak', title: 'Practice Streaks' },
    { category: 'genre', title: 'Genre Mastery' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.caseTitle}>Trophy Case</Text>

      {categories.map(({ category, title }) => (
        <TrophyShelf
          key={category}
          title={title}
          milestones={getMilestonesByCategory(category)}
          stats={stats}
          unlockedIds={unlockedIds}
          onTrophyPress={onTrophyPress}
          compact={compact}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  caseTitle: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.ink,
    marginBottom: 4,
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
  shelfCount: {
    fontFamily: 'LexendDecaMedium',
    fontSize: 10,
    color: Colors.warmGray,
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
});
