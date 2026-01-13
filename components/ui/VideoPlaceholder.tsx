import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Play } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { getYouTubeThumbnailFromUrl } from '@/utils/youtube';

interface VideoPlaceholderProps {
  videoUrl: string;
}

export const VideoPlaceholder: React.FC<VideoPlaceholderProps> = ({ videoUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const thumbnailUrl = getYouTubeThumbnailFromUrl(videoUrl);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  // Show fallback if not a YouTube URL or thumbnail failed to load
  const showFallback = !thumbnailUrl || hasError;

  return (
    <View style={styles.videoWell}>
      {!showFallback ? (
        <>
          <Image
            source={thumbnailUrl}
            style={styles.thumbnail}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
          />
          {/* Loading overlay */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.vermilion} />
            </View>
          )}
          {/* Play button overlay */}
          <View style={styles.playOverlay}>
            <View style={styles.playButtonCircle}>
              <Play
                size={28}
                color={Colors.softWhite}
                fill={Colors.softWhite}
                style={styles.playIcon}
              />
            </View>
          </View>
        </>
      ) : (
        // Fallback for non-YouTube URLs or failed thumbnail loads
        <>
          <View style={styles.playButton}>
            <Play size={32} color={Colors.charcoal} fill={Colors.charcoal} />
          </View>
          <Text style={styles.urlText} numberOfLines={1}>
            {videoUrl}
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  videoWell: {
    backgroundColor: Colors.alloy,
    borderRadius: 12,
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
  thumbnail: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(238, 108, 77, 0.9)', // vermilion with opacity
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  playIcon: {
    marginLeft: 4, // Optical centering for play triangle
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
    paddingHorizontal: 20,
  },
});
