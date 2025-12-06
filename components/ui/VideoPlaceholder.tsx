import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Play } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface VideoPlaceholderProps {
  videoUrl: string;
}

export const VideoPlaceholder: React.FC<VideoPlaceholderProps> = ({ videoUrl }) => {
  return (
    <View style={styles.videoWell}>
      <View style={styles.playButton}>
        <Play size={32} color={Colors.charcoal} fill={Colors.charcoal} />
      </View>
      <Text style={styles.urlText} numberOfLines={1}>
        {videoUrl}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  videoWell: {
    backgroundColor: Colors.alloy,
    borderRadius: 12,
    padding: 20,
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#d0d0d0',
    borderBottomWidth: 0,
    borderRightWidth: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  playButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  urlText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.charcoal,
    textAlign: 'center',
    width: '100%',
  },
});
