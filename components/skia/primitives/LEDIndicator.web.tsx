import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface LEDIndicatorProps {
  size?: number;
  isActive: boolean;
  color?: string;
}

/**
 * LEDIndicator (Web) - CSS-based fallback for web build.
 * Uses box-shadow for glow effect instead of Skia.
 */
export const LEDIndicator: React.FC<LEDIndicatorProps> = ({
  size = 16,
  isActive,
  color = Colors.vermilion,
}) => {
  const radius = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      {/* Bezel ring */}
      <View
        style={[
          styles.bezel,
          {
            width: size,
            height: size,
            borderRadius: radius,
          },
        ]}
      >
        {/* LED lens */}
        <View
          style={[
            styles.lens,
            {
              width: size * 0.7,
              height: size * 0.7,
              borderRadius: (size * 0.7) / 2,
              backgroundColor: isActive ? color : Colors.deepSpaceBlue,
              // Glow effect via box-shadow (web only)
              ...(isActive && {
                shadowColor: color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 8,
              }),
            },
          ]}
        >
          {/* Highlight */}
          <View
            style={[
              styles.highlight,
              {
                opacity: isActive ? 0.5 : 0.2,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bezel: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  lens: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlight: {
    position: 'absolute',
    top: '15%',
    left: '15%',
    width: '30%',
    height: '30%',
    borderRadius: 100,
    backgroundColor: 'white',
  },
});
