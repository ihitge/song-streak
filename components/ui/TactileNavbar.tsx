import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavButton } from './NavButton';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, usePathname } from 'expo-router';
import { Colors } from '@/constants/Colors';

// Define the navigation items
interface NavItem {
  name: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  route: string; // Add route property
}

const navItems: NavItem[] = [
  { name: 'songs', icon: 'music', label: 'Songs', route: '/' },
  { name: 'tuner', icon: 'bullseye', label: 'Tuner', route: '/tuner' },
  { name: 'metronome', icon: 'play', label: 'Metronome', route: '/timing' },
  { name: 'streaks', icon: 'bolt', label: 'Streaks', route: '/streaks' },
  { name: 'ideas', icon: 'microphone', label: 'Ideas', route: '/ideas' },
];

export const TactileNavbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.chassis, { paddingBottom: 12 + insets.bottom }]}>
      {navItems.map((item) => (
        <NavButton
          key={item.name}
          iconName={item.icon}
          label={item.label}
          isActive={pathname === item.route || (item.route === '/' && pathname === '/')}
          onPress={() => router.push(item.route as any)}
          compact
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  chassis: {
    backgroundColor: Colors.matteFog,
    // Subtle drop shadow upwards
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5, // For Android
    flexDirection: 'row', // Flexbox
    justifyContent: 'space-around', // items centered and spaced evenly
    alignItems: 'center', // Center vertically
    paddingHorizontal: 4,
    paddingVertical: 10, // Reduced for compact 5-tab layout
  },
});
