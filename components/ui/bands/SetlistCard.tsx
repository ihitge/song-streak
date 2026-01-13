import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ListMusic, MapPin, Calendar, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { SetlistWithSongs } from '@/types/band';

interface SetlistCardProps {
  setlist: SetlistWithSongs;
  onPress: () => void;
  compact?: boolean;
}

/**
 * Card component for displaying a setlist
 * Can be shown in compact mode when nested under a BandCard
 * Memoized to prevent unnecessary re-renders in lists
 */
export const SetlistCard: React.FC<SetlistCardProps> = React.memo(({
  setlist,
  onPress,
  compact = false,
}) => {

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  // Format gig date if available
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (compact) {
    return (
      <Pressable onPress={handlePress} style={styles.compactContainer}>
        <View style={styles.compactIcon}>
          <ListMusic size={14} color={Colors.vermilion} />
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactName}>{setlist.name}</Text>
          {setlist.venue && (
            <View style={styles.compactMeta}>
              <MapPin size={10} color={Colors.graphite} />
              <Text style={styles.compactMetaText}>{setlist.venue}</Text>
            </View>
          )}
        </View>
        <Text style={styles.songCount}>{setlist.song_count} songs</Text>
        <ChevronRight size={16} color={Colors.graphite} />
      </Pressable>
    );
  }

  return (
    <Pressable onPress={handlePress} style={styles.cardChassis}>
      <View style={styles.cardBody}>
        {/* Setlist Icon */}
        <View style={styles.iconContainer}>
          <ListMusic size={20} color={Colors.vermilion} />
        </View>

        {/* Setlist Info */}
        <View style={styles.cardContent}>
          <Text style={styles.setlistName}>{setlist.name}</Text>
          <View style={styles.metaRow}>
            {setlist.venue && (
              <View style={styles.metaItem}>
                <MapPin size={12} color={Colors.graphite} />
                <Text style={styles.metaText}>{setlist.venue}</Text>
              </View>
            )}
            {setlist.gig_date && (
              <View style={styles.metaItem}>
                <Calendar size={12} color={Colors.graphite} />
                <Text style={styles.metaText}>{formatDate(setlist.gig_date)}</Text>
              </View>
            )}
          </View>
          <Text style={styles.songCountBadge}>
            {setlist.song_count} {setlist.song_count === 1 ? 'song' : 'songs'}
          </Text>
        </View>

        {/* Chevron */}
        <View style={styles.chevronContainer}>
          <ChevronRight size={20} color={Colors.graphite} />
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  // Full card styles
  cardChassis: {
    backgroundColor: Colors.softWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  cardBody: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(238, 108, 77, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  setlistName: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.ink,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 11,
    color: Colors.warmGray,
  },
  songCountBadge: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 10,
    color: Colors.vermilion,
    textTransform: 'uppercase',
  },
  chevronContainer: {
    padding: 4,
  },

  // Compact styles (for nested display)
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  compactIcon: {
    width: 28,
    height: 28,
    backgroundColor: 'rgba(238, 108, 77, 0.1)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  compactContent: {
    flex: 1,
  },
  compactName: {
    fontFamily: 'LexendDecaBold',
    fontSize: 13,
    color: Colors.ink,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  compactMetaText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 10,
    color: Colors.warmGray,
  },
  songCount: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 10,
    color: Colors.graphite,
    marginRight: 4,
  },
});
