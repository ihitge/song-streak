import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '@/constants/Colors';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { logger } from '@/utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional fallback component to show on error */
  fallback?: ReactNode;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Name for logging purposes */
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary - Catches JavaScript errors in child component tree
 *
 * Prevents the entire app from crashing when a component throws an error.
 * Shows a fallback UI instead of a white screen.
 *
 * Usage:
 *   <ErrorBoundary name="AddSongScreen">
 *     <AddSongContent />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError, name } = this.props;

    // Log the error
    logger.error(`[ErrorBoundary${name ? `:${name}` : ''}]`, error, errorInfo);

    // Call optional error callback
    if (onError) {
      onError(error, errorInfo);
    }

    // TODO: Send to error reporting service (Sentry, Bugsnag, etc.)
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, name } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <AlertTriangle size={48} color={Colors.vermilion} />
          </View>

          <Text style={styles.title}>Something went wrong</Text>

          <Text style={styles.message}>
            {name ? `Error in ${name}` : 'An unexpected error occurred'}
          </Text>

          {__DEV__ && error && (
            <View style={styles.errorDetails}>
              <Text style={styles.errorText}>{error.message}</Text>
            </View>
          )}

          <Pressable style={styles.retryButton} onPress={this.handleRetry}>
            <RefreshCw size={16} color={Colors.softWhite} />
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.matteFog,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'LexendDecaBold',
    color: Colors.ink,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    fontFamily: 'LexendDecaRegular',
    color: Colors.graphite,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorDetails: {
    backgroundColor: Colors.alloy,
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    maxWidth: '100%',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'LexendDecaRegular',
    color: Colors.vermilion,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.charcoal,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryText: {
    fontSize: 14,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.softWhite,
    letterSpacing: 1,
  },
});

export default ErrorBoundary;
