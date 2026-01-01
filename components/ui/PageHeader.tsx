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
        </View>

        {/* Right (Controls) */}
        <View style={styles.topBarControls}>
          {/* User Avatar */}
          <Pressable
            style={styles.avatarButton}
            onPress={handleAvatarPress}
            accessibilityLabel="Profile settings"
            accessibilityRole="button"
            accessibilityHint="Opens your account settings"
          >
            <Text style={styles.avatarText} accessibilityElementsHidden={true}>{initials}</Text>
          </Pressable>
          {/* Logout */}
          <Pressable
            style={styles.logoutButton}
            onPress={handleLogoutPress}
            accessibilityLabel="Sign out"
            accessibilityRole="button"
            accessibilityHint="Signs you out of the app"
          >
            <LogOut size={20} color={Colors.charcoal} accessibilityElementsHidden={true} />
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
  topBarControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarButton: {
    width: 44, // Minimum 44pt for touch targets (Apple HIG)
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.alloy,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.alloy,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.charcoal,
  },
  logoutButton: {
    padding: 12, // Larger padding for 44pt minimum touch target
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
