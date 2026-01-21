/**
 * MicrophonePermissionPrompt Component
 *
 * Reusable UI for requesting and handling microphone permissions.
 * Shows contextual states:
 * - undetermined: "Enable Mic" button to request permission
 * - denied: Warning message with "Open Settings" button
 * - granted: Nothing displayed (children can be shown)
 *
 * Used by: TunerControls, ReelToReelRecorder
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Platform } from 'react-native';
import { Mic, Settings, AlertTriangle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { ICON_SIZES, TOUCH_TARGETS } from '@/constants/Styles';

type PermissionStatus = 'undetermined' | 'granted' | 'denied';

interface MicrophonePermissionPromptProps {
  /** Current permission status */
  permissionStatus: PermissionStatus;
  /** Callback to request permission */
  onRequestPermission: () => Promise<boolean>;
  /** Feature name for contextual messaging (e.g., "tuner", "voice recorder") */
  featureName?: string;
  /** Compact mode for inline display */
  compact?: boolean;
  /** Show as overlay on top of content */
  overlay?: boolean;
}

export const MicrophonePermissionPrompt: React.FC<MicrophonePermissionPromptProps> = ({
  permissionStatus,
  onRequestPermission,
  featureName = 'this feature',
  compact = false,
  overlay = false,
}) => {
  const handleRequestPermission = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await onRequestPermission();
  }, [onRequestPermission]);

  const handleOpenSettings = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else if (Platform.OS === 'android') {
      Linking.openSettings();
    } else {
      // Web - show instructions since we can't open browser settings
      // The browser will re-prompt on next getUserMedia call if user cleared the block
      await onRequestPermission();
    }
  }, [onRequestPermission]);

  // Don't render anything if permission is granted
  if (permissionStatus === 'granted') {
    return null;
  }

  // Undetermined - show enable button
  if (permissionStatus === 'undetermined') {
    return (
      <View style={[styles.container, compact && styles.containerCompact, overlay && styles.overlay]}>
        <Pressable
          style={({ pressed }) => [
            styles.enableButton,
            compact && styles.enableButtonCompact,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleRequestPermission}
          accessibilityLabel={`Enable microphone for ${featureName}`}
          accessibilityRole="button"
          accessibilityHint="Tap to request microphone permission"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Mic size={compact ? ICON_SIZES.md : ICON_SIZES.lg} color={Colors.softWhite} strokeWidth={2.5} />
          <Text style={[styles.enableButtonText, compact && styles.enableButtonTextCompact]}>
            ENABLE MIC
          </Text>
        </Pressable>
        <Text style={[styles.promptText, compact && styles.promptTextCompact]}>
          Tap to enable microphone access
        </Text>
      </View>
    );
  }

  // Denied - show warning with settings button
  return (
    <View style={[styles.container, compact && styles.containerCompact, overlay && styles.overlay]}>
      <View style={styles.warningContainer}>
        <AlertTriangle size={compact ? ICON_SIZES.md : ICON_SIZES.lg} color={Colors.vermilion} />
        <Text style={[styles.warningTitle, compact && styles.warningTitleCompact]}>
          Microphone Access Required
        </Text>
      </View>
      <Text style={[styles.warningText, compact && styles.warningTextCompact]}>
        {Platform.OS === 'web'
          ? `Please allow microphone access in your browser to use ${featureName}. Click the padlock icon in your address bar.`
          : `Please enable microphone access in Settings to use ${featureName}.`}
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.settingsButton,
          compact && styles.settingsButtonCompact,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleOpenSettings}
        accessibilityLabel="Open settings"
        accessibilityRole="button"
        accessibilityHint={Platform.OS === 'web'
          ? 'Try requesting permission again'
          : 'Opens device settings to enable microphone'}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Settings size={compact ? ICON_SIZES.sm : ICON_SIZES.md} color={Colors.softWhite} />
        <Text style={[styles.settingsButtonText, compact && styles.settingsButtonTextCompact]}>
          {Platform.OS === 'web' ? 'TRY AGAIN' : 'OPEN SETTINGS'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  containerCompact: {
    padding: 16,
    gap: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34, 30, 34, 0.95)', // Colors.ink with opacity
    zIndex: 10,
    borderRadius: 12,
  },
  // Enable button (undetermined state)
  enableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.vermilion,
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: TOUCH_TARGETS.comfortable,
    borderRadius: 32,
    gap: 10,
    // Bevel effect - use subtle border that doesn't wash out the button on iOS
    borderWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.4)',
    borderLeftColor: 'rgba(255,255,255,0.3)',
    borderRightColor: 'rgba(0,0,0,0.1)',
    borderBottomColor: 'rgba(0,0,0,0.2)',
    // Shadow
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    // Ensure solid background on iOS
    overflow: 'hidden',
  },
  enableButtonCompact: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: TOUCH_TARGETS.minimum,
    borderRadius: 24,
    gap: 8,
  },
  enableButtonText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    letterSpacing: 2,
    color: Colors.softWhite,
  },
  enableButtonTextCompact: {
    fontSize: 12,
    letterSpacing: 1,
  },
  promptText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.moss,
    textAlign: 'center',
  },
  promptTextCompact: {
    fontSize: 10,
  },
  // Warning state (denied)
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  warningTitle: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.vermilion,
  },
  warningTitleCompact: {
    fontSize: 12,
  },
  warningText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.warmGray,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  warningTextCompact: {
    fontSize: 10,
    maxWidth: 240,
    lineHeight: 15,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.charcoal,
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: TOUCH_TARGETS.minimum,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  settingsButtonCompact: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
    marginTop: 4,
  },
  settingsButtonText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 11,
    letterSpacing: 1,
    color: Colors.softWhite,
  },
  settingsButtonTextCompact: {
    fontSize: 10,
  },
  buttonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
});

export default MicrophonePermissionPrompt;
