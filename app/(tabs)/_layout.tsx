import React from 'react';
import { Slot } from 'expo-router'; // Import Slot from expo-router
import { View, StyleSheet } from 'react-native';
import { TactileNavbar } from '@/components/ui/TactileNavbar'; // Import your new navbar component
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';


export default function TabLayout() {
  const colorScheme = useColorScheme(); // Retain if used elsewhere or for context

  return (
    <View style={styles.container}>
      <Slot />
      <TactileNavbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // Ensure background is set
  },
});