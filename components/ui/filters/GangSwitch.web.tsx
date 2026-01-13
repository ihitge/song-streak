import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, { Easing, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Styles';
import { RefreshCw } from 'lucide-react-native';
import type { GangSwitchProps } from '@/types/filters';

const BUTTON_HEIGHT = 56;
const WELL_HEIGHT = 68;
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
  const spinValue = useSharedValue(0);

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

  const buttonWidth = (wellWidth - 12 - (options.length - 1) * 2) / options.length;

  const handlePress = async (optValue: T) => {
    if (disabled) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

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

      {/* The Housing (Well) - CSS version */}
      <View style={styles.wellContainer} onLayout={handleLayout}>
        {/* Well Background (CSS) */}
        <View style={styles.wellBackground} />

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
                {/* Button Cap (CSS) */}
                <View style={[
                  styles.buttonCap,
                  isActive ? styles.buttonCapActive : styles.buttonCapInactive,
                  { width: buttonWidth }
                ]}>
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

                    {/* LED Indicator */}
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
    backgroundColor: Colors.alloy,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  buttonsRow: {
    flex: 1,
    padding: 6,
    gap: 2,
  },
  buttonWrapper: {
    minWidth: 40,
    height: '100%',
  },
  buttonCap: {
    height: BUTTON_HEIGHT,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  buttonCapInactive: {
    backgroundColor: Colors.softWhite,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
  },
  buttonCapActive: {
    backgroundColor: Colors.charcoal,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
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
