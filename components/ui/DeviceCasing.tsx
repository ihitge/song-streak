import React, { ReactNode } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import { MatteNoiseOverlay } from './MatteNoiseOverlay';
import { IndustrialScrewHoles } from './IndustrialScrewHoles';
import { IndustrialTitleBar } from './IndustrialTitleBar';

interface DeviceCasingProps {
  /**
   * Title displayed in the industrial title bar
   */
  title: string;
  /**
   * Content to render inside the casing
   */
  children: ReactNode;
  /**
   * Whether to show the title bar (default: true)
   */
  showTitle?: boolean;
}

/**
 * Universal dark "device screen" casing component
 *
 * Provides the industrial equipment aesthetic with:
 * - Dark ink background
 * - Matte noise texture overlay
 * - Industrial screw holes in all 4 corners
 * - Industrial title bar with circle motifs
 * - Rounded corners on web (Game Boy style)
 *
 * Usage:
 * <DeviceCasing title="METRONOME">
 *   <YourContent />
 * </DeviceCasing>
 */
export const DeviceCasing: React.FC<DeviceCasingProps> = ({
  title,
  children,
  showTitle = true,
}) => {
  return (
    <View style={styles.container}>
      <MatteNoiseOverlay />
      <IndustrialScrewHoles />
      {showTitle && <IndustrialTitleBar title={title} />}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ink,
    borderRadius: Platform.OS === 'web' ? 16 : undefined,
    overflow: Platform.OS === 'web' ? 'hidden' : undefined,
  },
});

export default DeviceCasing;
