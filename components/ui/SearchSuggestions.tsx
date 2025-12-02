import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface Song {
  id: string;
  title: string;
  artist: string;
}

interface SearchSuggestionsProps {
  suggestions: Song[];
  onSelect: (song: Song) => void;
  onClose: () => void;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  onSelect,
  onClose,
}) => {
  if (suggestions.length === 0) return null;

  return (
    <View style={styles.container}>
      {suggestions.map((song) => (
        <Pressable
          key={song.id}
          onPress={() => {
            onSelect(song);
            onClose();
          }}
          style={({ pressed }) => [
            styles.suggestionItem,
            pressed && styles.suggestionItemPressed,
          ]}
        >
          <Text style={styles.titleText} numberOfLines={1}>
            {song.title}
          </Text>
          <Text style={styles.artistText} numberOfLines={1}>
            {song.artist}
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
    right: 0,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
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
    overflow: 'hidden',
    marginTop: 4,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#d6d6d6',
  },
  suggestionItemPressed: {
    backgroundColor: '#c0c0c0',
  },
  titleText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: '#333',
  },
  artistText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});
