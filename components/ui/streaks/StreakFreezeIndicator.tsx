import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Snowflake } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface StreakFreezeIndicatorProps {
  available: number; // 0-3
  max?: number;
  size?: number;
}

/**
 * Displays streak freeze availability as snowflake icons
 * Active freezes glow cyan, inactive are dimmed
 */
export const StreakFreezeIndicator: React.FC<StreakFreezeIndicatorProps> = ({
  available,
  max = 3,
  size = 20,
}) => {
  const freezes = Array.from({ length: max }, (_, i) => i < available);

  return (
    <View style={styles.container}>
      {freezes.map((isActive, index) => (
        <View
          key={index}
          style={[
            styles.freezeIcon,
            isActive && styles.freezeIconActive,
          ]}
        >
          <Snowflake
            size={size}
            color={isActive ? '#00D4FF' : Colors.graphite}
            strokeWidth={isActive ? 2.5 : 2}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  freezeIcon: {
    opacity: 0.4,
  },
  freezeIconActive: {
    opacity: 1,
    // Web shadow for glow effect
    // @ts-ignore
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
});
