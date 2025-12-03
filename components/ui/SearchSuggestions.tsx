import { Colors } from '@/constants/Colors';

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
      {suggestions.map((song, index) => (
        <Pressable
          key={song.id}
          onPress={() => {
            onSelect(song);
            onClose();
          }}
          style={({ pressed }) => [
            styles.suggestionItem,
            pressed && styles.suggestionItemPressed,
            index === suggestions.length - 1 && styles.lastItem,
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
    marginTop: 8,
    backgroundColor: Colors.softWhite,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.alloy,
    // Raised Shadow
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 8,
    overflow: 'hidden',
    zIndex: 1000,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.alloy,
    backgroundColor: Colors.softWhite,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  suggestionItemPressed: {
    backgroundColor: Colors.matteFog,
  },
  titleText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.ink,
    marginBottom: 2,
  },
  artistText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.warmGray,
    textTransform: 'uppercase',
  },
});
