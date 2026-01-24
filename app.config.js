/**
 * Expo configuration with EAS secrets support
 *
 * Environment variables set as EAS secrets will be available during
 * the build process. This config exposes them via expo.extra so they
 * can be accessed at runtime.
 *
 * App Store Optimization (ASO) Notes:
 * - App name: "SongStreak" - concise, memorable, searchable
 * - Bundle ID: com.songstreak.app - proper reverse domain notation
 * - Version: follows semver (major.minor.patch)
 * - iOS 17+ privacy manifest included for App Store compliance
 */
module.exports = {
  expo: {
    name: "SongStreak",
    slug: "song-streak",
    version: "2.2.0",
    description: "Track your music practice streaks, manage setlists, and build consistent practice habits with a built-in guitar tuner, metronome, and band collaboration tools.",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "songstreak",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    primaryColor: "#EE6C4D",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#000000"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.songstreak.app",
      buildNumber: "21",
      usesAppleSignIn: true,
      /**
       * Privacy Manifest (iOS 17+ requirement)
       * Required for App Store submission as of Spring 2024
       * Documents API usage and data collection practices
       */
      privacyManifests: {
        NSPrivacyAccessedAPITypes: [
          {
            // UserDefaults API - used by AsyncStorage for user preferences
            NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
            NSPrivacyAccessedAPITypeReasons: ["CA92.1"]
          },
          {
            // System boot time API - used by React Native for performance timing
            NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategorySystemBootTime",
            NSPrivacyAccessedAPITypeReasons: ["35F9.1"]
          },
          {
            // File timestamp API - used for file operations
            NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryFileTimestamp",
            NSPrivacyAccessedAPITypeReasons: ["C617.1"]
          }
        ]
      },
      infoPlist: {
        UIBackgroundModes: ["audio"],
        // Clear, specific permission descriptions improve App Store approval rates
        NSCameraUsageDescription: "SongStreak needs camera access to take a photo for your profile picture.",
        NSPhotoLibraryUsageDescription: "SongStreak needs access to your photos to set your profile picture.",
        NSMicrophoneUsageDescription: "SongStreak uses the microphone for the guitar tuner and recording practice sessions.",
        ITSAppUsesNonExemptEncryption: false,
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: [
              "com.googleusercontent.apps.669073219812-jm3blji91bj03ifr033l1g2sv2mvuumh"
            ]
          }
        ]
      }
    },
    android: {
      package: "com.songstreak.app",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#000000"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK"
      ]
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-apple-authentication",
      "@react-native-google-signin/google-signin",
      [
        "expo-image-picker",
        {
          photosPermission: "Allow SongStreak to access your photos to set your profile picture."
        }
      ],
      "expo-audio",
      [
        "react-native-audio-api",
        {
          iosBackgroundMode: true
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "b230cef4-db91-4c02-b031-8d7183f8693a"
      },
      // Expose environment variables for runtime access
      // These will be read from EAS secrets during build
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      geminiApiUrl: process.env.EXPO_PUBLIC_GEMINI_API_URL,
      geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
      googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    }
  }
};
