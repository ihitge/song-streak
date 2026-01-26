/**
 * MicrophonePermissionContext
 *
 * Shared context for microphone permission state across the app.
 * Ensures user only needs to grant microphone access once, and all
 * features (Tuner, Voice Recorder) immediately reflect the permission status.
 *
 * iOS Best Practice: Once granted, microphone permission persists for the app session.
 * This context ensures the UI reflects that consistently.
 *
 * IMPORTANT: On native iOS, we use react-native-audio-api's AudioManager for
 * permission requests. Using expo-audio would conflict with react-native-audio-api's
 * audio session management and cause crashes.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';

// Conditionally import native audio API for permissions (only on native platforms)
// We use react-native-audio-api instead of expo-audio to avoid audio session conflicts
let AudioManager: any;

if (Platform.OS !== 'web') {
  try {
    const audioApi = require('react-native-audio-api');
    AudioManager = audioApi.AudioManager;
  } catch (e) {
    console.warn('[MicrophonePermission] Failed to load react-native-audio-api:', e);
  }
}

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
   * Uses react-native-audio-api for native (to avoid conflicts), Permissions API for web
   */
  const checkPermission = useCallback(async (): Promise<PermissionStatus> => {
    // Native iOS/Android - use react-native-audio-api's AudioManager
    // We avoid expo-audio here because it conflicts with react-native-audio-api's audio session
    if (Platform.OS !== 'web') {
      if (!AudioManager) {
        console.warn('[MicrophonePermission] AudioManager not available');
        return 'undetermined';
      }

      try {
        // AudioManager.checkRecordingPermissions returns the current status without prompting
        const permResult = await AudioManager.checkRecordingPermissions();
        console.log('[MicrophonePermission] Native check:', permResult);

        if (permResult === 'Granted') {
          setPermissionStatus('granted');
          return 'granted';
        } else if (permResult === 'Denied') {
          setPermissionStatus('denied');
          return 'denied';
        } else {
          // 'Undetermined' - permission not yet requested
          setPermissionStatus('undetermined');
          return 'undetermined';
        }
      } catch (err) {
        console.error('[MicrophonePermission] Native check failed:', err);
        return 'undetermined';
      }
    }

    // Web - use Permissions API
    try {
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
    // Native iOS/Android - use react-native-audio-api's AudioManager
    // We MUST use the same audio library for both permission and recording
    // Using expo-audio here would conflict with react-native-audio-api's audio session
    if (Platform.OS !== 'web') {
      if (!AudioManager) {
        console.error('[MicrophonePermission] AudioManager not available');
        setPermissionStatus('denied');
        return false;
      }

      try {
        console.log('[MicrophonePermission] Requesting native permission via AudioManager...');
        const permResult = await AudioManager.requestRecordingPermissions();
        console.log('[MicrophonePermission] Native request result:', permResult);

        if (permResult === 'Granted') {
          setPermissionStatus('granted');
          console.log('[MicrophonePermission] Native permission granted');
          return true;
        } else {
          // User denied - set denied status
          setPermissionStatus('denied');
          console.log('[MicrophonePermission] Native permission denied');
          return false;
        }
      } catch (err) {
        console.error('[MicrophonePermission] Native request failed:', err);
        setPermissionStatus('denied');
        return false;
      }
    }

    // Web - use getUserMedia
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
    let cleanupFn: (() => void) | null = null;

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

          // Store cleanup function for effect cleanup
          cleanupFn = () => {
            result.removeEventListener('change', handleChange);
          };
        })
        .catch(() => {
          // Permissions API not fully supported
        });
    }

    // Proper cleanup on unmount
    return () => {
      if (cleanupFn) {
        cleanupFn();
      }
    };
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
