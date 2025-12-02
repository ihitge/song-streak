import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Canvas, Box, BoxShadow, rrect, rect, LinearGradient, vec } from '@shopify/react-native-skia';
import { Colors } from '@/constants/Colors';
import type { GangSwitchProps } from '@/types/filters';

const BUTTON_HEIGHT = 36;
const WELL_HEIGHT = 48; // Match FrequencyTuner height
const BORDER_RADIUS = 6;

export const GangSwitch = <T extends string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
  orientation = 'horizontal',
  showIcons = false,
  equalWidth = true,
}: GangSwitchProps<T>) => {
  const handlePress = (optValue: T) => {
    if (disabled) return;
    // Toggle behavior: if already active, deselect (null), otherwise select
    if (value === optValue) {
      onChange(null as unknown as T);
    } else {
      onChange(optValue);
    }
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* The Housing (Well) */}
      <View style={styles.wellContainer}>
        {/* Skia Well Background */}
        <View style={styles.wellBackground}>
          <Canvas style={StyleSheet.absoluteFill}>
            <Box
              box={rrect(rect(0, 0, 200, WELL_HEIGHT), 8, 8)}
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
                      box={rrect(rect(0, 0, 100, BUTTON_HEIGHT), BORDER_RADIUS, BORDER_RADIUS)}
                      color={isActive ? Colors.charcoal : Colors.softWhite}
                    >
                      {!isActive ? (
                        <>
                          {/* Raised appearance */}
                          <BoxShadow dx={0} dy={2} blur={3} color="rgba(0,0,0,0.15)" />
                          <BoxShadow dx={0} dy={-1} blur={1} color="rgba(255,255,255,0.8)" />
                          <LinearGradient
                            start={vec(0, 0)}
                            end={vec(0, BUTTON_HEIGHT)}
                            colors={[Colors.softWhite, Colors.matteFog]}
                          />
                        </>
                      ) : (
                        /* Pressed/active appearance */
                        <BoxShadow dx={1} dy={1} blur={3} color="rgba(0,0,0,0.4)" inner />
                      )}
                    </Box>
                  </Canvas>

                  {/* Button Label */}
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
    flex: 1,
    gap: 6,
  },
  label: {
    fontSize: 9,
    fontFamily: 'LexendDecaSemiBold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: Colors.graphite,
  },
  wellContainer: {
    position: 'relative',
    height: WELL_HEIGHT,
    borderRadius: 8,
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
  },
  buttonCap: {
    height: BUTTON_HEIGHT,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -1 }],
    position: 'relative',
    overflow: 'hidden',
  },
  buttonCapActive: {
    transform: [{ translateY: 1 }],
  },
  buttonLabel: {
    fontSize: 8,
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
});
