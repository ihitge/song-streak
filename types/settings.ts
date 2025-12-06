/**
 * App Settings Types
 * Used for user preferences that persist across sessions
 */

export interface AppSettings {
  /** Dark mode preference (saved for future theme switching) */
  darkMode: boolean;
  /** Controls whether UI sounds are played */
  soundEnabled: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  soundEnabled: true,
};
