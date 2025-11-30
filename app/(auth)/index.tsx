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
} from 'react-native';
import { Stack } from 'expo-router';
import { Mail, Lock, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

export default function AuthScreen() {
  const [isRegistering, setIsRegistering] = useState(false);

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
              <Text style={styles.title}>SONG STREAK</Text>
              <View style={styles.accentLine} />
              <Text style={styles.subtitle}>ACCESS CONTROL</Text>
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
                />

                {/* Security Key (Password) */}
                <RamsInput
                  label="SECURITY KEY"
                  icon={<Lock size={14} color={Colors.graphite} />}
                  placeholder="••••••••"
                  secureTextEntry
                />

                {/* Confirm Key (Register only) */}
                {isRegistering && (
                  <Animated.View entering={FadeIn} exiting={FadeOut}>
                    <RamsInput
                      label="CONFIRM KEY"
                      icon={<Lock size={14} color={Colors.graphite} />}
                      placeholder="••••••••"
                      secureTextEntry
                    />
                  </Animated.View>
                )}
              </Animated.View>
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity activeOpacity={0.9} style={styles.actionButtonContainer}>
              <LinearGradient
                colors={[Colors.vermilion, '#d04620']}
                style={styles.actionButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <Text style={styles.actionButtonText}>
                  {isRegistering ? 'CREATE CREDENTIALS' : 'GRANT ACCESS'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer */}
            <TouchableOpacity style={styles.footerLink}>
              <Text style={styles.footerLinkText}>
                {isRegistering ? 'NEED ASSISTANCE?' : 'FORGOT SECURITY KEY?'}
              </Text>
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
    backgroundColor: '#000',
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
    borderRadius: 32,
    padding: 24,
    // Shadow for the "Card" / Device
    shadowColor: '#000',
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
    fontFamily: 'SpaceGroteskBold',
    fontSize: 24,
    fontWeight: '900',
    color: Colors.charcoal, // #333333
    letterSpacing: -0.5,
  },
  accentLine: {
    width: 48,
    height: 4,
    backgroundColor: Colors.vermilion, // #ea5428
    borderRadius: 2,
    marginVertical: 8,
  },
  subtitle: {
    fontFamily: 'SpaceGroteskSemiBold',
    fontSize: 10,
    fontWeight: '700',
    color: Colors.graphite, // #888888
    letterSpacing: 4, // Wide spacing
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modeText: {
    fontFamily: 'SpaceGroteskSemiBold',
    fontSize: 12,
    fontWeight: '700',
    color: Colors.graphite,
  },
  modeTextActive: {
    color: Colors.charcoal,
  },
  formDeck: {
    backgroundColor: '#e0e0e0', // Slightly darker than chassis
    borderRadius: 16,
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
    fontFamily: 'SpaceGroteskSemiBold',
    fontSize: 10,
    fontWeight: '700',
    color: '#666666',
    letterSpacing: 1.5,
  },
  fieldContainer: {
    position: 'relative',
  },
  input: {
    fontFamily: 'SpaceGroteskRegular',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButton: {
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)', // Highlight
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.2)', // Shadow
  },
  actionButtonText: {
    fontFamily: 'SpaceGroteskBold',
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
    fontFamily: 'SpaceGroteskSemiBold',
    fontSize: 10,
    fontWeight: '700',
    color: Colors.graphite,
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },
  sysVersion: {
    textAlign: 'center',
    fontSize: 10,
    fontFamily: 'SpaceGroteskRegular',
    color: '#a0a0a0',
  },
});
