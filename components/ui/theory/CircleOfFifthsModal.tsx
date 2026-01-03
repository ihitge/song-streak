import React, { useState, useMemo, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useClickSound } from '@/hooks/useClickSound';
import { CircleOfFifths } from './CircleOfFifths';
import { FrequencyTuner } from '@/components/ui/filters/FrequencyTuner';
import {
  parseKey,
  getScaleNotes,
  getRelatedKeys,
  formatKey,
  ModeName,
  MODE_ORDER,
  MODES,
} from '@/utils/musicTheory';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CircleOfFifthsModalProps {
  visible: boolean;
  onClose: () => void;
  songKey: string;
  songTitle?: string;
  artist?: string;
}

// Mode options for FrequencyTuner
const MODE_OPTIONS = MODE_ORDER.map((mode) => ({
  value: mode,
  label: MODES[mode].name.split(' / ')[0],
}));

export const CircleOfFifthsModal: React.FC<CircleOfFifthsModalProps> = ({
  visible,
  onClose,
  songKey,
  songTitle,
  artist,
}) => {
  const { playSound } = useClickSound();

  // Parse initial key
  const initialParsed = useMemo(() => parseKey(songKey), [songKey]);

  // State for selected key and mode
  const [selectedRoot, setSelectedRoot] = useState(initialParsed.root);
  const [selectedQuality, setSelectedQuality] = useState<'major' | 'minor'>(initialParsed.quality);
  const [selectedMode, setSelectedMode] = useState<ModeName>(
    initialParsed.quality === 'minor' ? 'aeolian' : 'ionian'
  );

  // Format selected key for display
  const displayKey = useMemo(
    () => formatKey(selectedRoot, selectedQuality),
    [selectedRoot, selectedQuality]
  );

  // Get scale notes
  const scaleNotes = useMemo(
    () => getScaleNotes(selectedRoot, selectedMode),
    [selectedRoot, selectedMode]
  );

  // Get related keys
  const relatedKeys = useMemo(
    () => getRelatedKeys(selectedRoot, selectedQuality),
    [selectedRoot, selectedQuality]
  );

  // Get mode info
  const modeInfo = useMemo(() => MODES[selectedMode], [selectedMode]);

  // Handle close
  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    onClose();
  };

  // Handle key selection from circle
  const handleKeySelect = useCallback((key: string, quality: 'major' | 'minor') => {
    setSelectedRoot(key);
    setSelectedQuality(quality);
    // Auto-switch mode based on quality
    if (quality === 'minor' && (selectedMode === 'ionian' || selectedMode === 'lydian' || selectedMode === 'mixolydian')) {
      setSelectedMode('aeolian');
    } else if (quality === 'major' && (selectedMode === 'aeolian' || selectedMode === 'dorian' || selectedMode === 'phrygian')) {
      setSelectedMode('ionian');
    }
  }, [selectedMode]);

  // Handle mode change (FrequencyTuner handles haptics and sound internally)
  const handleModeChange = (mode: ModeName) => {
    setSelectedMode(mode);
  };

  // Reset to song key
  const handleReset = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    setSelectedRoot(initialParsed.root);
    setSelectedQuality(initialParsed.quality);
    setSelectedMode(initialParsed.quality === 'minor' ? 'aeolian' : 'ionian');
  };

  // Calculate circle size based on screen
  const circleSize = Math.min(SCREEN_WIDTH - 48, SCREEN_HEIGHT * 0.34, 285);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <X size={24} color={Colors.charcoal} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>CIRCLE OF FIFTHS</Text>
            {songTitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {songTitle} {artist ? `- ${artist}` : ''}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={handleReset} style={styles.headerButton}>
            <Text style={styles.resetText}>RESET</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Mode Selector */}
          <View style={styles.modeSection}>
            <FrequencyTuner
              label="MODE"
              options={MODE_OPTIONS}
              value={selectedMode}
              onChange={handleModeChange}
              variant="light"
            />
          </View>

          {/* Circle of Fifths */}
          <View style={styles.circleContainer}>
            <CircleOfFifths
              selectedKey={displayKey}
              mode={selectedMode}
              onKeySelect={handleKeySelect}
              size={circleSize}
            />
          </View>

          {/* Scale Info Panel */}
          <View style={styles.infoPanel}>
            <View style={styles.infoPanelHeader}>
              <Info size={16} color={Colors.vermilion} />
              <Text style={styles.infoPanelTitle}>{displayKey} {modeInfo.name}</Text>
            </View>

            {/* Scale Notes */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>SCALE</Text>
              <Text style={styles.infoValue}>{scaleNotes.join(' - ')}</Text>
            </View>

            {/* Mode Description */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>CHARACTER</Text>
              <Text style={styles.infoValue}>{modeInfo.description}</Text>
            </View>

            {/* Related Keys */}
            <View style={styles.relatedKeysSection}>
              <Text style={styles.infoLabel}>RELATED KEYS</Text>
              <View style={styles.relatedKeysGrid}>
                <View style={styles.relatedKeyItem}>
                  <Text style={styles.relatedKeyDegree}>IV</Text>
                  <Text style={styles.relatedKeyName}>{relatedKeys.subdominant}</Text>
                </View>
                <View style={[styles.relatedKeyItem, styles.relatedKeyItemHighlight]}>
                  <Text style={styles.relatedKeyDegree}>I</Text>
                  <Text style={styles.relatedKeyName}>{relatedKeys.tonic}</Text>
                </View>
                <View style={styles.relatedKeyItem}>
                  <Text style={styles.relatedKeyDegree}>V</Text>
                  <Text style={styles.relatedKeyName}>{relatedKeys.dominant}</Text>
                </View>
              </View>
              <View style={styles.relatedKeysRow}>
                <View style={styles.relatedKeyItemSmall}>
                  <Text style={styles.relatedKeyDegreeSmall}>rel.</Text>
                  <Text style={styles.relatedKeyNameSmall}>{relatedKeys.relative}</Text>
                </View>
                <View style={styles.relatedKeyItemSmall}>
                  <Text style={styles.relatedKeyDegreeSmall}>par.</Text>
                  <Text style={styles.relatedKeyNameSmall}>{relatedKeys.parallel}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Song Key Indicator */}
          {songKey && (
            <View style={styles.songKeyBadge}>
              <Text style={styles.songKeyBadgeLabel}>SONG KEY</Text>
              <Text style={styles.songKeyBadgeValue}>{songKey}</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.matteFog,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.alloy,
  },
  headerButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'LexendDecaBold',
    fontSize: 12,
    color: Colors.ink,
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 11,
    color: Colors.warmGray,
    marginTop: 2,
  },
  resetText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    color: Colors.vermilion,
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  modeSection: {
    marginBottom: 16,
  },
  circleContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  infoPanel: {
    backgroundColor: Colors.alloy,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    // Recessed effect
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: '#c0c0c0',
    borderLeftColor: '#c0c0c0',
  },
  infoPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  infoPanelTitle: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.charcoal,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 9,
    color: Colors.warmGray,
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 13,
    color: Colors.charcoal,
  },
  relatedKeysSection: {
    marginTop: 8,
  },
  relatedKeysGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  relatedKeyItem: {
    flex: 1,
    backgroundColor: Colors.softWhite,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  relatedKeyItemHighlight: {
    backgroundColor: Colors.vermilion,
  },
  relatedKeyDegree: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    color: Colors.graphite,
    marginBottom: 4,
  },
  relatedKeyName: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.charcoal,
  },
  relatedKeysRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
  },
  relatedKeyItemSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.softWhite,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  relatedKeyDegreeSmall: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 9,
    color: Colors.graphite,
    textTransform: 'uppercase',
  },
  relatedKeyNameSmall: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 12,
    color: Colors.charcoal,
  },
  songKeyBadge: {
    alignSelf: 'center',
    marginTop: 20,
    backgroundColor: Colors.deepSpaceBlue,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  songKeyBadgeLabel: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
  songKeyBadgeValue: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: '#ffffff',
  },
});

export default CircleOfFifthsModal;
