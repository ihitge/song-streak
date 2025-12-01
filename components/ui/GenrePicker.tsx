import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Genre } from '@/app/(tabs)/index';

interface GenrePickerProps {
  options: {
    genre: Genre;
    IconComponent: React.ComponentType<any>;
  }[];
  onSelect: (genre: Genre) => void;
  onClose: () => void;
  currentValue: Genre;
}

export const GenrePicker: React.FC<GenrePickerProps> = ({ options, onSelect, onClose, currentValue }) => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {options.map((option) => (
          <Pressable
            key={option.genre}
            onPress={() => {
              onSelect(option.genre);
              onClose();
            }}
            style={({ pressed }) => [
              styles.optionButton,
              currentValue === option.genre && styles.optionButtonActive,
              pressed && styles.optionButtonPressed,
            ]}
          >
            <option.IconComponent size={18} color={currentValue === option.genre ? '#ea5428' : '#333'} />
            <Text style={[styles.optionText, currentValue === option.genre && styles.optionTextActive]}>
              {option.genre.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '100%',
    left: 0,
    width: 200,
    maxHeight: 300,
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
  scrollView: {
    maxHeight: 300,
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
    fontFamily: 'SpaceGroteskRegular',
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
  optionTextActive: {
    color: '#ea5428',
    fontWeight: '900',
  },
});
