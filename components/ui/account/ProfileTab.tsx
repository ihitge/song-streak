import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/ctx/AuthContext';

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

export const ProfileTab: React.FC = () => {
  const { user } = useAuth();
  const initials = getInitials(user?.email);
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Unknown';

  return (
    <View style={styles.container}>
      {/* Large Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>

      {/* User Info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>EMAIL</Text>
          <Text style={styles.value}>{user?.email || 'Not available'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>MEMBER SINCE</Text>
          <Text style={styles.value}>{memberSince}</Text>
        </View>
      </View>

      {/* Placeholder for future edit profile */}
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderText}>Profile editing coming soon</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 24,
    gap: 24,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.alloy,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#c0c0c0',
  },
  avatarText: {
    fontSize: 28,
    fontFamily: 'LexendDecaBold',
    color: Colors.charcoal,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: Colors.alloy,
    borderRadius: 8,
    padding: 16,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    paddingVertical: 8,
  },
  label: {
    fontSize: 9,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.warmGray,
    letterSpacing: 2,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontFamily: 'LexendDecaRegular',
    color: Colors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    fontFamily: 'LexendDecaRegular',
    color: Colors.graphite,
    fontStyle: 'italic',
  },
});
