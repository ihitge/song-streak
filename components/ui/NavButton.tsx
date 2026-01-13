import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';

interface NavButtonProps {
  iconName: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  isActive: boolean;
  onPress: () => void;
  compact?: boolean;
}

export const NavButton: React.FC<NavButtonProps> = ({ iconName, label, isActive, onPress, compact = false }) => {
  const handlePress = async () => {
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={styles.buttonContainer}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      {/* The Well (Outer Recess) */}
      <View style={[styles.well, compact && styles.wellCompact]}>
        {/* The Cap (Physical Key) */}
        <View style={[
          styles.cap,
          compact && styles.capCompact,
          isActive ? styles.capActive : styles.capInactive,
        ]}>
          {/* The LED */}
          <View style={[
            styles.led,
            isActive ? styles.ledActive : styles.ledInactive,
          ]} />
          <FontAwesome
            name={iconName}
            size={compact ? 18 : 24}
            color={isActive ? Colors.vermilion : Colors.charcoal}
            accessibilityElementsHidden={true}
          />
        </View>
      </View>
      <Text style={[styles.labelText, compact && styles.labelTextCompact]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  well: {
    width: 80, // w-20 (80px)
    height: 80, // h-20 (80px)
    borderRadius: 12, // rounded-xl
    backgroundColor: Colors.alloy, // darker grey background
    justifyContent: 'center',
    alignItems: 'center',
    // Heavy inner shadow: shadow-[inset_0_3px_8px_rgba(0,0,0,0.15)]
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5, // For Android
  },
  cap: {
    width: 64, // w-16 (64px)
    height: 64, // h-16 (64px)
    borderRadius: 8, // slightly smaller rounded
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    // Base for inactive/active state
  },
  capInactive: {
    // Gradient white-to-grey - using a subtle color for now, RN doesn't do gradients easily in StyleSheet
    backgroundColor: Colors.softWhite, // Placeholder for gradient
    transform: [{ translateY: -2 }], // -translate-y-[2px]
    // Drop shadow
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3, // For Android
  },
  capActive: {
    backgroundColor: '#e6e6e6', // matches chassis background
    transform: [{ translateY: 2 }], // translate-y-[2px]
    // Inner shadow - mimicking the well's shadow but for the cap
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5, // For Android
  },
  led: {
    width: 3, // 1.5px * 2 for visibility
    height: 3, // 1.5px * 2 for visibility
    borderRadius: 1.5,
    position: 'absolute',
    top: 5, // Adjust positioning
    right: 5, // Adjust positioning
  },
  ledInactive: {
    backgroundColor: Colors.alloy, // Dead Grey
  },
  ledActive: {
    backgroundColor: Colors.vermilion, // Glowing Orange
    // Blur shadow
    shadowColor: Colors.vermilion,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 8, // For Android
  },
  labelText: {
    fontSize: 9,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 5,
    color: Colors.charcoal,
  },
  // Compact styles for 5-tab layout
  wellCompact: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  capCompact: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },
  labelTextCompact: {
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 4,
  },
});
