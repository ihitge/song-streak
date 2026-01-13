import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/utils/supabase/client';
import { useStyledAlert } from '@/hooks/useStyledAlert';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useStyledAlert();

  async function updatePassword() {
    if (!newPassword.trim()) {
      showError('Error', 'Please enter a new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      showError('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      showError('Error', error.message);
    } else {
      showSuccess(
        'Password Updated',
        'Your password has been successfully updated. You can now sign in with your new password.',
        () => router.replace('/(auth)')
      );
    }
  }

  return (
    <View style={styles.chassis}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>SongStreak</Text>
            <View style={styles.accentLine} />
            <Text style={styles.subtitle}>RESET SECURITY KEY</Text>
          </View>

          <View style={styles.formDeck}>
            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Lock size={14} color={Colors.graphite} />
                <Text style={styles.label}>NEW SECURITY KEY</Text>
              </View>
              <View style={styles.fieldContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#a0a0a0"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Lock size={14} color={Colors.graphite} />
                <Text style={styles.label}>CONFIRM SECURITY KEY</Text>
              </View>
              <View style={styles.fieldContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#a0a0a0"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.actionButtonContainer}
            onPress={updatePassword}
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
                <Text style={styles.actionButtonText}>UPDATE SECURITY KEY</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => router.replace('/(auth)')}
          >
            <Text style={styles.footerLinkText}>BACK TO LOGIN</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  chassis: {
    flex: 1,
    backgroundColor: Colors.matteFog,
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'MomoTrustDisplay',
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.charcoal,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  accentLine: {
    width: 48,
    height: 4,
    backgroundColor: Colors.vermilion,
    borderRadius: 2,
    marginVertical: 8,
  },
  subtitle: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.warmGray,
    letterSpacing: 3,
  },
  formDeck: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
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
    backgroundColor: Colors.softWhite,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    color: Colors.charcoal,
    borderBottomWidth: 2,
    borderBottomColor: '#d4d4d4',
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
    borderRadius: 2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.2)',
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
  },
  footerLinkText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    fontWeight: '700',
    color: Colors.graphite,
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },
});
