import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { ExternalLink } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { getYouTubeEmbedUrl } from '@/utils/youtube';

interface YouTubePlayerProps {
  videoId: string;
  videoUrl?: string;
  onReady?: () => void;
  onError?: (error: string) => void;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  videoUrl,
  onReady,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const embedUrl = getYouTubeEmbedUrl(videoId);

  const handleError = (e: any) => {
    setHasError(true);
    setIsLoading(false);
    onError?.(e.nativeEvent.description);
  };

  const handleOpenExternal = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = videoUrl || `https://www.youtube.com/watch?v=${videoId}`;
    await Linking.openURL(url);
  };

  // Web platform: Use iframe instead of WebView
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          src={embedUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: 8,
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => {
            setIsLoading(false);
            onReady?.();
          }}
        />
      </View>
    );
  }

  // Render error fallback UI
  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          This video cannot be embedded.
        </Text>
        <Text style={styles.errorSubtext}>
          The uploader has restricted playback outside YouTube.
        </Text>
        <TouchableOpacity
          style={styles.openButton}
          onPress={handleOpenExternal}
        >
          <ExternalLink size={18} color={Colors.softWhite} />
          <Text style={styles.openButtonText}>Watch on YouTube</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.vermilion} />
        </View>
      )}
      <WebView
        source={{ uri: embedUrl }}
        style={styles.webview}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        onLoadEnd={() => {
          setIsLoading(false);
          onReady?.();
        }}
        onError={handleError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Colors.charcoal,
    borderRadius: 8,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.charcoal,
    zIndex: 1,
  },
  errorContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Colors.charcoal,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.softWhite,
    textAlign: 'center',
    marginBottom: 4,
  },
  errorSubtext: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.graphite,
    textAlign: 'center',
    marginBottom: 16,
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.vermilion,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  openButtonText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.softWhite,
  },
});
