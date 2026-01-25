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
import { PrimaryButton } from '@/components/ui/PrimaryButton';

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
  const handleRequestPermission = useCallback(() => {
    onRequestPermission();
  }, [onRequestPermission]);

  const handleOpenSettings = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'ios') {
      // Open app-specific settings page - microphone toggle should appear here
      // Note: iOS shows all permissions granted to the app in its settings page
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
        <PrimaryButton
          onPress={handleRequestPermission}
          icon={<Mic size={compact ? ICON_SIZES.md : ICON_SIZES.lg} color="#FFFFFF" strokeWidth={2.5} />}
          label="ENABLE MIC"
          variant="primary"
          size={compact ? 'compact' : 'standard'}
          accessibilityLabel={`Enable microphone for ${featureName}`}
          accessibilityHint="Tap to request microphone permission"
        />
      </View>
    );
  }

  // Denied - show warning with clear instructions and settings button
  return (
    <View style={[styles.container, compact && styles.containerCompact, overlay && styles.overlay]}>
      <View style={styles.warningContainer}>
        <AlertTriangle size={ICON_SIZES.xl} color={Colors.vermilion} />
      </View>
      <Text style={styles.warningTitle}>
        Microphone Access Denied
      </Text>
      <Text style={styles.warningText}>
        {Platform.OS === 'web'
          ? `To use ${featureName}, please allow microphone access in your browser. Click the padlock icon in your address bar.`
          : `To use ${featureName}, you need to enable microphone access in your device settings.`}
      </Text>
      {Platform.OS !== 'web' && (
        <Text style={styles.instructionText}>
          Tap the button below, then enable "Microphone" toggle.
        </Text>
      )}
      <PrimaryButton
        onPress={handleOpenSettings}
        icon={<Settings size={ICON_SIZES.md} color="#FFFFFF" />}
        label={Platform.OS === 'web' ? 'TRY AGAIN' : 'OPEN SETTINGS'}
        variant="secondary"
        size="standard"
        accessibilityLabel="Open settings"
        accessibilityHint={Platform.OS === 'web'
          ? 'Try requesting permission again'
          : 'Opens device settings to enable microphone'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  containerCompact: {
    padding: 16,
    gap: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34, 30, 34, 0.95)', // Colors.ink with opacity
    zIndex: 10,
    borderRadius: 12,
  },
  // Warning state (denied)
  warningContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  warningTitle: {
    fontFamily: 'LexendDecaBold',
    fontSize: 16,
    color: Colors.vermilion,
    textAlign: 'center',
  },
  warningText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 14,
    color: Colors.warmGray,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 20,
  },
  instructionText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 12,
    color: Colors.softWhite,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
    marginTop: 4,
  },
});

export default MicrophonePermissionPrompt;
