import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { GangSwitch } from '@/components/ui/filters/GangSwitch';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProfileTab } from '@/components/ui/account/ProfileTab';
import { SettingsTab } from '@/components/ui/account/SettingsTab';
import { BillingTab } from '@/components/ui/account/BillingTab';
import { SupportTab } from '@/components/ui/account/SupportTab';
import { User, Settings, CreditCard, HelpCircle } from 'lucide-react-native';
import { FilterOption } from '@/types/filters';

type AccountTab = 'profile' | 'settings' | 'billing' | 'support';

const TAB_OPTIONS: FilterOption<AccountTab>[] = [
  { value: 'profile', label: 'PROFILE', icon: User },
  { value: 'settings', label: 'SETTINGS', icon: Settings },
  { value: 'billing', label: 'BILLING', icon: CreditCard },
  { value: 'support', label: 'SUPPORT', icon: HelpCircle },
];

export default function AccountScreen() {
  const [activeTab, setActiveTab] = useState<AccountTab>('profile');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'settings':
        return <SettingsTab />;
      case 'billing':
        return <BillingTab />;
      case 'support':
        return <SupportTab />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <PageHeader subtitle="ACCOUNT" />

      <View style={styles.content}>
        <GangSwitch
          label="SECTIONS"
          value={activeTab}
          onChange={(val) => val && setActiveTab(val)}
          options={TAB_OPTIONS}
          allowDeselect={false}
        />

        <ScrollView
          style={styles.tabContentScroll}
          contentContainerStyle={styles.tabContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.tabContent}>
            {renderTabContent()}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.matteFog,
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 24,
  },
  tabContentScroll: {
    flex: 1,
  },
  tabContentContainer: {
    flexGrow: 1,
  },
  tabContent: {
    flex: 1,
    backgroundColor: Colors.softWhite,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    minHeight: 300,
  },
});
