/**
 * SongCardSkeleton Component
 *
 * Skeleton placeholder matching the SongCard layout in the Songs library.
 * Dimensions match app/(tabs)/index.tsx SongCard exactly.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { SkeletonBox } from './SkeletonBox';
import { SkeletonText } from './SkeletonText';
import { SkeletonVariant } from './SkeletonBase';

interface SongCardSkeletonProps {
  /**
   * Variant for different backgrounds
   * Note: Song cards typically appear on dark background (inside DeviceCasing)
   */
  variant?: SkeletonVariant;
}

// Dimensions matching SongCard in index.tsx
const THUMBNAIL_SIZE = 58;
const CARD_PADDING = 10;

export const SongCardSkeleton: React.FC<SongCardSkeletonProps> = ({
  variant = 'dark',
}) => {
  return (
    <View style={styles.cardChassis}>
      <View style={styles.cardBody}>
        {/* Thumbnail placeholder */}
        <SkeletonBox
          width={THUMBNAIL_SIZE}
          height={THUMBNAIL_SIZE}
          borderRadius={8}
          variant="light"
          style={styles.thumbnail}
        />

        {/* Content area */}
        <View style={styles.cardContent}>
          {/* Title (14px font, ~70% width) */}
          <SkeletonText
            width="70%"
            size="lg"
            variant="light"
            style={styles.titleLine}
          />

          {/* Artist (12px font, ~50% width) */}
          <SkeletonText
            width="50%"
            size="sm"
            variant="light"
            style={styles.artistLine}
          />

          {/* Meta row (duration icon + text) */}
          <View style={styles.metaRow}>
            <SkeletonBox
              width={12}
              height={12}
              borderRadius={2}
              variant="light"
            />
            <SkeletonText
              width={40}
              size="xs"
              variant="light"
              style={styles.metaText}
            />
          </View>
        </View>

        {/* Action buttons placeholder */}
        <View style={styles.cardActions}>
          <SkeletonBox
            width={30}
            height={30}
            borderRadius={6}
            variant="light"
          />
          <SkeletonBox
            width={30}
            height={30}
            borderRadius={6}
            variant="light"
          />
        </View>
      </View>
    </View>
  );
};

/**
 * Renders multiple SongCardSkeletons for list loading state
 */
export const SongCardSkeletonList: React.FC<{
  count?: number;
  variant?: SkeletonVariant;
}> = ({ count = 5, variant = 'dark' }) => {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <SongCardSkeleton key={index} variant={variant} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  // Match cardChassis from index.tsx
  cardChassis: {
    backgroundColor: Colors.softWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 4,
    overflow: 'hidden',
  },
  cardBody: {
    flexDirection: 'row',
    padding: CARD_PADDING,
    alignItems: 'center',
  },
  thumbnail: {
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  titleLine: {
    marginBottom: 4,
  },
  artistLine: {
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    // Extra margin for spacing
  },
  cardActions: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  // List container
  listContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
  },
});

export default SongCardSkeleton;
