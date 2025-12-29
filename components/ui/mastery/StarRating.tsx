import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface StarRatingProps {
  rating: 0 | 1 | 2 | 3;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const SIZE_MAP = {
  small: 14,
  medium: 20,
  large: 28,
};

/**
 * Display 0-3 star rating based on completed paths
 */
export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 'medium',
  showLabel = false,
}) => {
  const iconSize = SIZE_MAP[size];
  const stars = [1, 2, 3];

  return (
    <View style={styles.container}>
      <View style={styles.starsRow}>
        {stars.map((starIndex) => {
          const isFilled = starIndex <= rating;
          return (
            <Star
              key={starIndex}
              size={iconSize}
              color={isFilled ? '#FFD700' : Colors.warmGray}
              fill={isFilled ? '#FFD700' : 'transparent'}
              strokeWidth={isFilled ? 2 : 1.5}
            />
          );
        })}
      </View>

      {showLabel && (
        <Text style={[styles.label, size === 'large' && styles.labelLarge]}>
          {rating === 0 && 'No paths complete'}
          {rating === 1 && '1 path complete'}
          {rating === 2 && '2 paths complete'}
          {rating === 3 && 'Fully Mastered!'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  label: {
    fontFamily: 'LexendDeca-Regular',
    fontSize: 12,
    color: Colors.graphite,
  },
  labelLarge: {
    fontSize: 14,
    fontFamily: 'LexendDeca-Medium',
  },
});
