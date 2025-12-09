import React from 'react';
import { Slot } from 'expo-router'; // Only Slot needed
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TactileNavbar } from '@/components/ui/TactileNavbar';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Slot />
      </SafeAreaView>
      <TactileNavbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.matteFog,
  },
  safeArea: {
    flex: 1, // Ensure SafeAreaView takes up all available space
  },
});