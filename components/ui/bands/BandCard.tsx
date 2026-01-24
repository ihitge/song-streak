import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Users, ListMusic, ChevronRight, Crown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { SHADOWS, BORDER_RADIUS } from '@/constants/Styles';
import { BandWithMemberCount, formatJoinCode } from '@/types/band';

interface BandCardProps {
  band: BandWithMemberCount;
  onPress: () => void;
  expanded?: boolean;
  children?: React.ReactNode;
}

/**
 * Card component for displaying a band with its stats
 * When expanded, shows children (setlist list)
 * Memoized to prevent unnecessary re-renders in lists
 */
export const BandCard: React.FC<BandCardProps> = React.memo(({
  band,
  onPress,
  expanded = false,
  children,
}) => {

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handlePress} style={styles.cardChassis}>
        <View style={styles.cardBody}>
          {/* Band Icon */}
          <View style={styles.iconContainer}>
            <Users size={24} color={Colors.charcoal} />
            {band.user_role === 'admin' && (
              <View style={styles.adminBadge}>
                <Crown size={10} color={Colors.vermilion} />
              </View>
            )}
          </View>

          {/* Band Info */}
          <View style={styles.cardContent}>
            <Text style={styles.bandName}>{band.name}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Users size={12} color={Colors.graphite} />
                <Text style={styles.statText}>
                  {band.member_count} {band.member_count === 1 ? 'member' : 'members'}
                </Text>
              </View>
              <View style={styles.statItem}>
                <ListMusic size={12} color={Colors.graphite} />
                <Text style={styles.statText}>
                  {band.setlist_count} {band.setlist_count === 1 ? 'setlist' : 'setlists'}
                </Text>
              </View>
            </View>
          </View>

          {/* Chevron */}
          <View style={[styles.chevronContainer, expanded && styles.chevronExpanded]}>
            <ChevronRight size={20} color={Colors.graphite} />
          </View>
        </View>
      </Pressable>

      {/* Expanded Content (Setlists) */}
      {expanded && children && (
        <View style={styles.expandedContent}>
          {children}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  cardChassis: {
    backgroundColor: Colors.softWhite,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...SHADOWS.card,
    overflow: 'hidden',
  },
  cardBody: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: Colors.alloy,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: Colors.highlights.md,
    borderLeftColor: Colors.highlights.md,
    borderBottomColor: Colors.shadows.md,
    borderRightColor: Colors.shadows.md,
    position: 'relative',
  },
  adminBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    backgroundColor: Colors.softWhite,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  bandName: {
    fontFamily: 'LexendDecaBold',
    fontSize: 16,
    color: Colors.ink,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 11,
    color: Colors.warmGray,
    textTransform: 'uppercase',
  },
  chevronContainer: {
    padding: 8,
    transform: [{ rotate: '0deg' }],
  },
  chevronExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  expandedContent: {
    backgroundColor: Colors.matteFog,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: -1,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.border,
  },
});
