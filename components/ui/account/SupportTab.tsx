import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { Colors } from '@/constants/Colors';
import { HelpCircle, Shield, FileText, Info, LogOut, ChevronRight, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';
import { useSignOut } from '@/hooks/useSignOut';
import { useClickSound } from '@/hooks/useClickSound';
import { useAccountDeletion } from '@/hooks/useAccountDeletion';

interface SupportRowProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}

const SupportRow: React.FC<SupportRowProps> = ({ icon, label, onPress, isLast }) => {
  const { playSound } = useClickSound();

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowBorder,
        pressed && styles.rowPressed,
      ]}
      onPress={handlePress}
    >
      <View style={styles.rowLeft}>
        {icon}
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <ChevronRight size={18} color={Colors.graphite} />
    </Pressable>
  );
};

export const SupportTab: React.FC = () => {
  const { handleSignOut } = useSignOut();
  const { playSound } = useClickSound();
  const { deleteAccount, isDeleting } = useAccountDeletion();
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const handleHelpPress = () => {
    // Placeholder - would open help/FAQ
    console.log('Help pressed');
  };

  const handlePrivacyPress = () => {
    Linking.openURL('https://www.songstreak.app/privacy');
  };

  const handleTermsPress = () => {
    Linking.openURL('https://www.songstreak.app/terms');
  };

  const handleDeleteAccountPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await playSound();
    deleteAccount();
  };

  const handleAboutPress = () => {
    // Placeholder - would show about info
    console.log('About pressed');
  };

  const handleSignOutPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await playSound();
    handleSignOut();
  };

  return (
    <View style={styles.container}>
      {/* Support Links */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>HELP & INFO</Text>
        <View style={styles.card}>
          <SupportRow
            icon={<HelpCircle size={20} color={Colors.charcoal} />}
            label="Help & FAQ"
            onPress={handleHelpPress}
          />
          <SupportRow
            icon={<Shield size={20} color={Colors.charcoal} />}
            label="Privacy Policy"
            onPress={handlePrivacyPress}
          />
          <SupportRow
            icon={<FileText size={20} color={Colors.charcoal} />}
            label="Terms of Service"
            onPress={handleTermsPress}
          />
          <SupportRow
            icon={<Info size={20} color={Colors.charcoal} />}
            label="About"
            onPress={handleAboutPress}
            isLast
          />
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, styles.dangerLabel]}>DANGER ZONE</Text>
        <View style={styles.card}>
          <SupportRow
            icon={<Trash2 size={20} color={Colors.vermilion} />}
            label={isDeleting ? 'Deleting...' : 'Delete Account'}
            onPress={handleDeleteAccountPress}
            isLast
          />
        </View>
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionLabel}>VERSION</Text>
        <Text style={styles.versionText}>{appVersion}</Text>
      </View>

      {/* Sign Out Button */}
      <View style={styles.signOutContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.signOutButtonPressed,
          ]}
          onPress={handleSignOutPress}
        >
          <LogOut size={18} color={Colors.softWhite} />
          <Text style={styles.signOutText}>SIGN OUT</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
    gap: 24,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.warmGray,
    letterSpacing: 2,
    marginLeft: 4,
  },
  dangerLabel: {
    color: Colors.vermilion,
  },
  card: {
    backgroundColor: Colors.alloy,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  rowPressed: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    fontSize: 14,
    fontFamily: 'LexendDecaRegular',
    color: Colors.ink,
  },
  versionContainer: {
    alignItems: 'center',
    gap: 4,
  },
  versionLabel: {
    fontSize: 9,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.warmGray,
    letterSpacing: 2,
  },
  versionText: {
    fontSize: 12,
    fontFamily: 'LexendDecaRegular',
    color: Colors.graphite,
  },
  signOutContainer: {
    marginTop: 'auto',
    paddingTop: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.charcoal,
    borderRadius: 8,
    paddingVertical: 14,
    gap: 8,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  signOutButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  signOutText: {
    fontSize: 12,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.softWhite,
    letterSpacing: 2,
  },
});
