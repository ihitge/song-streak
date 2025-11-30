export const Colors = {
  // Design System - "Matte Fog" palette
  matteFog: '#e6e6e6',       // Chassis (Base)
  softWhite: '#f0f0f0',      // Surface (Inset)
  charcoal: '#333333',       // Control (Dark)
  alloy: '#d6d6d6',         // Control (Light)
  vermilion: '#ea5428',      // Action (Hero)
  ink: '#222222',           // Text (Primary)
  graphite: '#888888',       // Text (Label)

  // PRD - "Industrial Play" palette (Color Semantics)
  chassis: '#2F3136',       // Primary background
  surface: '#4A5D49',       // Secondary background (PCB Green)
  border: '#BFCAD0',        // Borders, inactive text (Aluminum Grey)
  placeholder: '#6B7580',   // Placeholder text (Grey)
  rhythm: '#FF5722',        // Play, record, metronome (Signal Orange)
  pitch: '#00AEEF',         // Tuning, edit actions (Azure Blue)
  recording: '#DCEE00',     // Primary actions, warnings (Acid Yellow)
  data: '#F4F5F0',          // Primary text (Off White)
};

// You can create different themes here, e.g., light and dark mode
export const LightThemeColors = {
  background: Colors.matteFog,
  text: Colors.ink,
  primary: Colors.vermilion,
  // Add more as needed for a complete light theme
};

export const DarkThemeColors = {
  background: Colors.chassis,
  text: Colors.data,
  primary: Colors.recording,
  // Add more as needed for a complete dark theme
};