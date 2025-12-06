import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LogOut } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter, usePathname } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Styles';
import { useSignOut } from '@/hooks/useSignOut';
import { useClickSound } from '@/hooks/useClickSound';
import { useAuth } from '@/ctx/AuthContext';

interface PageHeaderProps {
  subtitle: string;
  children?: ReactNode;
}

/**
 * Helper to extract initials from email
 */
const getInitials = (email?: string | null): string => {
  if (!email) return '??';
  const name = email.split('@')[0];
  const parts = name.split(/[._-]/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase();
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  subtitle,
  children,
}) => {
  const { handleSignOut } = useSignOut();
  const { playSound } = useClickSound();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const initials = getInitials(user?.email);
  const isOnAccountPage = pathname === '/account';

  const handleAvatarPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    // Navigate to account page if not already there
    if (!isOnAccountPage) {
      router.push('/account');
    }
  };

  const handleLogoutPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    handleSignOut();
  };

  return (
    <View style={styles.chassis}>
      {/* Top Bar (Branding & User) */}
      <View style={styles.topBar}>
        {/* Left */}
        <View>
          <Text style={styles.h1Title}>SongStreak</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {/* Right (Controls) */}
        <View style={styles.topBarControls}>
          {/* User Avatar */}
          <Pressable style={styles.avatarButton} onPress={handleAvatarPress}>
            <Text style={styles.avatarText}>{initials}</Text>
          </Pressable>
          {/* Logout */}
          <Pressable style={styles.logoutButton} onPress={handleLogoutPress}>
            <LogOut size={20} color={Colors.charcoal} />
          </Pressable>
        </View>
      </View>

      {/* Optional children (e.g., filter deck) */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  chassis: {
    backgroundColor: Colors.matteFog,
    paddingBottom: 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
  },
  h1Title: Typography.appLogo,
  subtitle: Typography.pageSubtitle,
  topBarControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.alloy,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#c0c0c0',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.charcoal,
  },
  logoutButton: {
    padding: 6,
  },
});
