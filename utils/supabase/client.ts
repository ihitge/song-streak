import { AppState, Platform } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

// Get config from expo-constants (works in EAS builds) with fallback to process.env (works in dev)
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

// Debug logging for builds - will help diagnose issues
if (__DEV__) {
  console.log('[Supabase] Config source:', Constants.expoConfig?.extra?.supabaseUrl ? 'expo-constants' : 'process.env');
  console.log('[Supabase] URL defined:', !!supabaseUrl);
  console.log('[Supabase] Key defined:', !!supabaseAnonKey);
}

// Runtime validation - prevent crashes with clear error
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] CRITICAL: Missing Supabase configuration!');
  console.error('[Supabase] supabaseUrl:', supabaseUrl ? 'SET' : 'MISSING');
  console.error('[Supabase] supabaseAnonKey:', supabaseAnonKey ? 'SET' : 'MISSING');
  console.error('[Supabase] Constants.expoConfig?.extra:', JSON.stringify(Constants.expoConfig?.extra, null, 2));
}

// Check if we're in a browser environment (not SSR)
const isBrowser = typeof window !== 'undefined'

// Use a memory-based storage for SSR, AsyncStorage for client
const getStorage = () => {
  if (!isBrowser) {
    // SSR: use a simple in-memory storage that does nothing
    return {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    }
  }
  return AsyncStorage
}

// Provide fallback values to prevent crash (will fail gracefully on API calls)
const safeSupabaseUrl = supabaseUrl || 'https://placeholder.supabase.co'
const safeSupabaseAnonKey = supabaseAnonKey || 'placeholder-key'

export const supabase = createClient(safeSupabaseUrl, safeSupabaseAnonKey, {
  auth: {
    storage: getStorage(),
    autoRefreshToken: isBrowser,
    persistSession: isBrowser,
    detectSessionInUrl: false,
  },
})

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
if (isBrowser && Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  })
}
