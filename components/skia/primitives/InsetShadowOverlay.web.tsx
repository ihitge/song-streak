import React from 'react';

interface InsetShadowOverlayProps {
  width: number;
  height: number;
  borderRadius?: number;
  insetDepth?: number;
  shadowIntensity?: number;
  variant?: 'light' | 'dark';
}

/**
 * InsetShadowOverlay (Web) - No-op for web build.
 * Glass effects are stripped from web to keep clean UI with basic styling.
 * Native app retains full Skia-based glass effects.
 */
export const InsetShadowOverlay: React.FC<InsetShadowOverlayProps> = () => null;
