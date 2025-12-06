import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Canvas, Box, BoxShadow, rrect, rect, LinearGradient, vec } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useGangSwitchSound } from '@/hooks/useGangSwitchSound';
import type { GangSwitchProps } from '@/types/filters';

const BUTTON_HEIGHT = 32; // Increased from 28
const WELL_HEIGHT = 44; // Increased from 38
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
}: GangSwitchProps<T>) => {
  const [wellWidth, setWellWidth] = useState(200);
  const { playSound } = useGangSwitchSound();

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
        onChange(null as unknown as T);
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
                        {React.createElement(opt.icon, {
                          size: 18,
                          color: isActive ? Colors.softWhite : Colors.charcoal,
                        })}
                      </View>
                    )}

                    {/* Label */}
                    <Text style={[styles.buttonLabel, isActive && styles.buttonLabelActive]}>
                      {opt.label}
                    </Text>

                    {/* LED Indicator */}
                    {isActive && (
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
  label: {
    fontSize: 9,
    fontFamily: 'LexendDecaSemiBold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: Colors.warmGray,
  },
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
    top: 4,
    right: 4,
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
    zIndex: 1,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
