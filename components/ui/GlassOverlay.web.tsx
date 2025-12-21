import React from 'react';

interface GlassOverlayProps {
  width: number;
  height: number;
  borderRadius?: number;
  glareOpacity?: number;
  specularOpacity?: number;
  variant?: 'light' | 'dark';
}

/**
 * GlassOverlay (Web) - No-op for web build.
 * Glass effects are stripped from web to keep clean UI with basic styling.
 * Native app retains full Skia-based glass effects.
 */
export const GlassOverlay: React.FC<GlassOverlayProps> = () => null;
