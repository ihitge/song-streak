import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { CreditCard } from 'lucide-react-native';

export const BillingTab: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Current Plan */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>CURRENT PLAN</Text>
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Free Plan</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ACTIVE</Text>
            </View>
          </View>
          <Text style={styles.planDescription}>
            Basic access to song tracking and practice features
          </Text>
        </View>
      </View>

      {/* Coming Soon */}
      <View style={styles.comingSoonContainer}>
        <View style={styles.iconContainer}>
          <CreditCard size={32} color={Colors.graphite} />
        </View>
        <Text style={styles.comingSoonTitle}>Premium Plans Coming Soon</Text>
        <Text style={styles.comingSoonText}>
          Unlock advanced features, unlimited songs, and more with our upcoming
          premium subscription plans.
        </Text>
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
  planCard: {
    backgroundColor: Colors.alloy,
    borderRadius: 8,
    padding: 16,
    gap: 8,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 16,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.ink,
  },
  badge: {
    backgroundColor: Colors.moss,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.softWhite,
    letterSpacing: 1,
  },
  planDescription: {
    fontSize: 12,
    fontFamily: 'LexendDecaRegular',
    color: Colors.warmGray,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.alloy,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  comingSoonTitle: {
    fontSize: 16,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.ink,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 13,
    fontFamily: 'LexendDecaRegular',
    color: Colors.graphite,
    textAlign: 'center',
    lineHeight: 20,
  },
});
