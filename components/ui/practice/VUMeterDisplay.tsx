import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Styles';
import { ACHIEVEMENTS, formatPracticeTime, calculateProgress } from '@/types/practice';
import { InsetWindow } from '@/components/ui/InsetWindow';
import { LEDIndicator } from '@/components/skia/primitives/LEDIndicator';

/**
 * VU Meter mode
 * - 'progress': Shows practice time progress (default)
 * - 'metronome': Shows pendulum swing for metronome beats
 * - 'recording': Shows audio level for voice recorder
 */
type VUMeterMode = 'progress' | 'metronome' | 'recording';

interface VUMeterDisplayProps {
  totalSeconds?: number;              // For progress mode (optional in metronome mode)
  compact?: boolean;
  fullWidth?: boolean;                // Full viewport width, no rounded corners
  embedded?: boolean;                 // Remove housing borders when embedded in another component
  mode?: VUMeterMode;                 // Default: 'progress'
  beatPosition?: number;              // 0 (left) or 1 (right) for metronome pendulum (legacy, not used in pendulum mode)
  isMetronomePlaying?: boolean;       // For LED beat effects and pendulum animation
  currentBeat?: number;               // Current beat number (1-indexed)
  beatsPerMeasure?: number;           // Total beats in measure
  sessionSeconds?: number;            // Session time for metronome mode display
  sessionLabel?: string;              // Custom label (default: 'SESSION TIME' or 'TOTAL PRACTICE')
  showTimeDisplay?: boolean;          // Show embedded time display (default: true)
  headerContent?: React.ReactNode;    // Content to render at top of housing (e.g., time signature)
  children?: React.ReactNode;         // Content to render at bottom of housing (e.g., BPM display)
  // Pendulum animation props (metronome mode)
  bpm?: number;                       // BPM for pendulum swing speed
  metronomeStartTime?: number;        // Timestamp when metronome started (for pendulum sync)
  // Recording mode props
  audioLevel?: number;                // 0-1 audio level for recording mode
  isRecording?: boolean;              // Show REC LED in recording mode
  isPlaying?: boolean;                // Show PLAY LED in recording mode
}

/**
 * Skeuomorphic VU Meter display with multiple modes:
 * - Progress mode: Shows total practice time with static needle position
 * - Metronome mode: Shows pendulum swing for metronome beats
 * - Recording mode: Shows audio level for voice recorder
 */
export const VUMeterDisplay: React.FC<VUMeterDisplayProps> = ({
  totalSeconds = 0,
  compact = false,
  fullWidth = false,
  embedded = false,
  mode = 'progress',
  beatPosition = 0.5,
  isMetronomePlaying = false,
  currentBeat = 1,
  beatsPerMeasure = 4,
  sessionSeconds,
  sessionLabel,
  showTimeDisplay = true,
  headerContent,
  children,
  // Pendulum animation props
  bpm = 120,
  metronomeStartTime = 0,
  // Recording mode props
  audioLevel = 0,
  isRecording = false,
  isPlaying = false,
}) => {
  const needleRotation = useRef(new Animated.Value(50)).current;
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Calculate target value for non-metronome modes
  const targetValue = useMemo(() => {
    if (mode === 'recording') {
      // Map audioLevel 0-1 to 0-100 for needle rotation
      // Use logarithmic scaling for natural VU meter feel
      if (audioLevel <= 0) return 0;
      const db = 20 * Math.log10(Math.max(audioLevel, 0.001));
      // Map -40dB to +3dB onto 0-100
      const minDb = -40;
      const maxDb = 3;
      const position = ((db - minDb) / (maxDb - minDb)) * 100;
      return Math.max(0, Math.min(100, position));
    }
    // Progress mode: calculate from totalSeconds
    return calculateProgress(totalSeconds);
  }, [mode, totalSeconds, audioLevel]);

  // Metronome mode: Continuous pendulum animation using requestAnimationFrame
  useEffect(() => {
    if (mode !== 'metronome') return;

    if (!isMetronomePlaying) {
      // Reset to center when stopped
      needleRotation.setValue(50);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    // Capture start time for phase sync
    startTimeRef.current = metronomeStartTime || performance.now() / 1000;

    const animate = () => {
      const now = performance.now() / 1000;
      const beatPeriod = 60 / bpm; // seconds per beat
      const elapsed = now - startTimeRef.current;

      // -cos gives us: -1 at t=0 (left), +1 at t=period/2 (right), -1 at t=period (left)
      // This creates a smooth pendulum swing where:
      // - Left extreme (-45deg) = where click sounds (Wittner style)
      // - Right extreme (+45deg) = silent peak of swing
      const position = -Math.cos((2 * Math.PI * elapsed) / beatPeriod);

      // Map -1...+1 to 0...100 for needle interpolation
      // -1 (left) -> 0, +1 (right) -> 100
      needleRotation.setValue((position + 1) * 50);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [mode, isMetronomePlaying, bpm, metronomeStartTime, needleRotation]);

  // Non-metronome modes: Spring animation to target value
  useEffect(() => {
    if (mode === 'metronome') return; // Pendulum handles its own animation

    const springConfig = mode === 'recording'
      ? { tension: 100, friction: 12 }  // Responsive for audio level
      : { tension: 50, friction: 10 };  // Smooth for progress

    Animated.spring(needleRotation, {
      toValue: targetValue,
      ...springConfig,
      useNativeDriver: false, // Required for web compatibility
    }).start();
  }, [targetValue, needleRotation, mode]);

  // Map progress to rotation: 0% = -45deg, 100% = +45deg
  const rotation = needleRotation.interpolate({
    inputRange: [0, 100],
    outputRange: ['-45deg', '45deg'],
  });

  // Scale markers for the VU meter (logarithmic feel) - used in progress mode
  const progressMarkers = [
    { label: '-20', time: '5m', threshold: 300 },
    { label: '-10', time: '30m', threshold: 1800 },
    { label: '-5', time: '1h', threshold: 3600 },
    { label: '0', time: '3h', threshold: 10800 },
    { label: '+3', time: '10h', threshold: 36000 },
  ];

  // Scale markers for recording mode (dB scale - absolute positioning with -10 at exact center)
  const recordingMarkers = [
    { label: '-40', db: -40, position: 0 },
    { label: '-25', db: -25, position: 0.25 },
    { label: '-10', db: -10, position: 0.5 },   // Exactly centered with needle base
    { label: '-2', db: -2, position: 0.75 },
    { label: '+3', db: 3, position: 1 },
  ];

  // Calculate current dB level for LED activation in recording mode
  const currentDb = useMemo(() => {
    if (audioLevel <= 0) return -60;
    return 20 * Math.log10(Math.max(audioLevel, 0.001));
  }, [audioLevel]);

  // Check if LED should be active in recording mode (based on needle position like tuner)
  const isRecordingLedActive = (markerDb: number): boolean => {
    if (mode !== 'recording') return false;
    // LED is active when currentDb is within ±10dB of the marker
    return Math.abs(currentDb - markerDb) <= 10;
  };

  // Beat markers for metronome mode - positioned to align with needle arc
  // Needle geometry: 72px long, pivots from center (140px) at ±45°
  // At -45°: tip at 140 - 72*sin(45°) ≈ 89px
  // At +45°: tip at 140 + 72*sin(45°) ≈ 191px
  // Markers must be positioned within this ~102px arc range
  const beatMarkers = useMemo(() => {
    const markers = [];
    for (let i = 1; i <= beatsPerMeasure; i++) {
      // Position as fraction from 0 to 1 across the needle arc
      const position = beatsPerMeasure > 1
        ? (i - 1) / (beatsPerMeasure - 1)
        : 0.5;
      markers.push({
        label: String(i),
        beat: i,
        position, // 0 = left edge of arc, 1 = right edge
      });
    }
    return markers;
  }, [beatsPerMeasure]);

  // Determine which LED is active in metronome mode
  const isLedActiveForBeat = (beatNum: number): boolean => {
    if (mode !== 'metronome' || !isMetronomePlaying) return false;
    return beatNum === currentBeat;
  };



  // Time display values
  const displaySeconds = mode === 'metronome' && sessionSeconds !== undefined
    ? sessionSeconds
    : totalSeconds;
  const displayLabel = sessionLabel
    ? sessionLabel
    : mode === 'metronome'
      ? 'SESSION TIME'
      : 'TOTAL PRACTICE';

  return (
    <View style={[styles.housing, compact && styles.housingCompact, fullWidth && styles.housingFullWidth, embedded && styles.housingEmbedded]}>
      {/* Header content (e.g., time signature selector) */}
      {headerContent && (
        <View style={[styles.headerContainer, compact && styles.headerContainerCompact]}>
          {headerContent}
        </View>
      )}

      {/* VU label - shows BPM indicator in metronome mode, VU in recording mode */}
      <Text style={[styles.vuLabel, compact && styles.vuLabelCompact]}>
        {mode === 'metronome' ? 'BPM' : mode === 'recording' ? 'VU' : 'VU'}
      </Text>

      {/* Meter face - deeper for metronome mode to separate pendulum from beat counter */}
      <InsetWindow
        variant="light"
        borderRadius={compact ? 8 : 12}
        style={{
          ...styles.meterFace,
          ...(compact ? styles.meterFaceCompact : {}),
          ...(mode === 'metronome' ? styles.meterFaceMetronome : {}),
          ...(mode === 'metronome' && compact ? styles.meterFaceMetronomeCompact : {}),
        }}
        showGlassOverlay
      >
        {/* Scale markings with labels at top and LEDs below (matches TunerVUMeter) */}
        {mode === 'recording' ? (
          // Recording mode: absolute positioning to ensure -10 aligns with needle base
          <View style={styles.recordingScaleMarkings}>
            {recordingMarkers.map((marker) => (
              <View
                key={marker.label}
                style={[
                  styles.recordingMarkerContainer,
                  { left: `${marker.position * 100}%` },
                ]}
              >
                <Text style={[styles.markerLabel, compact && styles.markerLabelCompact]}>
                  {marker.label}
                </Text>
                <LEDIndicator
                  size={compact ? 10 : 14}
                  isActive={isRecordingLedActive(marker.db)}
                  color={marker.db >= 0 ? Colors.moss : Colors.vermilion}
                />
              </View>
            ))}
          </View>
        ) : mode === 'metronome' ? (
          // Metronome mode: Beat counter at top, pendulum swings below
          <>
            {/* Beat counter with LEDs */}
            <View style={[styles.metronomeScaleMarkings, compact && styles.metronomeScaleMarkingsCompact]}>
              {beatMarkers.map((marker) => (
                <View
                  key={marker.label}
                  style={[
                    styles.metronomeMarkerContainer,
                    { left: `${marker.position * 100}%` },
                  ]}
                >
                  <Text style={[styles.markerLabel, compact && styles.markerLabelCompact]}>
                    {marker.label}
                  </Text>
                  <LEDIndicator
                    size={compact ? 12 : 16}
                    isActive={isLedActiveForBeat(marker.beat)}
                    color={marker.beat === 1 ? '#FF6B35' : '#16A34A'}
                  />
                </View>
              ))}
            </View>
            {/* Visual separator between beat counter and pendulum area */}
            <View style={[styles.pendulumSeparator, compact && styles.pendulumSeparatorCompact]} />
          </>
        ) : (
          // Progress mode: evenly spaced with space-between
          <View style={styles.scaleMarkings}>
            {progressMarkers.map((marker) => (
              <View key={marker.label} style={styles.markerContainer}>
                <Text style={[styles.markerLabel, compact && styles.markerLabelCompact]}>
                  {marker.time}
                </Text>
                <LEDIndicator
                  size={compact ? 12 : 16}
                  isActive={totalSeconds >= marker.threshold}
                  color={Colors.moss}
                />
              </View>
            ))}
          </View>
        )}

        {/* Direction labels for recording mode (like tuner's FLAT/SHARP) */}
        {mode === 'recording' && (
          <View style={styles.directionLabels}>
            <Text style={styles.directionText}>LOW</Text>
            <Text style={styles.directionText}>PEAK</Text>
          </View>
        )}

        {/* Needle pivot point and needle */}
        <View style={styles.needlePivot}>
          <Animated.View
            style={[
              styles.needle,
              compact && styles.needleCompact,
              { transform: [{ rotate: rotation }] },
            ]}
          >
            <LinearGradient
              colors={[Colors.moss, Colors.moss, 'rgba(255,255,255,0.3)', Colors.moss, Colors.moss]}
              locations={[0, 0.2, 0.5, 0.8, 1]}
              style={styles.needleBody}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
          {/* Pivot screw */}
          <View style={[styles.pivotScrew, compact && styles.pivotScrewCompact]} />
        </View>
      </InsetWindow>

      {/* Time display - conditionally rendered */}
      {showTimeDisplay && (
        <View style={[styles.timeDisplay, compact && styles.timeDisplayCompact]}>
          <Text style={[styles.timeValue, compact && styles.timeValueCompact]}>
            {formatPracticeTime(displaySeconds)}
          </Text>
          <Text style={[styles.timeLabel2, compact && styles.timeLabel2Compact]}>
            {displayLabel}
          </Text>
        </View>
      )}

      {/* Custom content at bottom of housing (e.g., BPM display) */}
      {children && (
        <View style={[styles.childrenContainer, compact && styles.childrenContainerCompact]}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  housing: {
    width: 310,
    backgroundColor: Colors.ink,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    // Outer bevel
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0,0,0,0.4)',
    // Shadow
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  housingCompact: {
    width: 218,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 9,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  housingFullWidth: {
    width: '100%',
    borderRadius: 0,
  },
  housingEmbedded: {
    // Remove borders and shadow when embedded in another component
    borderTopWidth: 0,
    borderBottomWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  headerContainer: {
    width: '100%',
    marginBottom: 8,
  },
  headerContainerCompact: {
    marginBottom: 6,
  },
  vuLabel: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: 'transparent',
    letterSpacing: 4,
    marginBottom: 8,
  },
  vuLabelCompact: {
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 4,
  },
  meterFace: {
    width: 280,
    height: 112,
    borderRadius: 12,
  },
  meterFaceCompact: {
    width: 200,
    height: 80,
    borderRadius: 8,
  },
  // Deeper meter face for metronome mode to accommodate visual separation
  meterFaceMetronome: {
    height: 140, // Increased from 112 to separate beat counter from pendulum
  },
  meterFaceMetronomeCompact: {
    height: 100, // Increased from 80
  },
  // Scale markings at top inside meter (matches TunerVUMeter)
  scaleMarkings: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  // Recording mode: absolute positioning for precise alignment
  recordingScaleMarkings: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    height: 40,
  },
  // Metronome mode: positioned to align markers with needle arc
  // Needle reaches from ~89px to ~191px on 280px face (32% to 68%)
  // Using ~30% margins to center markers within needle arc
  metronomeScaleMarkings: {
    position: 'absolute',
    top: 12,
    left: 89,  // Where needle tip reaches at -45°
    right: 89, // 280 - 191 = 89 (where needle reaches at +45°)
    height: 40,
  },
  metronomeScaleMarkingsCompact: {
    left: 64,
    right: 64,
    height: 32,
  },
  // Visual separator between beat counter and pendulum area
  pendulumSeparator: {
    position: 'absolute',
    top: 56,  // Below beat counter LEDs
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  pendulumSeparatorCompact: {
    top: 44,
    left: 16,
    right: 16,
  },
  metronomeMarkerContainer: {
    position: 'absolute',
    alignItems: 'center',
    gap: 4,
    transform: [{ translateX: -12 }], // Center marker on position
  },
  markerContainer: {
    alignItems: 'center',
    gap: 4,
  },
  // Recording mode marker: absolutely positioned, centered on its position
  recordingMarkerContainer: {
    position: 'absolute',
    alignItems: 'center',
    gap: 4,
    transform: [{ translateX: -12 }], // Center marker on position (approx half width)
  },
  // Marker labels match TunerVUMeter style exactly
  markerLabel: {
    fontFamily: 'LexendDecaBold',
    fontSize: 12,
    color: Colors.warmGray,
  },
  markerLabelCompact: {
    fontSize: 10,
  },
  // Direction labels for recording mode (like tuner's FLAT/SHARP)
  directionLabels: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  directionText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 9,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.3)',
  },

  timeLabel: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 8,
    color: Colors.warmGray,
  },
  timeLabelCompact: {
    fontSize: 6,
  },
  needlePivot: {
    position: 'absolute',
    bottom: 15,
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  needle: {
    position: 'absolute',
    bottom: 6,
    width: 3,
    height: 72,
    transformOrigin: 'bottom center',
    // Drop shadow for depth
    shadowColor: 'rgba(0,0,0,0.6)',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  needleCompact: {
    height: 52,
    width: 2,
  },
  needleBody: {
    flex: 1,
    width: '100%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
    // Highlight edge for 3D effect
    borderLeftWidth: 0.5,
    borderLeftColor: 'rgba(255,255,255,0.3)',
  },
  pivotScrew: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#555',
    position: 'absolute',
    bottom: 0,
  },
  pivotScrewCompact: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  timeDisplay: {
    marginTop: 16,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    // Inset
    borderTopWidth: 2,
    borderTopColor: 'rgba(0,0,0,0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  timeDisplayCompact: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  timeValue: {
    fontFamily: 'LexendDecaBold',
    fontSize: 28,
    color: Colors.softWhite,
    letterSpacing: 2,
  },
  timeValueCompact: {
    fontSize: 20,
    letterSpacing: 1,
  },
  timeLabel2: {
    ...Typography.label,
    color: Colors.vermilion,
    marginTop: 4,
  },
  timeLabel2Compact: {
    ...Typography.label,
    fontSize: 8,
    color: Colors.vermilion,
    marginTop: 2,
  },
  childrenContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  childrenContainerCompact: {
    marginTop: 10,
  },
});
