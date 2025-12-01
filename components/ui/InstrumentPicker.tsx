import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Instrument } from '@/app/(tabs)/index'; // Assuming Instrument type from index.tsx

interface InstrumentPickerProps {
  options: {
    instrument: Instrument; // 'All' | 'Guitar' | 'Bass' | 'Drums' | 'Keys'
    IconComponent: React.ComponentType<any>;
  }[];
  onSelect: (instrument: Instrument) => void;
  onClose: () => void;
  currentValue: Instrument;
}

export const InstrumentPicker: React.FC<InstrumentPickerProps> = ({ options, onSelect, onClose, currentValue }) => {
  return (
    <View style={styles.container}>
      {options.map((option, index) => (
        <Pressable
          key={option.instrument}
          onPress={() => {
            onSelect(option.instrument);
            onClose();
          }}
          style={({ pressed }) => [
            styles.optionButton,
            currentValue === option.instrument && styles.optionButtonActive,
            pressed && styles.optionButtonPressed,
          ]}
        >
          <option.IconComponent size={18} color={currentValue === option.instrument ? '#ea5428' : '#333'} />
          <Text style={[styles.optionText, currentValue === option.instrument && styles.optionTextActive]}>
            {option.instrument.toUpperCase()}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute', // Position relative to the parent LibraryHeader
    top: '100%', // Just below the selector key
    left: 0,
    right: 0,
    backgroundColor: '#e0e0e0', // Deck Color like, recessed feel
    borderRadius: 8,
    // Soft inset shadow
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#c0c0c0',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: '#f0f0f0',
    borderRightColor: '#f0f0f0',
    zIndex: 100, // Ensure it's above other content
    overflow: 'hidden', // Clip content to rounded corners
    marginTop: 4, // Small gap from the SelectorKey
  },
  optionButton: {
    flexDirection: 'row', // To align icon and text
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#d6d6d6', // Subtle separator
    gap: 8, // Spacing between icon and text
  },
  optionButtonActive: {
    backgroundColor: '#d6d6d6', // Slightly darker when active
  },
  optionButtonPressed: {
    backgroundColor: '#c0c0c0', // Even darker when pressed
  },
  optionText: {
    fontFamily: 'SpaceGroteskRegular', // Assuming this font is available
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  optionTextActive: {
    color: '#ea5428', // Vermilion for active option
  },
});