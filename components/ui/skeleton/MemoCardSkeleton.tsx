/**
 * MemoCardSkeleton Component
 *
 * Skeleton placeholder matching the VoiceMemosList MemoItem layout.
 * Used for loading states in the Ideas (voice memos) tab.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { SkeletonBox } from './SkeletonBox';
import { SkeletonText } from './SkeletonText';
import { SkeletonVariant } from './SkeletonBase';

interface MemoCardSkeletonProps {
  /**
   * Variant for different backgrounds
   */
  variant?: SkeletonVariant;
  /**
   * Compact mode matching VoiceMemosList compact prop
   */
  compact?: boolean;
}

// Dimensions matching VoiceMemosList MemoItem
const PLAY_BUTTON_SIZE = 44;

export const MemoCardSkeleton: React.FC<MemoCardSkeletonProps> = ({
  variant = 'dark',
  compact = false,
}) => {
  return (
    <View style={[styles.memoItem, compact && styles.memoItemCompact]}>
      <View style={styles.memoContent}>
        {/* Play button circle */}
        <SkeletonBox
          width={PLAY_BUTTON_SIZE}
          height={PLAY_BUTTON_SIZE}
          circle
          variant="light"
        />

        {/* Info section */}
        <View style={styles.memoInfo}>
          {/* Title */}
          <SkeletonText
            width="65%"
            size={compact ? 'sm' : 'lg'}
            variant="light"
            style={styles.titleLine}
          />
          {/* Meta row: date • duration */}
          <View style={styles.metaRow}>
            <SkeletonText
              width={80}
              size="xs"
              variant="light"
            />
            <View style={styles.dot} />
            <SkeletonText
              width={35}
              size="xs"
              variant="light"
            />
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <SkeletonBox
            width={PLAY_BUTTON_SIZE}
            height={PLAY_BUTTON_SIZE}
            borderRadius={8}
            variant="light"
          />
          <SkeletonBox
            width={PLAY_BUTTON_SIZE}
            height={PLAY_BUTTON_SIZE}
            borderRadius={8}
            variant="light"
          />
        </View>
      </View>
    </View>
  );
};

/**
 * Renders multiple MemoCardSkeletons for list loading state
 */
export const MemoCardSkeletonList: React.FC<{
  count?: number;
  variant?: SkeletonVariant;
  compact?: boolean;
}> = ({ count = 4, variant = 'dark', compact = false }) => {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <MemoCardSkeleton key={index} variant={variant} compact={compact} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: Colors.softWhite,
    borderRadius: 12,
    // InsetWindow-style appearance
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  memoInfo: {
    flex: 1,
    gap: 6,
  },
  titleLine: {
    // Extra margin if needed
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.graphite,
    opacity: 0.5,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
});

export default MemoCardSkeleton;
