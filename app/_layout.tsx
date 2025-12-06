import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router'; // Removed Slot
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// Removed Text import

import { useColorScheme } from '@/components/useColorScheme';
import { LightThemeColors, DarkThemeColors } from '@/constants/Colors'; // Import custom colors
import { AuthProvider, useAuth } from '@/ctx/AuthContext';
import { SettingsProvider } from '@/ctx/SettingsContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(auth)', // Changed initial route to (auth)
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    LexendDecaThin: require('../assets/fonts/LexendDeca-Thin.ttf'),
    LexendDecaExtraLight: require('../assets/fonts/LexendDeca-ExtraLight.ttf'),
    LexendDecaLight: require('../assets/fonts/LexendDeca-Light.ttf'),
    LexendDecaRegular: require('../assets/fonts/LexendDeca-Regular.ttf'),
    LexendDecaMedium: require('../assets/fonts/LexendDeca-Medium.ttf'),
    LexendDecaSemiBold: require('../assets/fonts/LexendDeca-SemiBold.ttf'),
    LexendDecaBold: require('../assets/fonts/LexendDeca-Bold.ttf'),
    LexendDecaExtraBold: require('../assets/fonts/LexendDeca-ExtraBold.ttf'),
    LexendDecaBlack: require('../assets/fonts/LexendDeca-Black.ttf'),
    MomoTrustDisplay: require('../assets/fonts/MomoTrustDisplay-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // useEffect for redirection remains the same
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (session && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!session && !inAuthGroup) {
      router.replace('/(auth)');
    }
  }, [session, segments, isLoading]);

  // Use custom themes
  const customLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: LightThemeColors.background,
      text: LightThemeColors.text,
      primary: LightThemeColors.primary,
    },
  };

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: DarkThemeColors.background,
      text: DarkThemeColors.text,
      primary: DarkThemeColors.primary,
    },
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? customDarkTheme : customLightTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> {/* Restored */}
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
