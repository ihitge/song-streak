import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';
import { supabase } from '@/utils/supabase/client';
import { Colors } from '@/constants/Colors';
import { useStyledAlert } from '@/hooks/useStyledAlert';

// Lazy load Google Sign-In to prevent crash in Expo Go
let GoogleSignin: any = null;
let GoogleSigninButton: any = null;
let statusCodes: any = null;
let isNativeModuleAvailable = false;

try {
  const googleSignIn = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSignIn.GoogleSignin;
  GoogleSigninButton = googleSignIn.GoogleSigninButton;
  statusCodes = googleSignIn.statusCodes;
  isNativeModuleAvailable = true;
} catch (e) {
  // Native module not available (running in Expo Go)
  isNativeModuleAvailable = false;
}

export function GoogleSignInButton() {
  const [isConfigured, setIsConfigured] = useState(false);
  const { showInfo, showError } = useStyledAlert();

  useEffect(() => {
    if (isNativeModuleAvailable && GoogleSignin) {
      try {
        GoogleSignin.configure({
          webClientId: Constants.expoConfig?.extra?.googleWebClientId || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
          iosClientId: Constants.expoConfig?.extra?.googleIosClientId || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        });
        setIsConfigured(true);
      } catch (e) {
        console.warn('Failed to configure Google Sign-In:', e);
      }
    }
  }, []);

  // Show placeholder in Expo Go
  if (!isNativeModuleAvailable || !isConfigured) {
    return (
      <TouchableOpacity
        style={styles.placeholderButton}
        onPress={() => {
          showInfo(
            'Development Build Required',
            'Google Sign-In requires a development build. It is not available in Expo Go.'
          );
        }}
        activeOpacity={0.8}
      >
        <View style={styles.placeholderContent}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.placeholderText}>Sign in with Google</Text>
        </View>
      </TouchableOpacity>
    );
  }

  const handleGoogleSignIn = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Check if device supports Google Play Services (Android)
      await GoogleSignin.hasPlayServices();

      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.data?.idToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.data.idToken,
        });

        if (error) {
          console.error('Supabase Google Sign-In error:', error);

          // Check if this is a duplicate account error
          if (error.message?.toLowerCase().includes('already registered') ||
              error.message?.toLowerCase().includes('already exists') ||
              error.message?.toLowerCase().includes('user already exists')) {
            showError(
              'Account Already Exists',
              'An account with this email already exists. Please sign in with your email and password instead.'
            );
          } else {
            showError('Sign In Failed', error.message);
          }
        }
      } else {
        throw new Error('No ID token received from Google');
      }
    } catch (e: any) {
      // Handle specific error codes
      if (e.code === statusCodes.SIGN_IN_CANCELLED) {
        // User canceled the sign-in flow
        return;
      } else if (e.code === statusCodes.IN_PROGRESS) {
        // Sign-in already in progress
        return;
      } else if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        showError('Error', 'Google Play Services is not available on this device');
      } else {
        console.error('Google Sign-In error:', e);
        showError('Sign In Failed', 'Unable to sign in with Google. Please try again.');
      }
    }
  };

  return (
    <View style={styles.buttonContainer}>
      <GoogleSigninButton
        style={styles.button}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={handleGoogleSignIn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    height: 50,
    overflow: 'hidden',
    borderRadius: 8,
  },
  button: {
    width: '100%',
    height: 50,
  },
  placeholderButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#4285F4',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  googleIcon: {
    fontFamily: 'LexendDecaBold',
    fontSize: 18,
    color: '#4285F4',
    backgroundColor: '#fff',
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
    borderRadius: 4,
  },
  placeholderText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 14,
    color: '#fff',
  },
});
