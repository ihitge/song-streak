import React from 'react';

interface SurfaceTextureOverlayProps {
  width: number;
  height: number;
  borderRadius?: number;
  textureOpacity?: number;
  variant?: 'light' | 'dark';
}

/**
 * SurfaceTextureOverlay (Web) - No-op for web build.
 * Glass effects are stripped from web to keep clean UI with basic styling.
 * Native app retains full Skia-based glass effects.
 */
export const SurfaceTextureOverlay: React.FC<SurfaceTextureOverlayProps> = () => null;
