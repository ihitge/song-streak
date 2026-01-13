export const Colors = {
  // Design System - "Matte Fog" palette
  matteFog: '#E4DFDA',       // Chassis (Base) - Warm Bone/Concrete
  softWhite: '#f0f0f0',      // Surface (Inset)
  charcoal: '#333333',       // Control (Dark)
  alloy: '#d6d6d6',         // Control (Light)
  vermilion: '#EE6C4D',      // Action (Hero)
  vermilionDark: '#d04620',  // Action (Hero) - Pressed/Gradient End
  ink: '#221E22',           // Text (Primary) - Off-Black
  graphite: '#888888',       // Text (Label)
  graphiteDark: '#666666',   // Text (Label) - Pressed State
  moss: '#417B5A',           // Success/Easy (Green)
  lobsterPink: '#DB5461',    // Accent/Highlight (Lobster Pink)
  warning: '#D4A017',        // Warning/Caution (Gold)
  /** @deprecated Use Colors.charcoal instead */
  deepSpaceBlue: '#0E273C',  // DEPRECATED - Use charcoal instead
  warmGray: '#847577',       // Secondary Text (Warm Gray)

  // Interactive States
  capPressed: '#e6e6e6',     // NavButton cap when pressed/active
  rimHighlight: '#ffffff',   // FAB border ring highlight

  // Shadow Opacity Tokens (use with rgba)
  shadows: {
    xs: 'rgba(0,0,0,0.05)',
    sm: 'rgba(0,0,0,0.1)',
    md: 'rgba(0,0,0,0.15)',
    lg: 'rgba(0,0,0,0.2)',
    xl: 'rgba(0,0,0,0.3)',
    overlay: 'rgba(0,0,0,0.85)',
  },

  // Highlight Opacity Tokens
  highlights: {
    sm: 'rgba(255,255,255,0.3)',
    md: 'rgba(255,255,255,0.5)',
  },

  // PRD - "Industrial Play" palette (Color Semantics)
  chassis: '#2F3136',       // Primary background
  surface: '#417B5A',       // Secondary background (PCB Green - Updated)
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