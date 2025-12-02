import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Fluency } from '@/app/(tabs)/index';

interface FluencyPickerProps {
  options: {
    fluency: Fluency;
    IconComponent: React.ComponentType<any>;
  }[];
  onSelect: (fluency: Fluency) => void;
  onClose: () => void;
  currentValue: Fluency;
}

export const FluencyPicker: React.FC<FluencyPickerProps> = ({ options, onSelect, onClose, currentValue }) => {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <Pressable
          key={option.fluency}
          onPress={() => {
            onSelect(option.fluency);
            onClose();
          }}
          style={({ pressed }) => [
            styles.optionButton,
            currentValue === option.fluency && styles.optionButtonActive,
            pressed && styles.optionButtonPressed,
          ]}
        >
          <option.IconComponent size={18} color={currentValue === option.fluency ? '#ea5428' : '#333'} />
          <Text style={[styles.optionText, currentValue === option.fluency && styles.optionTextActive]}>
            {option.fluency.toUpperCase()}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '100%',
    left: 0,
    width: 140,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
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
    zIndex: 100,
    overflow: 'hidden',
    marginTop: 4,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#d6d6d6',
    gap: 8,
  },
  optionButtonActive: {
    backgroundColor: '#d6d6d6',
  },
  optionButtonPressed: {
    backgroundColor: '#c0c0c0',
  },
  optionText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
  optionTextActive: {
    color: '#ea5428',
    fontWeight: '900',
  },
});
