import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.recording, // Acid Yellow for active
        tabBarInactiveTintColor: Colors.border, // Aluminum Grey for inactive
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.chassis, // Primary background (Matte Slate)
          borderTopWidth: 2,
          borderTopColor: Colors.border,
        }
      }}>
      <Tabs.Screen
        name="practice"
        options={{
          title: 'PRACTICE STREAK',
          tabBarIcon: ({ color }) => <TabBarIcon name="clock-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'SET LIST',
          tabBarIcon: ({ color }) => <TabBarIcon name="music" color={color} />,
        }}
      />
      <Tabs.Screen
        name="timing"
        options={{
          title: 'TIMING MACHINE',
          tabBarIcon: ({ color }) => <TabBarIcon name="tachometer" color={color} />,
        }}
      />
    </Tabs>
  );
}