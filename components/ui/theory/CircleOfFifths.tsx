import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  Text as SkiaText,
  useFont,
  Circle,
  Group,
  Shadow,
  LinearGradient,
  vec,
  BlurMask,
  RadialGradient,
} from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import {
  CIRCLE_OF_FIFTHS_MAJOR,
  CIRCLE_OF_FIFTHS_MINOR,
  getCircleIndex,
  parseKey,
  getScaleNotes,
  ModeName,
  MODES,
} from '@/utils/musicTheory';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(SCREEN_WIDTH - 48, 340);
const CENTER = CIRCLE_SIZE / 2;

// Ring dimensions
const OUTER_RADIUS = CENTER - 8;
const MAJOR_RING_WIDTH = 48;
const MINOR_RING_WIDTH = 36;
const INNER_RADIUS = OUTER_RADIUS - MAJOR_RING_WIDTH;
const MINOR_INNER_RADIUS = INNER_RADIUS - MINOR_RING_WIDTH;
const CENTER_RADIUS = MINOR_INNER_RADIUS - 8;

// Colors for segments
const SEGMENT_COLORS = {
  major: {
    default: Colors.alloy,
    selected: Colors.vermilion,
    highlight: '#e8e8e8',
  },
  minor: {
    default: '#555555',
    selected: Colors.lobsterPink,
    highlight: '#666666',
  },
  bezel: Colors.charcoal,
  centerWell: '#1a1a1a',
};

interface CircleOfFifthsProps {
  selectedKey: string;
  mode?: ModeName;
  onKeySelect?: (key: string, quality: 'major' | 'minor') => void;
  size?: number;
}

export const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({
  selectedKey,
  mode = 'ionian',
  onKeySelect,
  size = CIRCLE_SIZE,
}) => {
  const font = useFont(require('@/assets/fonts/LexendDeca-Bold.ttf'), 14);
  const smallFont = useFont(require('@/assets/fonts/LexendDeca-Bold.ttf'), 11);
  const centerFont = useFont(require('@/assets/fonts/LexendDeca-Bold.ttf'), 18);

  // Parse the selected key
  const { root: selectedRoot, quality: selectedQuality } = useMemo(
    () => parseKey(selectedKey),
    [selectedKey]
  );

  // Get the index of the selected key
  const selectedIndex = useMemo(
    () => getCircleIndex(selectedRoot),
    [selectedRoot]
  );

  // Rotation state for drag gesture
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);

  // Calculate scale based on size prop
  const scale = size / CIRCLE_SIZE;
  const scaledCenter = size / 2;

  // Haptic and sound feedback
  const triggerFeedback = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Handle key selection
  const handleKeyPress = useCallback(
    (key: string, quality: 'major' | 'minor') => {
      triggerFeedback();
      onKeySelect?.(key, quality);
    },
    [onKeySelect, triggerFeedback]
  );

  // Pan gesture for rotation
  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedRotation.value = rotation.value;
    })
    .onUpdate((event) => {
      // Calculate angle from center
      const dx = event.x - scaledCenter;
      const dy = event.y - scaledCenter;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      // Calculate delta from start position
      const startDx = event.x - event.translationX - scaledCenter;
      const startDy = event.y - event.translationY - scaledCenter;
      const startAngle = Math.atan2(startDy, startDx) * (180 / Math.PI);

      const deltaAngle = angle - startAngle;
      rotation.value = savedRotation.value + deltaAngle;
    })
    .onEnd((event) => {
      // Snap to nearest 30 degree increment with spring animation
      const targetRotation = Math.round(rotation.value / 30) * 30;
      rotation.value = withSpring(targetRotation, {
        damping: 15,
        stiffness: 150,
      });
      runOnJS(triggerFeedback)();
    });

  // Tap gesture for selecting keys
  const tapGesture = Gesture.Tap().onEnd((event) => {
    const dx = event.x - scaledCenter;
    const dy = event.y - scaledCenter;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const scaledOuterRadius = OUTER_RADIUS * scale;
    const scaledInnerRadius = INNER_RADIUS * scale;
    const scaledMinorInnerRadius = MINOR_INNER_RADIUS * scale;

    // Calculate angle (0 at top, clockwise)
    let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (angle < 0) angle += 360;

    // Adjust for current rotation
    angle = (angle - rotation.value + 360) % 360;

    // Determine which segment was tapped
    const segmentIndex = Math.floor((angle + 15) / 30) % 12;

    if (distance > scaledInnerRadius && distance < scaledOuterRadius) {
      // Major key tapped
      const key = CIRCLE_OF_FIFTHS_MAJOR[segmentIndex];
      runOnJS(handleKeyPress)(key.split('/')[0], 'major');
    } else if (distance > scaledMinorInnerRadius && distance < scaledInnerRadius) {
      // Minor key tapped
      const key = CIRCLE_OF_FIFTHS_MINOR[segmentIndex];
      runOnJS(handleKeyPress)(key.split('/')[0], 'minor');
    }
  });

  // Compose gestures
  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  // Animated rotation style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Create pie segment path
  const createSegmentPath = (
    startAngle: number,
    endAngle: number,
    outerR: number,
    innerR: number
  ) => {
    const path = Skia.Path.Make();
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    // Outer arc
    const outerStartX = CENTER + outerR * Math.cos(startRad);
    const outerStartY = CENTER + outerR * Math.sin(startRad);
    const outerEndX = CENTER + outerR * Math.cos(endRad);
    const outerEndY = CENTER + outerR * Math.sin(endRad);

    // Inner arc
    const innerStartX = CENTER + innerR * Math.cos(startRad);
    const innerStartY = CENTER + innerR * Math.sin(startRad);
    const innerEndX = CENTER + innerR * Math.cos(endRad);
    const innerEndY = CENTER + innerR * Math.sin(endRad);

    path.moveTo(outerStartX, outerStartY);
    path.arcToOval(
      { x: CENTER - outerR, y: CENTER - outerR, width: outerR * 2, height: outerR * 2 },
      startAngle - 90,
      endAngle - startAngle,
      false
    );
    path.lineTo(innerEndX, innerEndY);
    path.arcToOval(
      { x: CENTER - innerR, y: CENTER - innerR, width: innerR * 2, height: innerR * 2 },
      endAngle - 90,
      -(endAngle - startAngle),
      false
    );
    path.close();

    return path;
  };

  // Render segments
  const majorSegments = useMemo(() => {
    return CIRCLE_OF_FIFTHS_MAJOR.map((key, index) => {
      const startAngle = index * 30 - 15;
      const endAngle = startAngle + 30;
      const path = createSegmentPath(startAngle, endAngle, OUTER_RADIUS, INNER_RADIUS);
      const isSelected = index === selectedIndex && selectedQuality === 'major';

      return { key, path, isSelected, index };
    });
  }, [selectedIndex, selectedQuality]);

  const minorSegments = useMemo(() => {
    return CIRCLE_OF_FIFTHS_MINOR.map((key, index) => {
      const startAngle = index * 30 - 15;
      const endAngle = startAngle + 30;
      const path = createSegmentPath(startAngle, endAngle, INNER_RADIUS - 2, MINOR_INNER_RADIUS);
      const isSelected = index === selectedIndex && selectedQuality === 'minor';

      return { key, path, isSelected, index };
    });
  }, [selectedIndex, selectedQuality]);

  // Calculate text positions
  const getTextPosition = (index: number, radius: number) => {
    const angle = (index * 30 - 90) * (Math.PI / 180);
    return {
      x: CENTER + radius * Math.cos(angle),
      y: CENTER + radius * Math.sin(angle),
    };
  };

  // Get scale notes for display
  const scaleNotes = useMemo(() => {
    const notes = getScaleNotes(selectedRoot, mode);
    return notes.join(' - ');
  }, [selectedRoot, mode]);

  if (!font || !smallFont || !centerFont) {
    return <View style={[styles.container, { width: size, height: size }]} />;
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.canvasContainer, { width: size, height: size }, animatedStyle]}>
          <Canvas style={{ width: size, height: size }}>
            <Group transform={[{ scale }]}>
              {/* Outer bezel */}
              <Circle cx={CENTER} cy={CENTER} r={OUTER_RADIUS + 4} color={SEGMENT_COLORS.bezel}>
                <Shadow dx={0} dy={4} blur={8} color="rgba(0,0,0,0.4)" />
              </Circle>

              {/* Major key segments */}
              {majorSegments.map(({ key, path, isSelected, index }) => (
                <Group key={`major-${index}`}>
                  <Path
                    path={path}
                    color={isSelected ? SEGMENT_COLORS.major.selected : SEGMENT_COLORS.major.default}
                  >
                    {isSelected && <BlurMask blur={4} style="solid" />}
                  </Path>
                  {/* Segment border */}
                  <Path
                    path={path}
                    color="rgba(0,0,0,0.2)"
                    style="stroke"
                    strokeWidth={1}
                  />
                </Group>
              ))}

              {/* Minor key segments */}
              {minorSegments.map(({ key, path, isSelected, index }) => (
                <Group key={`minor-${index}`}>
                  <Path
                    path={path}
                    color={isSelected ? SEGMENT_COLORS.minor.selected : SEGMENT_COLORS.minor.default}
                  >
                    {isSelected && <BlurMask blur={4} style="solid" />}
                  </Path>
                  {/* Segment border */}
                  <Path
                    path={path}
                    color="rgba(0,0,0,0.3)"
                    style="stroke"
                    strokeWidth={1}
                  />
                </Group>
              ))}

              {/* Center well */}
              <Circle cx={CENTER} cy={CENTER} r={CENTER_RADIUS} color={SEGMENT_COLORS.centerWell}>
                <Shadow dx={2} dy={2} blur={6} color="rgba(0,0,0,0.8)" inner />
              </Circle>

              {/* Glass highlight on center */}
              <Circle cx={CENTER} cy={CENTER - CENTER_RADIUS * 0.3} r={CENTER_RADIUS * 0.6}>
                <RadialGradient
                  c={vec(CENTER, CENTER - CENTER_RADIUS * 0.3)}
                  r={CENTER_RADIUS * 0.6}
                  colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0)']}
                />
              </Circle>

              {/* Major key labels */}
              {CIRCLE_OF_FIFTHS_MAJOR.map((key, index) => {
                const pos = getTextPosition(index, OUTER_RADIUS - MAJOR_RING_WIDTH / 2);
                const displayKey = key.split('/')[0];
                const isSelected = index === selectedIndex && selectedQuality === 'major';
                const textWidth = font.measureText(displayKey).width;

                return (
                  <SkiaText
                    key={`major-text-${index}`}
                    x={pos.x - textWidth / 2}
                    y={pos.y + 5}
                    text={displayKey}
                    font={font}
                    color={isSelected ? '#ffffff' : Colors.charcoal}
                  />
                );
              })}

              {/* Minor key labels */}
              {CIRCLE_OF_FIFTHS_MINOR.map((key, index) => {
                const pos = getTextPosition(index, INNER_RADIUS - MINOR_RING_WIDTH / 2 - 1);
                const displayKey = key.split('/')[0];
                const isSelected = index === selectedIndex && selectedQuality === 'minor';
                const textWidth = smallFont.measureText(displayKey).width;

                return (
                  <SkiaText
                    key={`minor-text-${index}`}
                    x={pos.x - textWidth / 2}
                    y={pos.y + 4}
                    text={displayKey}
                    font={smallFont}
                    color={isSelected ? '#ffffff' : '#aaaaaa'}
                  />
                );
              })}

              {/* Center display - Selected key */}
              <SkiaText
                x={CENTER - centerFont.measureText(selectedKey).width / 2}
                y={CENTER + 6}
                text={selectedKey}
                font={centerFont}
                color="#ffffff"
              />
            </Group>
          </Canvas>
        </Animated.View>
      </GestureDetector>

      {/* LED indicator for selected key */}
      <View
        style={[
          styles.ledIndicator,
          {
            top: 4 * scale,
            left: size / 2 - 6,
            backgroundColor: Colors.vermilion,
            shadowColor: Colors.vermilion,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ledIndicator: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default CircleOfFifths;
