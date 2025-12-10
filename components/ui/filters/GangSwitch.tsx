import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Canvas, Box, BoxShadow, rrect, rect, LinearGradient, vec } from '@shopify/react-native-skia';
import Animated, { Easing, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Styles';
import { useGangSwitchSound } from '@/hooks/useGangSwitchSound';
import { RefreshCw } from 'lucide-react-native';
import type { GangSwitchProps } from '@/types/filters';

const BUTTON_HEIGHT = 56; // Increased to accommodate icon + label with padding
const WELL_HEIGHT = 68; // Increased to match button height with padding
const BORDER_RADIUS = 4;

export const GangSwitch = <T extends string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
  orientation = 'horizontal',
  showIcons = false,
  equalWidth = true,
  allowDeselect = true,
  loadingStates,
  dataAvailable,
}: GangSwitchProps<T>) => {
  const [wellWidth, setWellWidth] = useState(200);
  const { playSound } = useGangSwitchSound();
  const spinValue = useSharedValue(0);

  // Set up rotation animation for loading states
  useEffect(() => {
    const hasAnyLoading = options.some(opt => loadingStates?.[opt.value]);

    if (hasAnyLoading) {
      spinValue.value = withRepeat(
        withTiming(1, {
          duration: 1000,
          easing: Easing.linear,
        }),
        -1
      );
    } else {
      spinValue.value = 0;
    }
  }, [loadingStates]);

  const animatedRotate = useAnimatedStyle(() => {
    const rotation = interpolate(
      spinValue.value,
      [0, 1],
      [0, 360],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const handleLayout = (event: LayoutChangeEvent) => {
    setWellWidth(event.nativeEvent.layout.width);
  };

  // Calculate button width: (wellWidth - padding - gaps) / number of buttons
  const buttonWidth = (wellWidth - 12 - (options.length - 1) * 2) / options.length;

  const handlePress = async (optValue: T) => {
    if (disabled) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();

    // Toggle behavior: if already active, deselect (null) only if allowed, otherwise select
    if (value === optValue) {
      if (allowDeselect) {
        onChange(null);
      }
    } else {
      onChange(optValue);
    }
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* The Housing (Well) */}
      <View style={styles.wellContainer} onLayout={handleLayout}>
        {/* Skia Well Background */}
        <View style={styles.wellBackground}>
          <Canvas style={StyleSheet.absoluteFill}>
            <Box
              box={rrect(rect(0, 0, wellWidth, WELL_HEIGHT), 6, 6)}
              color={Colors.alloy}
            >
              <BoxShadow dx={2} dy={2} blur={5} color="rgba(0,0,0,0.15)" inner />
              <BoxShadow dx={-1} dy={-1} blur={3} color="rgba(255,255,255,0.5)" inner />
            </Box>
          </Canvas>
        </View>

        {/* Buttons Row */}
        <View style={[styles.buttonsRow, { flexDirection: orientation === 'horizontal' ? 'row' : 'column' }]}>
          {options.map((opt) => {
            const isActive = value === opt.value;

            return (
              <Pressable
                key={opt.value}
                onPress={() => handlePress(opt.value)}
                style={[
                  styles.buttonWrapper,
                  equalWidth && { flex: 1 },
                ]}
              >
                {/* Skia Button Cap */}
                <View style={[styles.buttonCap, isActive && styles.buttonCapActive]}>
                  <Canvas style={StyleSheet.absoluteFill}>
                    <Box
                      box={rrect(rect(0, 0, buttonWidth, BUTTON_HEIGHT), BORDER_RADIUS, BORDER_RADIUS)}
                      color={isActive ? Colors.charcoal : Colors.softWhite}
                    >
                      {!isActive ? (
                        <>
                          {/* Raised appearance */}
                          <BoxShadow dx={0} dy={2} blur={3} color="rgba(0,0,0,0.18)" />
                          <BoxShadow dx={0} dy={-1} blur={1} color="rgba(255,255,255,0.9)" />
                          <LinearGradient
                            start={vec(0, 0)}
                            end={vec(0, BUTTON_HEIGHT)}
                            colors={['#fafafa', '#d4d4d4']}
                          />
                        </>
                      ) : (
                        /* Pressed/active appearance */
                        <BoxShadow dx={1} dy={1} blur={3} color="rgba(0,0,0,0.4)" inner />
                      )}
                    </Box>
                  </Canvas>

                  {/* Button Content - Icon + Label Stack */}
                  <View style={styles.buttonContent}>
                    {/* Icon */}
                    {showIcons && opt.icon && (
                      <View style={styles.iconContainer}>
                        {loadingStates?.[opt.value] ? (
                          <Animated.View style={animatedRotate}>
                            <RefreshCw
                              size={18}
                              color={isActive ? Colors.softWhite : Colors.charcoal}
                            />
                          </Animated.View>
                        ) : (
                          React.createElement(opt.icon, {
                            size: 18,
                            color: isActive ? Colors.softWhite : Colors.charcoal,
                          })
                        )}
                      </View>
                    )}

                    {/* Label */}
                    <Text style={[styles.buttonLabel, isActive && styles.buttonLabelActive]}>
                      {opt.label}
                    </Text>

                    {/* LED Indicator - Show when data available OR when active */}
                    {(dataAvailable?.[opt.value] || isActive) && (
                      <View style={styles.ledContainer}>
                        <View style={styles.ledDot} />
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
    width: '100%',
  },
  label: Typography.label,
  wellContainer: {
    position: 'relative',
    height: WELL_HEIGHT,
    borderRadius: 6,
    overflow: 'hidden',
  },
  wellBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonsRow: {
    flex: 1,
    padding: 6,
    gap: 2,
  },
  buttonWrapper: {
    minWidth: 40,
    height: '100%', // Ensure the Pressable fills the available vertical space for a larger touch target
  },
  buttonCap: {
    height: BUTTON_HEIGHT,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  buttonCapActive: {
    // Visual pressed state achieved through color/shadow changes
  },
  buttonLabel: {
    fontSize: 10,
    fontFamily: 'LexendDecaBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.charcoal,
    zIndex: 1,
  },
  buttonLabelActive: {
    color: Colors.softWhite,
  },
  ledContainer: {
    position: 'absolute',
    top: 3,
    right: 3,
  },
  ledDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.vermilion,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    zIndex: 1,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
