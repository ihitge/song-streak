/**
 * Expo configuration with EAS secrets support
 *
 * Environment variables set as EAS secrets will be available during
 * the build process. This config exposes them via expo.extra so they
 * can be accessed at runtime.
 */
module.exports = {
  expo: {
    name: "SongStreak",
    slug: "song-streak",
    version: "2.2.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "songstreak",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#000000"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.songstreak.app",
      buildNumber: "18",
      usesAppleSignIn: true,
      infoPlist: {
        UIBackgroundModes: ["audio"],
        NSCameraUsageDescription: "SongStreak needs camera access to take a photo for your profile picture.",
        NSPhotoLibraryUsageDescription: "SongStreak needs access to your photos to set your profile picture.",
        NSMicrophoneUsageDescription: "SongStreak uses the microphone for audio features during practice sessions.",
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
