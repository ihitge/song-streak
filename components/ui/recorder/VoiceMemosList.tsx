/**
 * VoiceMemosList Component
 *
 * Displays a list of voice memos with playback and actions.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Play, Pause, Share2, Trash2, Music, Users } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { VoiceMemoWithMeta, formatTime } from '@/types/voiceMemo';
import { InsetWindow } from '@/components/ui/InsetWindow';
import { MemoCardSkeletonList } from '@/components/ui/skeleton';

interface VoiceMemosListProps {
  /** Memos to display */
  memos: VoiceMemoWithMeta[];
  /** Loading state */
  isLoading?: boolean;
  /** Callback to refresh list */
  onRefresh?: () => Promise<void>;
  /** Callback when play is pressed */
  onPlay?: (memo: VoiceMemoWithMeta) => void;
  /** Callback when share is pressed */
  onShare?: (memo: VoiceMemoWithMeta) => void;
  /** Callback when delete is pressed */
  onDelete?: (memo: VoiceMemoWithMeta) => void;
  /** Currently playing memo ID */
  playingMemoId?: string | null;
  /** Compact mode */
  compact?: boolean;
  /** Empty state message */
  emptyMessage?: string;
}

/**
 * Single memo list item
 */
const MemoItem: React.FC<{
  memo: VoiceMemoWithMeta;
  isPlaying: boolean;
  onPlay: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  compact: boolean;
}> = ({ memo, isPlaying, onPlay, onShare, onDelete, compact }) => {

  const handlePress = async (action: () => void) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  };

  // Format date
  const recordedDate = new Date(memo.recorded_at);
  const dateStr = recordedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <View style={[styles.memoItem, compact && styles.memoItemCompact]}>
      <InsetWindow
        variant="light"
        borderRadius={compact ? 8 : 12}
        style={styles.memoContent}
      >
        {/* Left: Play button */}
        <Pressable
          onPress={() => handlePress(onPlay)}
          style={[styles.playButton, isPlaying && styles.playButtonActive]}
          accessibilityLabel={isPlaying ? 'Pause memo' : 'Play memo'}
          accessibilityRole="button"
        >
          {isPlaying ? (
            <Pause size={compact ? 18 : 22} color={Colors.softWhite} fill={Colors.softWhite} />
          ) : (
            <Play size={compact ? 18 : 22} color={Colors.softWhite} fill={Colors.softWhite} />
          )}
        </Pressable>

        {/* Center: Info */}
        <View style={styles.memoInfo}>
          <View style={styles.memoTitleRow}>
            <Text style={[styles.memoTitle, compact && styles.memoTitleCompact]} numberOfLines={1}>
              {memo.title || 'Untitled Memo'}
            </Text>
            {memo.band_id && (
              <View style={styles.sharedBadge}>
                <Users size={10} color={Colors.charcoal} />
              </View>
            )}
          </View>
          <View style={styles.memoMeta}>
            <Text style={[styles.memoDate, compact && styles.memoDateCompact]}>{dateStr}</Text>
            <Text style={styles.memoDot}>•</Text>
            <Text style={[styles.memoDuration, compact && styles.memoDurationCompact]}>
              {formatTime(memo.duration_seconds || 0)}
            </Text>
          </View>
        </View>

        {/* Right: Actions */}
        <View style={styles.actionButtons}>
          {onShare && memo.is_owner && (
            <Pressable
              onPress={() => handlePress(onShare)}
              style={styles.actionButton}
              accessibilityLabel={`Share ${memo.title || 'memo'}`}
              accessibilityRole="button"
              accessibilityHint="Opens share options for this voice memo"
            >
              <Share2 size={compact ? 16 : 18} color={Colors.graphite} />
            </Pressable>
          )}
          {onDelete && memo.is_owner && (
            <Pressable
              onPress={() => handlePress(onDelete)}
              style={styles.actionButton}
              accessibilityLabel={`Delete ${memo.title || 'memo'}`}
              accessibilityRole="button"
              accessibilityHint="Permanently removes this voice memo"
            >
              <Trash2 size={compact ? 16 : 18} color={Colors.vermilion} />
            </Pressable>
          )}
        </View>
      </InsetWindow>
    </View>
  );
};

/**
 * Empty state component
 */
const EmptyState: React.FC<{ message: string; compact: boolean }> = ({ message, compact }) => (
  <View style={[styles.emptyState, compact && styles.emptyStateCompact]}>
    <View style={styles.emptyIcon}>
      <Music size={32} color={Colors.graphite} />
    </View>
    <Text style={[styles.emptyText, compact && styles.emptyTextCompact]}>{message}</Text>
  </View>
);

export const VoiceMemosList: React.FC<VoiceMemosListProps> = ({
  memos,
  isLoading = false,
  onRefresh,
  onPlay,
  onShare,
  onDelete,
  playingMemoId = null,
  compact = false,
  emptyMessage = 'No voice memos yet.\nRecord your first song idea!',
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  const renderItem = useCallback(({ item }: { item: VoiceMemoWithMeta }) => (
    <MemoItem
      memo={item}
      isPlaying={playingMemoId === item.id}
      onPlay={() => onPlay?.(item)}
      onShare={onShare ? () => onShare(item) : undefined}
      onDelete={onDelete ? () => onDelete(item) : undefined}
      compact={compact}
    />
  ), [playingMemoId, onPlay, onShare, onDelete, compact]);

  const keyExtractor = useCallback((item: VoiceMemoWithMeta) => item.id, []);

  if (isLoading && memos.length === 0) {
    return <MemoCardSkeletonList count={4} compact={compact} />;
  }

  return (
    <FlatList
      data={memos}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={[
        styles.listContent,
        memos.length === 0 && styles.listContentEmpty,
      ]}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.vermilion}
          />
        ) : undefined
      }
      ListEmptyComponent={<EmptyState message={emptyMessage} compact={compact} />}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    gap: 12,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  memoItem: {
    marginBottom: 8,
  },
  memoItemCompact: {
    marginBottom: 6,
  },
  memoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.charcoal,
    justifyContent: 'center',
    alignItems: 'center',
    // Bevel
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.3)',
  },
  playButtonActive: {
    backgroundColor: Colors.moss,
  },
  memoInfo: {
    flex: 1,
    gap: 4,
  },
  memoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memoTitle: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.ink,
    flex: 1,
  },
  memoTitleCompact: {
    fontSize: 12,
  },
  sharedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(14, 39, 60, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memoDate: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 11,
    color: Colors.graphite,
  },
  memoDateCompact: {
    fontSize: 10,
  },
  memoDot: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 11,
    color: Colors.graphite,
  },
  memoDuration: {
    fontFamily: 'LexendDecaBold',
    fontSize: 11,
    color: Colors.warmGray,
  },
  memoDurationCompact: {
    fontSize: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: Colors.alloy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
  },
  emptyStateCompact: {
    padding: 24,
    gap: 12,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.alloy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 14,
    color: Colors.graphite,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyTextCompact: {
    fontSize: 12,
    lineHeight: 18,
  },
});

export default VoiceMemosList;
