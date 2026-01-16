/**
 * Skeleton Components
 *
 * Loading state placeholders with shimmer animation.
 * Matches the "Industrial Play" aesthetic.
 *
 * Usage:
 * import { SongCardSkeleton, MemoCardSkeleton } from '@/components/ui/skeleton';
 */

// Base primitives
export { SkeletonBase, type SkeletonVariant } from './SkeletonBase';
export { SkeletonText } from './SkeletonText';
export { SkeletonBox } from './SkeletonBox';

// Composite skeletons
export { SongCardSkeleton, SongCardSkeletonList } from './SongCardSkeleton';
export { MemoCardSkeleton, MemoCardSkeletonList } from './MemoCardSkeleton';
export {
  StreakStatsSkeleton,
  TodayProgressSkeleton,
  NextMilestoneSkeleton,
} from './StreakStatsSkeleton';
