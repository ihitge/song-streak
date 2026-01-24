import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Stack } from 'expo-router';
import { Mail, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/utils/supabase/client';
import { AppleSignInButton } from '@/components/auth/AppleSignInButton';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { useStyledAlert } from '@/hooks/useStyledAlert';

const { width } = Dimensions.get('window');

// SongStreak logo SVG - same as PageHeader
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="18 36 338 36" preserveAspectRatio="xMidYMid meet"><defs><clipPath id="circle-clip"><circle cx="66.457" cy="53.75" r="15.56"/></clipPath></defs><g fill="#221310"><g transform="translate(20.488043, 67.937595)"><path d="M 16.703125 -20.15625 C 16.703125 -21.132812 16.34375 -21.882812 15.625 -22.40625 C 14.914062 -22.925781 14 -23.1875 12.875 -23.1875 C 11.75 -23.1875 10.835938 -22.960938 10.140625 -22.515625 C 9.441406 -22.066406 9.09375 -21.4375 9.09375 -20.625 C 9.09375 -20.082031 9.273438 -19.65625 9.640625 -19.34375 C 10.003906 -19.039062 10.441406 -18.816406 10.953125 -18.671875 C 11.472656 -18.535156 11.972656 -18.445312 12.453125 -18.40625 C 12.929688 -18.363281 13.296875 -18.328125 13.546875 -18.296875 C 14.585938 -18.160156 15.664062 -17.96875 16.78125 -17.71875 C 17.90625 -17.46875 18.972656 -17.09375 19.984375 -16.59375 C 20.992188 -16.101562 21.878906 -15.4375 22.640625 -14.59375 C 23.398438 -13.757812 23.929688 -12.679688 24.234375 -11.359375 C 24.378906 -10.597656 24.453125 -9.910156 24.453125 -9.296875 C 24.453125 -7.753906 24.113281 -6.382812 23.4375 -5.1875 C 22.757812 -4 21.859375 -2.988281 20.734375 -2.15625 C 19.617188 -1.332031 18.378906 -0.703125 17.015625 -0.265625 C 15.660156 0.160156 14.28125 0.375 12.875 0.375 C 11.664062 0.375 10.410156 0.179688 9.109375 -0.203125 C 7.804688 -0.597656 6.578125 -1.207031 5.421875 -2.03125 C 4.273438 -2.863281 3.34375 -3.9375 2.625 -5.25 C 1.914062 -6.570312 1.5625 -8.175781 1.5625 -10.0625 L 8.84375 -10.0625 C 8.84375 -9.101562 9.066406 -8.367188 9.515625 -7.859375 C 9.960938 -7.359375 10.507812 -7.023438 11.15625 -6.859375 C 11.800781 -6.691406 12.390625 -6.609375 12.921875 -6.609375 C 14.097656 -6.609375 15.097656 -6.789062 15.921875 -7.15625 C 16.753906 -7.519531 17.171875 -8.125 17.171875 -8.96875 C 17.171875 -9.5 16.992188 -9.910156 16.640625 -10.203125 C 16.285156 -10.492188 15.851562 -10.707031 15.34375 -10.84375 C 14.84375 -10.988281 14.347656 -11.085938 13.859375 -11.140625 C 13.367188 -11.203125 12.984375 -11.25 12.703125 -11.28125 C 11.523438 -11.382812 10.316406 -11.5625 9.078125 -11.8125 C 7.847656 -12.070312 6.707031 -12.484375 5.65625 -13.046875 C 4.601562 -13.609375 3.726562 -14.414062 3.03125 -15.46875 C 2.332031 -16.519531 1.910156 -17.882812 1.765625 -19.5625 L 1.765625 -19.53125 C 1.648438 -21.6875 2.097656 -23.535156 3.109375 -25.078125 C 4.117188 -26.617188 5.492188 -27.800781 7.234375 -28.625 C 8.972656 -29.457031 10.894531 -29.875 13 -29.875 C 14.320312 -29.875 15.625 -29.679688 16.90625 -29.296875 C 18.195312 -28.921875 19.375 -28.34375 20.4375 -27.5625 C 21.507812 -26.78125 22.359375 -25.769531 22.984375 -24.53125 C 23.617188 -23.300781 23.9375 -21.84375 23.9375 -20.15625 Z M 16.703125 -20.15625 "/></g><g transform="translate(87.911037, 67.937595)"><path d="M 17.84375 -29.453125 L 24.953125 -29.453125 L 24.953125 0 L 19.3125 0 L 9.25 -14.34375 L 9.25 0 L 2.109375 0 L 2.109375 -29.453125 L 7.65625 -29.453125 L 17.84375 -14.734375 Z M 17.84375 -29.453125 "/></g><g transform="translate(122.419084, 67.937595)"><path d="M 16.40625 -22.84375 C 14.976562 -22.84375 13.6875 -22.492188 12.53125 -21.796875 C 11.382812 -21.097656 10.472656 -20.132812 9.796875 -18.90625 C 9.128906 -17.6875 8.796875 -16.28125 8.796875 -14.6875 C 8.796875 -13.03125 9.128906 -11.578125 9.796875 -10.328125 C 10.472656 -9.078125 11.382812 -8.109375 12.53125 -7.421875 C 13.6875 -6.734375 14.976562 -6.390625 16.40625 -6.390625 C 17.394531 -6.390625 18.410156 -6.585938 19.453125 -6.984375 C 20.503906 -7.378906 21.425781 -8.09375 22.21875 -9.125 L 13.21875 -9.125 L 13.21875 -15.5625 L 31.21875 -15.5625 C 31.21875 -13.851562 31.097656 -12.457031 30.859375 -11.375 C 30.617188 -10.300781 30.390625 -9.484375 30.171875 -8.921875 C 29.492188 -7.035156 28.414062 -5.390625 26.9375 -3.984375 C 25.46875 -2.585938 23.804688 -1.492188 21.953125 -0.703125 C 20.109375 0.078125 18.257812 0.46875 16.40625 0.46875 C 14.28125 0.46875 12.3125 0.0976562 10.5 -0.640625 C 8.6875 -1.390625 7.109375 -2.441406 5.765625 -3.796875 C 4.421875 -5.160156 3.375 -6.769531 2.625 -8.625 C 1.882812 -10.476562 1.515625 -12.5 1.515625 -14.6875 C 1.515625 -16.90625 1.890625 -18.9375 2.640625 -20.78125 C 3.398438 -22.632812 4.460938 -24.238281 5.828125 -25.59375 C 7.191406 -26.957031 8.773438 -28.007812 10.578125 -28.75 C 12.390625 -29.5 14.332031 -29.875 16.40625 -29.875 C 17.84375 -29.875 19.351562 -29.65625 20.9375 -29.21875 C 22.519531 -28.789062 24.023438 -28.097656 25.453125 -27.140625 C 26.890625 -26.179688 28.117188 -24.910156 29.140625 -23.328125 C 30.160156 -21.742188 30.828125 -19.789062 31.140625 -17.46875 L 23.5625 -17.46875 C 23.226562 -18.863281 22.660156 -19.953125 21.859375 -20.734375 C 21.054688 -21.523438 20.171875 -22.070312 19.203125 -22.375 C 18.234375 -22.6875 17.300781 -22.84375 16.40625 -22.84375 Z M 16.40625 -22.84375 "/></g><g transform="translate(161.977018, 67.937595)"><path d="M 16.703125 -20.15625 C 16.703125 -21.132812 16.34375 -21.882812 15.625 -22.40625 C 14.914062 -22.925781 14 -23.1875 12.875 -23.1875 C 11.75 -23.1875 10.835938 -22.960938 10.140625 -22.515625 C 9.441406 -22.066406 9.09375 -21.4375 9.09375 -20.625 C 9.09375 -20.082031 9.273438 -19.65625 9.640625 -19.34375 C 10.003906 -19.039062 10.441406 -18.816406 10.953125 -18.671875 C 11.472656 -18.535156 11.972656 -18.445312 12.453125 -18.40625 C 12.929688 -18.363281 13.296875 -18.328125 13.546875 -18.296875 C 14.585938 -18.160156 15.664062 -17.96875 16.78125 -17.71875 C 17.90625 -17.46875 18.972656 -17.09375 19.984375 -16.59375 C 20.992188 -16.101562 21.878906 -15.4375 22.640625 -14.59375 C 23.398438 -13.757812 23.929688 -12.679688 24.234375 -11.359375 C 24.378906 -10.597656 24.453125 -9.910156 24.453125 -9.296875 C 24.453125 -7.753906 24.113281 -6.382812 23.4375 -5.1875 C 22.757812 -4 21.859375 -2.988281 20.734375 -2.15625 C 19.617188 -1.332031 18.378906 -0.703125 17.015625 -0.265625 C 15.660156 0.160156 14.28125 0.375 12.875 0.375 C 11.664062 0.375 10.410156 0.179688 9.109375 -0.203125 C 7.804688 -0.597656 6.578125 -1.207031 5.421875 -2.03125 C 4.273438 -2.863281 3.34375 -3.9375 2.625 -5.25 C 1.914062 -6.570312 1.5625 -8.175781 1.5625 -10.0625 L 8.84375 -10.0625 C 8.84375 -9.101562 9.066406 -8.367188 9.515625 -7.859375 C 9.960938 -7.359375 10.507812 -7.023438 11.15625 -6.859375 C 11.800781 -6.691406 12.390625 -6.609375 12.921875 -6.609375 C 14.097656 -6.609375 15.097656 -6.789062 15.921875 -7.15625 C 16.753906 -7.519531 17.171875 -8.125 17.171875 -8.96875 C 17.171875 -9.5 16.992188 -9.910156 16.640625 -10.203125 C 16.285156 -10.492188 15.851562 -10.707031 15.34375 -10.84375 C 14.84375 -10.988281 14.347656 -11.085938 13.859375 -11.140625 C 13.367188 -11.203125 12.984375 -11.25 12.703125 -11.28125 C 11.523438 -11.382812 10.316406 -11.5625 9.078125 -11.8125 C 7.847656 -12.070312 6.707031 -12.484375 5.65625 -13.046875 C 4.601562 -13.609375 3.726562 -14.414062 3.03125 -15.46875 C 2.332031 -16.519531 1.910156 -17.882812 1.765625 -19.5625 L 1.765625 -19.53125 C 1.648438 -21.6875 2.097656 -23.535156 3.109375 -25.078125 C 4.117188 -26.617188 5.492188 -27.800781 7.234375 -28.625 C 8.972656 -29.457031 10.894531 -29.875 13 -29.875 C 14.320312 -29.875 15.625 -29.679688 16.90625 -29.296875 C 18.195312 -28.921875 19.375 -28.34375 20.4375 -27.5625 C 21.507812 -26.78125 22.359375 -25.769531 22.984375 -24.53125 C 23.617188 -23.300781 23.9375 -21.84375 23.9375 -20.15625 Z M 16.703125 -20.15625 "/></g><g transform="translate(194.970089, 67.937595)"><path d="M 24.453125 -29.796875 L 24.453125 -23.0625 L 16.53125 -23.0625 L 16.53125 0 L 9.34375 0 L 9.34375 -23.0625 L 1.390625 -23.0625 L 1.390625 -29.796875 Z M 24.453125 -29.796875 "/></g><g transform="translate(228.005247, 67.937595)"><path d="M 13.546875 -29.703125 C 15.796875 -29.703125 17.671875 -29.222656 19.171875 -28.265625 C 20.671875 -27.316406 21.796875 -26.09375 22.546875 -24.59375 C 23.304688 -23.09375 23.6875 -21.53125 23.6875 -19.90625 C 23.6875 -18.101562 23.207031 -16.347656 22.25 -14.640625 C 21.300781 -12.929688 19.859375 -11.613281 17.921875 -10.6875 L 24.234375 -1.34375 L 24.234375 0 L 16.578125 0 L 10.4375 -9.96875 L 9.25 -9.96875 L 9.25 0 L 2.109375 0 L 2.109375 -29.703125 Z M 13.375 -16.5 C 14.445312 -16.5 15.257812 -16.828125 15.8125 -17.484375 C 16.375 -18.140625 16.65625 -18.847656 16.65625 -19.609375 C 16.65625 -20.390625 16.378906 -21.117188 15.828125 -21.796875 C 15.285156 -22.472656 14.46875 -22.8125 13.375 -22.8125 L 9.25 -22.8125 L 9.25 -16.5 Z M 13.375 -16.5 "/></g><g transform="translate(260.240836, 67.937595)"><path d="M 2.109375 -29.703125 L 21.5 -29.703125 L 21.5 -22.765625 L 9.34375 -22.765625 L 9.34375 -18.640625 L 21.25 -18.640625 L 21.25 -11.65625 L 9.34375 -11.65625 L 9.34375 -6.9375 L 21.546875 -6.9375 L 21.546875 0 L 2.109375 0 Z M 2.109375 -29.703125 "/></g><g transform="translate(290.372294, 67.937595)"><path d="M 12.125 -29.796875 L 17.25 -29.796875 L 29.5 0 L 21.375 0 L 19.734375 -4.328125 L 9.671875 -4.328125 L 8.03125 0 L 0.34375 0 Z M 14.734375 -17.921875 L 12.546875 -11.703125 L 12.28125 -11.03125 L 17.171875 -11.03125 L 17 -11.53125 Z M 14.734375 -17.921875 "/></g><g transform="translate(326.816146, 67.937595)"><path d="M 18.140625 0 L 9.390625 -11.40625 L 9.390625 0 L 2.1875 0 L 2.1875 -29.453125 L 9.390625 -29.453125 L 9.390625 -18.015625 L 17.546875 -29.453125 L 26.09375 -29.453125 L 26.09375 -29.03125 L 15.65625 -14.8125 L 27.0625 -0.375 L 27.0625 0 Z M 18.140625 0 "/></g></g><g clip-path="url(#circle-clip)"><circle cx="66.457" cy="53.75" r="15.56" fill="#ee6c4d"/></g><path stroke-linecap="butt" transform="matrix(0.595314, -0.450705, 0.450705, 0.595314, 64.202972, 51.84629)" fill="none" stroke-linejoin="miter" d="M -0.00121764 3.997428 L 22.786297 3.998952" stroke="#E4DFDA" stroke-width="8" stroke-opacity="1" stroke-miterlimit="4"/></svg>`;

// Logo dimensions - larger for login page (viewBox 338x36, aspect ratio 9.39:1)
const AUTH_LOGO_WIDTH = 208;
const AUTH_LOGO_HEIGHT = 22;

export default function AuthScreen() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { showError, showSuccess, showInfo } = useStyledAlert();

  async function resetPassword() {
    if (!email.trim()) {
      showInfo('Email Required', 'Please enter your email address first, then tap "Forgot Security Key?"');
      return;
    }

    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'songstreak://reset-password',
    });

    setResetLoading(false);

    if (error) {
      showError('Error', error.message);
    } else {
      showSuccess(
        'Check Your Email',
        'If an account exists with this email, you will receive a password reset link shortly.'
      );
    }
  }

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) showError('Sign In Failed', error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    if (password !== confirmPassword) {
      showError('Passwords Mismatch', 'Your passwords do not match. Please try again.');
      return;
    }

    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: 'songstreak://auth-callback',
      },
    });

    if (error) showError('Sign Up Failed', error.message);
    else if (!session) showInfo('Verify Email', 'Please check your inbox for email verification!');
    setLoading(false);
  }

  const handleAction = () => {
    if (isRegistering) {
      signUpWithEmail();
    } else {
      signInWithEmail();
    }
  };

  return (
    <View style={styles.chassis}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Noise Texture Overlay (Simulated with opacity) */}
      <View style={styles.noiseOverlay} pointerEvents="none" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.deviceContainer}>
            {/* Header */}
            <View style={styles.header}>
              <SvgXml xml={logoSvg} width={AUTH_LOGO_WIDTH} height={AUTH_LOGO_HEIGHT} />
              <View style={styles.accentLine} />
              <Text style={styles.subtitle}>ACCESS CONTROL</Text>
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialContainer}>
              <AppleSignInButton />
              <GoogleSignInButton />
            </View>

            {/* OR Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Mode Switcher */}
            <View style={styles.modeSwitcherWell}>
              <TouchableOpacity
                style={[styles.modeButton, !isRegistering && styles.modeButtonActive]}
                onPress={() => setIsRegistering(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeText, !isRegistering && styles.modeTextActive]}>
                  LOGIN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, isRegistering && styles.modeButtonActive]}
                onPress={() => setIsRegistering(true)}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeText, isRegistering && styles.modeTextActive]}>
                  REGISTER
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Area */}
            <View style={styles.formDeck}>
              <Animated.View layout={Layout.springify()}>
                {/* Identity (Email) */}
                <RamsInput
                  label="USER NAME"
                  icon={<Mail size={14} color={Colors.graphite} />}
                  placeholder="user@domain.com"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />

                {/* Security Key (Password) */}
                <RamsInput
                  label="PASSWORD"
                  icon={<Lock size={14} color={Colors.graphite} />}
                  placeholder="••••••••"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />

                {/* Confirm Key (Register only) */}
                {isRegistering && (
                  <Animated.View entering={FadeIn} exiting={FadeOut}>
                    <RamsInput
                      label="CONFIRM PASSWORD"
                      icon={<Lock size={14} color={Colors.graphite} />}
                      placeholder="••••••••"
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      autoCapitalize="none"
                    />
                  </Animated.View>
                )}
              </Animated.View>
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity 
              activeOpacity={0.9} 
              style={styles.actionButtonContainer} 
              onPress={handleAction}
              disabled={loading}
            >
              <LinearGradient
                colors={[Colors.vermilion, '#d04620']}
                style={styles.actionButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                {loading ? (
                   <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>
                    {isRegistering ? 'REGISTER' : 'LOGIN'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer */}
            <TouchableOpacity
              style={styles.footerLink}
              onPress={!isRegistering ? resetPassword : undefined}
              disabled={resetLoading}
            >
              {resetLoading && !isRegistering ? (
                <ActivityIndicator size="small" color={Colors.graphite} />
              ) : (
                <Text style={styles.footerLinkText}>
                  {isRegistering ? 'NEED ASSISTANCE?' : 'FORGOT PASSWORD?'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Legal Links (Required by Apple for Registration) */}
            {isRegistering && (
              <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.legalContainer}>
                <Text style={styles.legalText}>
                  By registering, you agree to our{' '}
                  <Text
                    style={styles.legalLink}
                    onPress={() => Linking.openURL('https://www.songstreak.app/terms')}
                  >
                    Terms of Service
                  </Text>
                  {' '}and{' '}
                  <Text
                    style={styles.legalLink}
                    onPress={() => Linking.openURL('https://www.songstreak.app/privacy')}
                  >
                    Privacy Policy
                  </Text>
                  .
                </Text>
              </Animated.View>
            )}

            <Text style={styles.sysVersion}>SYS. VER 2.4.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/**
 * RamsInput - Industrial-styled text input with label and icon
 * Matches the "Industrial Play" aesthetic with etched line detail
 */
interface RamsInputProps extends TextInputProps {
  /** Label displayed above the input */
  label: string;
  /** Icon displayed next to the label */
  icon: React.ReactNode;
}

function RamsInput({ label, icon, ...props }: RamsInputProps) {
  return (
    <View style={styles.inputContainer}>
      <View style={styles.labelRow}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.fieldContainer}>
        <TextInput
          style={styles.input}
          placeholderTextColor="#a0a0a0"
          accessibilityLabel={label}
          accessibilityHint={`Enter your ${label.toLowerCase()}`}
          {...props}
        />
        <View style={styles.etchedLine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chassis: {
    flex: 1,
    backgroundColor: Colors.matteFog, // #e6e6e6
  },
  noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.ink,
    opacity: 0.02, // Subtle noise effect substitute
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deviceContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.matteFog,
    borderRadius: 12, // Reduced from 32
    padding: 24,
    // Shadow for the "Card" / Device
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  accentLine: {
    width: 48,
    height: 4,
    backgroundColor: Colors.vermilion, // #ea5428
    borderRadius: 2,
    marginVertical: 8,
  },
  subtitle: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.warmGray,
    letterSpacing: 3,
  },
  socialContainer: {
    gap: 12,
    marginBottom: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.alloy,
  },
  dividerText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 12,
    color: Colors.graphite,
    paddingHorizontal: 16,
    letterSpacing: 2,
  },
  modeSwitcherWell: {
    flexDirection: 'row',
    backgroundColor: Colors.alloy, // #d6d6d6
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    // Inset shadow effect (simulated)
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#c0c0c0',
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: Colors.matteFog, // #e6e6e6
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modeText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 12,
    fontWeight: '700',
    color: Colors.graphite,
  },
  modeTextActive: {
    color: Colors.charcoal,
  },
  formDeck: {
    backgroundColor: '#e0e0e0', // Slightly darker than chassis
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    // Inner shadow simulation
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#d0d0d0',
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  label: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    fontWeight: '700',
    color: '#666666',
    letterSpacing: 1.5,
  },
  fieldContainer: {
    position: 'relative',
  },
  input: {
    fontFamily: 'LexendDecaRegular',
    backgroundColor: Colors.softWhite, // #f0f0f0
    height: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    color: Colors.charcoal,
    borderBottomWidth: 2,
    borderBottomColor: '#d4d4d4',
  },
  etchedLine: {
    height: 1,
    backgroundColor: '#ffffff',
    width: '100%',
    position: 'absolute',
    bottom: -1,
  },
  actionButtonContainer: {
    marginBottom: 24,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButton: {
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2, // Reduced from 4
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)', // Highlight
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.2)', // Shadow
  },
  actionButtonText: {
    fontFamily: 'LexendDecaBold',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  footerLink: {
    alignItems: 'center',
    marginBottom: 32,
  },
  footerLinkText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    fontWeight: '700',
    color: Colors.graphite,
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },
  sysVersion: {
    textAlign: 'center',
    fontSize: 10,
    fontFamily: 'LexendDecaRegular',
    color: '#a0a0a0',
  },
  legalContainer: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  legalText: {
    fontSize: 11,
    fontFamily: 'LexendDecaRegular',
    color: Colors.graphite,
    textAlign: 'center',
    lineHeight: 16,
  },
  legalLink: {
    color: Colors.vermilion,
    textDecorationLine: 'underline',
  },
});
