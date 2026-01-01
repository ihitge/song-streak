import React, { useMemo, useCallback, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useClickSound } from '@/hooks/useClickSound';
import {
  CIRCLE_OF_FIFTHS_MAJOR,
  CIRCLE_OF_FIFTHS_MINOR,
  getCircleIndex,
  parseKey,
  getScaleNotes,
  ModeName,
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

// Create SVG arc path
const describeArc = (
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
): string => {
  const startRad = ((startAngle - 90) * Math.PI) / 180;
  const endRad = ((endAngle - 90) * Math.PI) / 180;

  const outerStartX = cx + outerRadius * Math.cos(startRad);
  const outerStartY = cy + outerRadius * Math.sin(startRad);
  const outerEndX = cx + outerRadius * Math.cos(endRad);
  const outerEndY = cy + outerRadius * Math.sin(endRad);

  const innerStartX = cx + innerRadius * Math.cos(startRad);
  const innerStartY = cy + innerRadius * Math.sin(startRad);
  const innerEndX = cx + innerRadius * Math.cos(endRad);
  const innerEndY = cy + innerRadius * Math.sin(endRad);

  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${outerStartX} ${outerStartY}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}`,
    `L ${innerEndX} ${innerEndY}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
    'Z',
  ].join(' ');
};

// Get text position on arc
const getTextPosition = (index: number, radius: number, center: number) => {
  const angle = ((index * 30 - 90) * Math.PI) / 180;
  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
  };
};

export const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({
  selectedKey,
  mode = 'ionian',
  onKeySelect,
  size = CIRCLE_SIZE,
}) => {
  const { playSound } = useClickSound();
  const [isDragging, setIsDragging] = useState(false);
  const lastAngleRef = useRef(0);

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

  // Rotation state
  const rotation = useSharedValue(0);

  // Calculate scale based on size prop
  const scale = size / CIRCLE_SIZE;
  const scaledCenter = size / 2;
  const scaledOuterRadius = OUTER_RADIUS * scale;
  const scaledInnerRadius = INNER_RADIUS * scale;
  const scaledMinorInnerRadius = MINOR_INNER_RADIUS * scale;
  const scaledCenterRadius = CENTER_RADIUS * scale;
  const scaledMajorRingWidth = MAJOR_RING_WIDTH * scale;
  const scaledMinorRingWidth = MINOR_RING_WIDTH * scale;

  // Haptic and sound feedback
  const triggerFeedback = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not available on web
    }
    await playSound();
  }, [playSound]);

  // Handle key selection
  const handleKeyPress = useCallback(
    async (key: string, quality: 'major' | 'minor') => {
      await triggerFeedback();
      onKeySelect?.(key, quality);
    },
    [onKeySelect, triggerFeedback]
  );

  // Mouse/touch handlers for rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    lastAngleRef.current = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const currentAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    const delta = currentAngle - lastAngleRef.current;
    rotation.value += delta;
    lastAngleRef.current = currentAngle;
  };

  const handlePointerUp = async () => {
    if (isDragging) {
      setIsDragging(false);
      // Snap to nearest 30 degrees
      const targetRotation = Math.round(rotation.value / 30) * 30;
      rotation.value = withSpring(targetRotation, {
        damping: 15,
        stiffness: 150,
      });
      await triggerFeedback();
    }
  };

  // Animated rotation style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Get scale notes for display
  const scaleNotes = useMemo(() => {
    const notes = getScaleNotes(selectedRoot, mode);
    return notes.join(' - ');
  }, [selectedRoot, mode]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[styles.svgContainer, { width: size, height: size }, animatedStyle]}
        // @ts-ignore - Web pointer events
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}
          style={{ overflow: 'visible' }}
        >
          {/* Definitions for effects */}
          <defs>
            {/* Drop shadow for bezel */}
            <filter id="bezelShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.4)" />
            </filter>

            {/* Glow for selected segments */}
            <filter id="selectedGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Inner shadow for center well */}
            <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feOffset dx="2" dy="2" />
              <feGaussianBlur stdDeviation="3" result="offset-blur" />
              <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
              <feFlood floodColor="black" floodOpacity="0.8" result="color" />
              <feComposite operator="in" in="color" in2="inverse" result="shadow" />
              <feComposite operator="over" in="shadow" in2="SourceGraphic" />
            </filter>

            {/* Radial gradient for glass highlight */}
            <radialGradient id="glassHighlight" cx="50%" cy="30%" r="60%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>

          {/* Outer bezel */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={OUTER_RADIUS + 4}
            fill={SEGMENT_COLORS.bezel}
            filter="url(#bezelShadow)"
          />

          {/* Major key segments */}
          {CIRCLE_OF_FIFTHS_MAJOR.map((key, index) => {
            const startAngle = index * 30 - 15;
            const endAngle = startAngle + 30;
            const path = describeArc(CENTER, CENTER, OUTER_RADIUS, INNER_RADIUS, startAngle, endAngle);
            const isSelected = index === selectedIndex && selectedQuality === 'major';
            const displayKey = key.split('/')[0];
            const textPos = getTextPosition(index, OUTER_RADIUS - MAJOR_RING_WIDTH / 2, CENTER);

            return (
              <g key={`major-${index}`}>
                <path
                  d={path}
                  fill={isSelected ? SEGMENT_COLORS.major.selected : SEGMENT_COLORS.major.default}
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="1"
                  filter={isSelected ? 'url(#selectedGlow)' : undefined}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleKeyPress(displayKey, 'major')}
                />
                <text
                  x={textPos.x}
                  y={textPos.y + 5}
                  textAnchor="middle"
                  fill={isSelected ? '#ffffff' : Colors.charcoal}
                  fontSize="14"
                  fontFamily="LexendDeca-Bold, sans-serif"
                  fontWeight="bold"
                  style={{ pointerEvents: 'none' }}
                >
                  {displayKey}
                </text>
              </g>
            );
          })}

          {/* Minor key segments */}
          {CIRCLE_OF_FIFTHS_MINOR.map((key, index) => {
            const startAngle = index * 30 - 15;
            const endAngle = startAngle + 30;
            const path = describeArc(CENTER, CENTER, INNER_RADIUS - 2, MINOR_INNER_RADIUS, startAngle, endAngle);
            const isSelected = index === selectedIndex && selectedQuality === 'minor';
            const displayKey = key.split('/')[0];
            const textPos = getTextPosition(index, INNER_RADIUS - MINOR_RING_WIDTH / 2 - 1, CENTER);

            return (
              <g key={`minor-${index}`}>
                <path
                  d={path}
                  fill={isSelected ? SEGMENT_COLORS.minor.selected : SEGMENT_COLORS.minor.default}
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth="1"
                  filter={isSelected ? 'url(#selectedGlow)' : undefined}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleKeyPress(displayKey, 'minor')}
                />
                <text
                  x={textPos.x}
                  y={textPos.y + 4}
                  textAnchor="middle"
                  fill={isSelected ? '#ffffff' : '#aaaaaa'}
                  fontSize="11"
                  fontFamily="LexendDeca-Bold, sans-serif"
                  fontWeight="bold"
                  style={{ pointerEvents: 'none' }}
                >
                  {displayKey}
                </text>
              </g>
            );
          })}

          {/* Center well */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={CENTER_RADIUS}
            fill={SEGMENT_COLORS.centerWell}
            filter="url(#innerShadow)"
          />

          {/* Glass highlight on center */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={CENTER_RADIUS}
            fill="url(#glassHighlight)"
          />

          {/* Center text - Selected key */}
          <text
            x={CENTER}
            y={CENTER + 6}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="18"
            fontFamily="LexendDeca-Bold, sans-serif"
            fontWeight="bold"
          >
            {selectedKey}
          </text>
        </svg>
      </Animated.View>

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
  svgContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'grab',
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
