import React, { useMemo } from 'react';
import { Canvas, Group, Rect, LinearGradient, vec, rrect, rect } from '@shopify/react-native-skia';

interface InsetShadowOverlayProps {
  width: number;
  height: number;
  borderRadius?: number;
  insetDepth?: number;
  shadowIntensity?: number;
  variant?: 'light' | 'dark';
}

/**
 * Creates recessed depth effect via edge gradients.
 * Simulates a bezel casting shadow onto the content surface.
 *
 * Layer order: This should be rendered BELOW GlassOverlay
 * (shadow is cast onto the surface, not on top of glass)
 */
export const InsetShadowOverlay = React.memo<InsetShadowOverlayProps>(({
  width,
  height,
  borderRadius = 6,
  insetDepth = 8,
  shadowIntensity = 1.0,
  variant = 'light',
}) => {
  const isDark = variant === 'dark';

  // Memoize gradient colors to prevent recreation on each render
  const gradients = useMemo(() => {
    const topOpacity = 0.35 * shadowIntensity;
    const leftOpacity = 0.25 * shadowIntensity;
    // Dark variant needs stronger highlights to be visible on dark backgrounds
    const bottomHighlight = (isDark ? 0.25 : 0.15) * shadowIntensity;
    const rightHighlight = (isDark ? 0.15 : 0.08) * shadowIntensity;

    return {
      top: [
        `rgba(0, 0, 0, ${topOpacity})`,
        `rgba(0, 0, 0, ${topOpacity * 0.4})`,
        'rgba(0, 0, 0, 0)',
      ],
      left: [
        `rgba(0, 0, 0, ${leftOpacity})`,
        `rgba(0, 0, 0, ${leftOpacity * 0.4})`,
        'rgba(0, 0, 0, 0)',
      ],
      bottom: [
        `rgba(255, 255, 255, ${bottomHighlight})`,
        `rgba(255, 255, 255, ${bottomHighlight * 0.3})`,
        'rgba(255, 255, 255, 0)',
      ],
      right: [
        `rgba(255, 255, 255, ${rightHighlight})`,
        'rgba(255, 255, 255, 0)',
      ],
    };
  }, [shadowIntensity, isDark]);

  // Memoize clipRect to avoid recreating Skia path on every render
  const clipRect = useMemo(
    () => rrect(rect(0, 0, width, height), borderRadius, borderRadius),
    [width, height, borderRadius]
  );

  return (
    <Canvas
      style={{
        width,
        height,
        position: 'absolute',
        top: 0,
        left: 0,
      }}
      pointerEvents="none"
    >
      <Group clip={clipRect}>
        {/* Top edge shadow (strongest - light blocked by bezel) */}
        <Rect x={0} y={0} width={width} height={insetDepth}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, insetDepth)}
            colors={gradients.top}
            positions={[0, 0.5, 1]}
          />
        </Rect>

        {/* Left edge shadow (secondary) */}
        <Rect x={0} y={0} width={insetDepth} height={height}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(insetDepth, 0)}
            colors={gradients.left}
            positions={[0, 0.5, 1]}
          />
        </Rect>

        {/* Bottom edge highlight (bounced light) */}
        <Rect x={0} y={height - insetDepth * 0.6} width={width} height={insetDepth * 0.6}>
          <LinearGradient
            start={vec(0, height)}
            end={vec(0, height - insetDepth * 0.6)}
            colors={gradients.bottom}
            positions={[0, 0.5, 1]}
          />
        </Rect>

        {/* Right edge subtle highlight */}
        <Rect x={width - insetDepth * 0.6} y={0} width={insetDepth * 0.6} height={height}>
          <LinearGradient
            start={vec(width, 0)}
            end={vec(width - insetDepth * 0.6, 0)}
            colors={gradients.right}
            positions={[0, 1]}
          />
        </Rect>
      </Group>
    </Canvas>
  );
});

InsetShadowOverlay.displayName = 'InsetShadowOverlay';
