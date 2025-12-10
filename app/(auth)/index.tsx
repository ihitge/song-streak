import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { Mail, Lock, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/utils/supabase/client';
import { AppleSignInButton } from '@/components/auth/AppleSignInButton';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { useStyledAlert } from '@/hooks/useStyledAlert';

const { width } = Dimensions.get('window');

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
      showError('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
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
              <Text style={styles.title}>SongStreak</Text>
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
                  label="IDENTITY"
                  icon={<Mail size={14} color={Colors.graphite} />}
                  placeholder="user@domain.com"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />

                {/* Security Key (Password) */}
                <RamsInput
                  label="SECURITY KEY"
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
                      label="CONFIRM KEY"
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
                    {isRegistering ? 'CREATE CREDENTIALS' : 'GRANT ACCESS'}
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
                  {isRegistering ? 'NEED ASSISTANCE?' : 'FORGOT SECURITY KEY?'}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.sysVersion}>SYS. VER 2.4.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// Custom Rams Input Component
function RamsInput({ label, icon, ...props }: any) {
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
  title: {
    fontFamily: 'MomoTrustDisplay',
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.deepSpaceBlue,
    letterSpacing: -0.5,
    marginBottom: 4,
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
});
