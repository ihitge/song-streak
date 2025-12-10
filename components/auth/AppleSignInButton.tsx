import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from '@/utils/supabase/client';
import { Platform, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useStyledAlert } from '@/hooks/useStyledAlert';

export function AppleSignInButton() {
  const { showError } = useStyledAlert();

  // Only render on iOS
  if (Platform.OS !== 'ios') return null;

  const handleAppleSignIn = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });

        if (error) {
          console.error('Supabase Apple Sign-In error:', error);

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
        throw new Error('No identity token received from Apple');
      }
    } catch (e: any) {
      // Don't show error if user canceled
      if (e.code === 'ERR_REQUEST_CANCELED') {
        return;
      }
      console.error('Apple Sign-In error:', e);
      showError('Sign In Failed', 'Unable to sign in with Apple. Please try again.');
    }
  };

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={8}
      style={styles.button}
      onPress={handleAppleSignIn}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 50,
  },
});
