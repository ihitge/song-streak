import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ExternalLink } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { YouTubePlayer } from './YouTubePlayer';
import { extractYouTubeVideoId } from '@/utils/youtube';
import { useClickSound } from '@/hooks/useClickSound';
import { useStyledAlert } from '@/hooks/useStyledAlert';

interface VideoPlayerModalProps {
  visible: boolean;
  videoUrl: string;
  onClose: () => void;
  title?: string;
  artist?: string;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  visible,
  videoUrl,
  onClose,
  title,
  artist,
}) => {
  const { playSound } = useClickSound();
  const { showError } = useStyledAlert();
  const videoId = extractYouTubeVideoId(videoUrl);

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    onClose();
  };

  const handleOpenExternal = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    try {
      await Linking.openURL(videoUrl);
    } catch {
      showError('Error', 'Cannot open this URL');
    }
  };

  if (!videoId) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <X size={24} color={Colors.charcoal} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            {title && <Text style={styles.title} numberOfLines={1}>{title}</Text>}
            {artist && <Text style={styles.artist} numberOfLines={1}>{artist}</Text>}
          </View>
          <TouchableOpacity onPress={handleOpenExternal} style={styles.headerButton}>
            <ExternalLink size={20} color={Colors.charcoal} />
          </TouchableOpacity>
        </View>

        {/* Player */}
        <View style={styles.playerContainer}>
          <YouTubePlayer videoId={videoId} videoUrl={videoUrl} />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.matteFog,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.alloy,
  },
  headerButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.ink,
  },
  artist: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.warmGray,
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});
