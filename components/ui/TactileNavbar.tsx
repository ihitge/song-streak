import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavButton } from './NavButton';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, usePathname } from 'expo-router';

// Define the navigation items
interface NavItem {
  name: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  route: string; // Add route property
}

const navItems: NavItem[] = [
  { name: 'streak', icon: 'bolt', label: 'Streak', route: '/practice' },
  { name: 'set-list', icon: 'list', label: 'Set List', route: '/' },
  { name: 'metronome', icon: 'play', label: 'Metronome', route: '/timing' },
];

export const TactileNavbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.chassis}>
      {navItems.map((item) => (
        <NavButton
          key={item.name}
          iconName={item.icon}
          label={item.label}
          isActive={pathname === item.route || (item.route === '/' && pathname === '/')}
          onPress={() => router.push(item.route)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  chassis: {
    height: 128, // h-32 (128px)
    backgroundColor: '#e6e6e6', // Matte Fog
    borderTopWidth: 1,
    borderTopColor: 'white', // 1px white top border
    // Subtle drop shadow upwards
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5, // For Android
    flexDirection: 'row', // Flexbox
    justifyContent: 'space-around', // items centered and spaced evenly
    alignItems: 'center', // Center vertically
    paddingHorizontal: 10,
  },
});
