import { useSettingsContext } from '@/ctx/SettingsContext';

/**
 * Convenience hook for accessing app settings
 * Provides settings state and update function
 */
export function useSettings() {
  const { settings, updateSettings, isLoading } = useSettingsContext();

  const toggleDarkMode = async () => {
    await updateSettings({ darkMode: !settings.darkMode });
  };

  const toggleSound = async () => {
    await updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  return {
    settings,
    updateSettings,
    isLoading,
    // Convenience toggles
    toggleDarkMode,
    toggleSound,
    // Direct accessors
    darkMode: settings.darkMode,
    soundEnabled: settings.soundEnabled,
  };
}
