/**
 * ErrorState Component
 *
 * Reusable error state display with optional retry action.
 * Shows an icon, error message, and optional retry button.
 *
 * Usage:
 * ```tsx
 * <ErrorState
 *   message="Failed to load songs"
 *   onRetry={() => refetch()}
 * />
 * ```
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { BEVELS, SHADOWS } from '@/constants/Styles';
import type { LucideIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface ErrorStateProps {
  /** Error message to display */
  message: string;
  /** Optional retry callback - shows retry button when provided */
  onRetry?: () => void;
  /** Optional custom icon - defaults to AlertCircle */
  icon?: LucideIcon;
  /** Icon size - defaults to 48 */
  iconSize?: number;
  /** Retry button text - defaults to "TRY AGAIN" */
  retryText?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  icon: Icon = AlertCircle,
  iconSize = 48,
  retryText = 'TRY AGAIN',
}) => {
  const handleRetry = async () => {
    if (onRetry) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onRetry();
    }
  };

  return (
    <View style={styles.container}>
      <Icon size={iconSize} color={Colors.vermilion} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.retryButtonPressed,
          ]}
          onPress={handleRetry}
          accessibilityRole="button"
          accessibilityLabel={retryText}
        >
          <Text style={styles.retryButtonText}>{retryText}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  message: {
    fontFamily: 'LexendDecaBold',
    fontSize: 16,
    color: Colors.vermilion,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: Colors.alloy,
    ...BEVELS.raised,
    ...SHADOWS.button,
  },
  retryButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  retryButtonText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 12,
    letterSpacing: 1,
    color: Colors.charcoal,
    textTransform: 'uppercase',
  },
});

export default ErrorState;
