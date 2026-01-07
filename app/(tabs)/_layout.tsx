import React from 'react';
import { Slot } from 'expo-router'; // Only Slot needed
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TactileNavbar } from '@/components/ui/TactileNavbar';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.contentWrapper}>
          <View style={styles.contentContainer}>
            <Slot />
          </View>
        </View>
      </SafeAreaView>
      <View style={styles.navbarWrapper}>
        <View style={styles.navbarContainer}>
          <TactileNavbar />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.matteFog,
  },
  safeArea: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
  },
  navbarWrapper: {
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
  },
  navbarContainer: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
  },
});