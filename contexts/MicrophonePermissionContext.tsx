/**
 * MicrophonePermissionContext
 *
 * Shared context for microphone permission state across the app.
 * Ensures user only needs to grant microphone access once, and all
 * features (Tuner, Voice Recorder) immediately reflect the permission status.
 *
 * iOS Best Practice: Once granted, microphone permission persists for the app session.
 * This context ensures the UI reflects that consistently.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';

type PermissionStatus = 'undetermined' | 'granted' | 'denied';

interface MicrophonePermissionContextValue {
  hasPermission: boolean;
  permissionStatus: PermissionStatus;
  requestPermission: () => Promise<boolean>;
  checkPermission: () => Promise<PermissionStatus>;
}

const MicrophonePermissionContext = createContext<MicrophonePermissionContextValue | null>(null);

interface MicrophonePermissionProviderProps {
  children: ReactNode;
}

/**
 * Provider component that manages microphone permission state
 */
export function MicrophonePermissionProvider({ children }: MicrophonePermissionProviderProps) {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');
  const hasPermission = permissionStatus === 'granted';

  /**
   * Check current permission status without prompting
   * Uses the Permissions API where available
   */
  const checkPermission = useCallback(async (): Promise<PermissionStatus> => {
    if (Platform.OS !== 'web') {
      // TODO: Implement native permission check using expo-av or similar
      return 'undetermined';
    }

    try {
      // Use Permissions API to check without prompting
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });

        if (result.state === 'granted') {
          setPermissionStatus('granted');
          return 'granted';
        } else if (result.state === 'denied') {
          setPermissionStatus('denied');
          return 'denied';
        } else {
          // 'prompt' state - user hasn't decided yet
          setPermissionStatus('undetermined');
          return 'undetermined';
        }
      }
    } catch {
      // Permissions API not supported, status remains undetermined
    }

    return 'undetermined';
  }, []);

  /**
   * Request microphone permission
   * This will prompt the user if they haven't decided yet
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'web') {
      // TODO: Implement native permission request
      console.warn('[MicrophonePermission] Native not yet implemented');
      setPermissionStatus('denied');
      return false;
    }

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        console.error('[MicrophonePermission] getUserMedia not supported');
        setPermissionStatus('denied');
        return false;
      }

      // Request microphone access - this prompts the user
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      // Stop the stream immediately - we just needed to trigger the permission prompt
      stream.getTracks().forEach((track) => track.stop());

      setPermissionStatus('granted');
      console.log('[MicrophonePermission] Permission granted');
      return true;
    } catch (err) {
      console.error('[MicrophonePermission] Permission denied:', err);
      setPermissionStatus('denied');
      return false;
    }
  }, []);

  /**
   * Check permission on mount and listen for changes
   */
  useEffect(() => {
    // Initial check
    checkPermission();

    // Listen for permission changes (user might change in browser settings)
    if (Platform.OS === 'web' && navigator.permissions?.query) {
      let permissionState: PermissionStatus | null = null;

      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((result) => {
          // Update if changed
          const handleChange = () => {
            const newStatus = result.state === 'granted' ? 'granted'
              : result.state === 'denied' ? 'denied'
              : 'undetermined';

            if (newStatus !== permissionState) {
              permissionState = newStatus;
              setPermissionStatus(newStatus);
            }
          };

          result.addEventListener('change', handleChange);

          // Return cleanup function
          return () => {
            result.removeEventListener('change', handleChange);
          };
        })
        .catch(() => {
          // Permissions API not fully supported
        });
    }
  }, [checkPermission]);

  const value: MicrophonePermissionContextValue = {
    hasPermission,
    permissionStatus,
    requestPermission,
    checkPermission,
  };

  return (
    <MicrophonePermissionContext.Provider value={value}>
      {children}
    </MicrophonePermissionContext.Provider>
  );
}

/**
 * Hook to access microphone permission state and actions
 */
export function useMicrophonePermission(): MicrophonePermissionContextValue {
  const context = useContext(MicrophonePermissionContext);

  if (!context) {
    throw new Error(
      'useMicrophonePermission must be used within a MicrophonePermissionProvider'
    );
  }

  return context;
}
