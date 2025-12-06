import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { GangSwitch } from '@/components/ui/filters/GangSwitch';
import { useSettings } from '@/hooks/useSettings';
import { FilterOption } from '@/types/filters';

type ToggleValue = 'on' | 'off';

const TOGGLE_OPTIONS: FilterOption<ToggleValue>[] = [
  { value: 'off', label: 'OFF' },
  { value: 'on', label: 'ON' },
];

export const SettingsTab: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  const handleDarkModeChange = (value: ToggleValue | null) => {
    if (value) {
      updateSettings({ darkMode: value === 'on' });
    }
  };

  const handleSoundChange = (value: ToggleValue | null) => {
    if (value) {
      updateSettings({ soundEnabled: value === 'on' });
    }
  };

  return (
    <View style={styles.container}>
      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>APPEARANCE</Text>
        <View style={styles.sectionContent}>
          <GangSwitch
            label="DARK MODE"
            value={settings.darkMode ? 'on' : 'off'}
            onChange={handleDarkModeChange}
            options={TOGGLE_OPTIONS}
            allowDeselect={false}
          />
          <Text style={styles.hint}>
            Dark mode preference is saved for future theme support
          </Text>
        </View>
      </View>

      {/* Audio Section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>AUDIO</Text>
        <View style={styles.sectionContent}>
          <GangSwitch
            label="UI SOUNDS"
            value={settings.soundEnabled ? 'on' : 'off'}
            onChange={handleSoundChange}
            options={TOGGLE_OPTIONS}
            allowDeselect={false}
          />
          <Text style={styles.hint}>
            Toggle click sounds and audio feedback
          </Text>
        </View>
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
  sectionContent: {
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
  hint: {
    fontSize: 11,
    fontFamily: 'LexendDecaRegular',
    color: Colors.graphite,
    marginTop: 4,
  },
});
