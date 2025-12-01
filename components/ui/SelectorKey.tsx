import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { ChevronDown } from 'lucide-react-native'; // Assuming ChevronDown for the indicator

interface SelectorKeyProps {
  label: string;
  value: string;
  IconComponent: React.ComponentType<any>; // Lucide Icon component
  onPress?: () => void;
  // isActive?: boolean; // Potentially add this for active state styling if needed
}

export const SelectorKey: React.FC<SelectorKeyProps> = ({ label, value, IconComponent, onPress }) => {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Text style={styles.labelText}>{label}</Text>
      {/* The Button (Recessed Well) */}
      <View style={styles.buttonWell}>
        <IconComponent size={16} color="#333" style={styles.iconLeft} />
        <Text style={styles.valueText}>{value}</Text>
        <ChevronDown size={16} color="#888" style={styles.iconRight} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4, // Spacing between label and button
  },
  labelText: {
    fontSize: 9, // tiny
    textTransform: 'uppercase', // uppercase
    color: '#888', // #888 (Labels/Secondary)
    letterSpacing: 0.5,
  },
  buttonWell: {
    height: 40, // h-10 (40px)
    backgroundColor: '#e0e0e0',
    borderRadius: 8, // rounded corners (example, adjust as needed)
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
    // inner shadow: shadow-[inset_0_2px_5px_rgba(0,0,0,0.1)]
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 }, // Corresponds to inset shadow top/bottom
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3, // For Android inset simulation
    // This is a simplified inset shadow. Real inset shadows are more complex in RN.
    // We'll use a combination of shadow and border for a recessed look.
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#c0c0c0', // Lighter border for top/left
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: '#f0f0f0', // Darker border for bottom/right
    borderRightColor: '#f0f0f0',
  },
  iconLeft: {
    marginRight: 4,
  },
  valueText: {
    flex: 1, // Allows text to take available space
    fontSize: 16, // Adjust as needed
    fontWeight: 'bold',
    color: '#333', // #333 (Primary)
    textAlign: 'center',
  },
  iconRight: {
    marginLeft: 4,
  },
});
