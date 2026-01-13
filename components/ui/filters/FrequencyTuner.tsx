import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Canvas, Box, BoxShadow, rrect, rect, LinearGradient, vec, Line, Fill } from '@shopify/react-native-skia';
import Animated from 'react-native-reanimated';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Styles';
import { EnterFromRight, ExitToLeft, EnterFromLeft, ExitToRight, FadeIn, FadeOut } from '@/constants/Animations';
import { GlassOverlay } from '@/components/ui/GlassOverlay';
import { InsetShadowOverlay, SurfaceTextureOverlay } from '@/components/skia/primitives';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { FrequencyTunerProps } from '@/types/filters';

type TunerVariant = 'dark' | 'light';

const TUNER_HEIGHT = 44; // Increased from 38px


export const FrequencyTuner = <T extends string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
  showValueLabel = true,
  size = 'standard',
  variant = 'dark',
  showGlassOverlay = false,
  labelColor,
  height: customHeight,
}: FrequencyTunerProps<T> & { variant?: TunerVariant; showGlassOverlay?: boolean; labelColor?: string }) => {
  const prefersReducedMotion = useReducedMotion();
  const [width, setWidth] = useState(200); // default fallback
  const [direction, setDirection] = useState(1); // 1 = Next (Slide Left), -1 = Prev (Slide Right)
  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const currentOption = options[selectedIndex];
  const height = customHeight ?? (size === 'compact' ? 40 : TUNER_HEIGHT);

  // Variant-specific colors
  const isDark = variant === 'dark';
  const backgroundColor = isDark ? Colors.charcoal : Colors.softWhite;
  const innerShadowColor = isDark ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.40)';
  const outerHighlightColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,1)';
  const scaleMarkingColor = isDark ? 'rgba(255,255,255,0.2)' : Colors.charcoal;
  const glassGradientColors = isDark
    ? ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0)']
    : ['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)'];
  const textColor = isDark ? '#e0e0e0' : Colors.charcoal;
  const textShadowColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)';
  const chevronColor = isDark ? Colors.graphite : Colors.charcoal;
  const innerRingColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const cycle = async (dir: number) => {
    if (disabled) return;

    setDirection(dir);

    let nextIndex = selectedIndex + dir;
    if (nextIndex < 0) nextIndex = options.length - 1;
    if (nextIndex >= options.length) nextIndex = 0;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(options[nextIndex].value);
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={[styles.label, labelColor && { color: labelColor }]}>{label}</Text>

      {/* Tuner Window */}
      <View style={[styles.tunerWindow, { height }]} onLayout={handleLayout}>
        {/* Background with inset shadows */}
        <Canvas style={StyleSheet.absoluteFill}>
          <Box
            box={rrect(rect(0, 0, width, height), 6, 6)}
            color={backgroundColor}
          >
            <BoxShadow dx={0} dy={2} blur={6} color={innerShadowColor} inner />
            <BoxShadow dx={0} dy={-1} blur={2} color={outerHighlightColor} />
          </Box>

          {/* Scale markings at bottom */}
          {[...Array(10)].map((_, i) => {
            const spacing = (width - 40) / 9;
            return (
              <Line
                key={i}
                p1={vec(20 + i * spacing, height - 8)}
                p2={vec(20 + i * spacing, height - 4)}
                color={scaleMarkingColor}
                strokeWidth={1}
              />
            );
          })}

          {/* Orange hairline indicator - centered */}
          <Line
            p1={vec(width / 2, 4)}
            p2={vec(width / 2, height - 4)}
            color={Colors.vermilion}
            strokeWidth={1.5}
          />
        </Canvas>

        {/* Glass overlay gradient */}
        <View style={styles.glassOverlay}>
          <Canvas style={StyleSheet.absoluteFill}>
            <Box box={rrect(rect(0, 0, width, height / 2), 0, 0)}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, height / 2)}
                colors={glassGradientColors}
              />
            </Box>
          </Canvas>
        </View>

        {/* Controls Row */}
        <View style={styles.controlsRow}>
          {/* Left chevron */}
          <Pressable
            onPress={() => cycle(-1)}
            style={styles.chevronButton}
            disabled={disabled}
            accessibilityLabel={`Previous ${label.toLowerCase()}`}
            accessibilityRole="button"
            accessibilityHint={`Select previous option for ${label.toLowerCase()}`}
          >
            <ChevronLeft size={14} color={chevronColor} accessibilityElementsHidden={true} />
          </Pressable>

          {/* Value display */}
          <View style={styles.valueContainer}>
            <Animated.View
                key={value} // Trigger animation on value change
                entering={prefersReducedMotion ? FadeIn : (direction > 0 ? EnterFromRight : EnterFromLeft)}
                exiting={prefersReducedMotion ? FadeOut : (direction > 0 ? ExitToLeft : ExitToRight)}
                style={styles.textWrapper}
            >
                <Text style={[styles.valueText, { color: textColor, textShadowColor }]}>
                {currentOption?.label || value}
                </Text>
            </Animated.View>
          </View>

          {/* Right chevron */}
          <Pressable
            onPress={() => cycle(1)}
            style={styles.chevronButton}
            disabled={disabled}
            accessibilityLabel={`Next ${label.toLowerCase()}`}
            accessibilityRole="button"
            accessibilityHint={`Select next option for ${label.toLowerCase()}`}
          >
            <ChevronRight size={14} color={chevronColor} accessibilityElementsHidden={true} />
          </Pressable>
        </View>

        {/* Inner ring/border effect */}
        <View style={[styles.innerRing, { borderColor: innerRingColor }]} pointerEvents="none" />

        {/* Optional enhanced overlays for realism */}
        {showGlassOverlay && (
          <>
            {/* Layer 1: Inset shadow for recessed depth */}
            <InsetShadowOverlay
              width={width}
              height={height}
              borderRadius={6}
              insetDepth={6}
              shadowIntensity={0.9}
              variant={variant}
            />
            {/* Layer 2: Glass overlay */}
            <GlassOverlay
              width={width}
              height={height}
              borderRadius={6}
              glareOpacity={0.2}
              specularOpacity={0.3}
              variant={variant}
            />
            {/* Layer 3: Surface texture for dust/scratches */}
            <SurfaceTextureOverlay
              width={width}
              height={height}
              borderRadius={6}
              textureOpacity={0.03}
              variant={variant}
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
    width: '100%',
  },
  label: {
    ...Typography.label,
    textAlign: 'left',
  },
  tunerWindow: {
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    pointerEvents: 'none',
  },
  controlsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    zIndex: 10,
  },
  chevronButton: {
    padding: 4,
    opacity: 0.6,
  },
  valueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 10,
    fontFamily: 'LexendDecaBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#e0e0e0',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  innerRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    pointerEvents: 'none',
  },
  textWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
  },
});
