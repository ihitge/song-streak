/**
 * ShareToBandModal Component
 *
 * Modal for sharing a voice memo to a band.
 * Shows list of user's bands with selection.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { X, Users, Check, UserMinus } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Styles';
import { useClickSound } from '@/hooks/useClickSound';
import { BandWithMemberCount } from '@/types/band';
import { InsetWindow } from '@/components/ui/InsetWindow';

interface ShareToBandModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Called when modal is closed */
  onClose: () => void;
  /** Available bands */
  bands: BandWithMemberCount[];
  /** Currently shared band ID (null if personal) */
  currentBandId: string | null;
  /** Called when a band is selected */
  onShare: (bandId: string) => Promise<void>;
  /** Called when unshare is requested */
  onUnshare: () => Promise<void>;
  /** Memo title for display */
  memoTitle: string;
}

export const ShareToBandModal: React.FC<ShareToBandModalProps> = ({
  visible,
  onClose,
  bands,
  currentBandId,
  onShare,
  onUnshare,
  memoTitle,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingBandId, setLoadingBandId] = useState<string | null>(null);
  const { playSound } = useClickSound();

  const handleClose = async () => {
    if (isLoading) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    onClose();
  };

  const handleBandSelect = async (bandId: string) => {
    if (isLoading || bandId === currentBandId) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await playSound();

    setIsLoading(true);
    setLoadingBandId(bandId);

    try {
      await onShare(bandId);
      onClose();
    } catch (error) {
      console.error('[ShareToBandModal] Share error:', error);
    } finally {
      setIsLoading(false);
      setLoadingBandId(null);
    }
  };

  const handleUnshare = async () => {
    if (isLoading || !currentBandId) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await playSound();

    setIsLoading(true);
    setLoadingBandId('unshare');

    try {
      await onUnshare();
      onClose();
    } catch (error) {
      console.error('[ShareToBandModal] Unshare error:', error);
    } finally {
      setIsLoading(false);
      setLoadingBandId(null);
    }
  };

  const currentBand = bands.find((b) => b.id === currentBandId);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>SHARE TO BAND</Text>
            <Pressable onPress={handleClose} style={styles.closeButton} disabled={isLoading}>
              <X size={20} color={Colors.graphite} />
            </Pressable>
          </View>

          {/* Memo Info */}
          <View style={styles.memoInfo}>
            <Text style={styles.memoLabel}>SHARING</Text>
            <Text style={styles.memoTitle} numberOfLines={1}>
              {memoTitle || 'Untitled Memo'}
            </Text>
          </View>

          {/* Current Status */}
          {currentBandId && currentBand && (
            <View style={styles.currentStatus}>
              <Text style={styles.currentLabel}>CURRENTLY SHARED WITH</Text>
              <View style={styles.currentBand}>
                <Users size={14} color={Colors.moss} />
                <Text style={styles.currentBandName}>{currentBand.name}</Text>
              </View>
            </View>
          )}

          {/* Band List */}
          <ScrollView style={styles.bandList} showsVerticalScrollIndicator={false}>
            {bands.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  You're not a member of any bands yet.
                </Text>
                <Text style={styles.emptySubtext}>
                  Create or join a band to share recordings.
                </Text>
              </View>
            ) : (
              <>
                {bands.map((band) => {
                  const isCurrentBand = band.id === currentBandId;
                  const isLoadingThis = loadingBandId === band.id;

                  return (
                    <Pressable
                      key={band.id}
                      onPress={() => handleBandSelect(band.id)}
                      style={[
                        styles.bandOption,
                        isCurrentBand && styles.bandOptionSelected,
                      ]}
                      disabled={isLoading}
                    >
                      <InsetWindow
                        variant="light"
                        borderRadius={8}
                        style={styles.bandContent}
                      >
                        <View style={styles.bandInfo}>
                          <Users size={18} color={isCurrentBand ? Colors.moss : Colors.charcoal} />
                          <View style={styles.bandDetails}>
                            <Text
                              style={[
                                styles.bandName,
                                isCurrentBand && styles.bandNameSelected,
                              ]}
                              numberOfLines={1}
                            >
                              {band.name}
                            </Text>
                            <Text style={styles.bandMembers}>
                              {band.member_count} member{band.member_count !== 1 ? 's' : ''}
                            </Text>
                          </View>
                        </View>

                        {isLoadingThis ? (
                          <ActivityIndicator size="small" color={Colors.vermilion} />
                        ) : isCurrentBand ? (
                          <Check size={18} color={Colors.moss} />
                        ) : null}
                      </InsetWindow>
                    </Pressable>
                  );
                })}

                {/* Unshare option (if currently shared) */}
                {currentBandId && (
                  <Pressable
                    onPress={handleUnshare}
                    style={styles.unshareOption}
                    disabled={isLoading}
                  >
                    <InsetWindow
                      variant="light"
                      borderRadius={8}
                      style={styles.bandContent}
                    >
                      <View style={styles.bandInfo}>
                        <UserMinus size={18} color={Colors.vermilion} />
                        <Text style={styles.unshareName}>Make Personal Only</Text>
                      </View>

                      {loadingBandId === 'unshare' && (
                        <ActivityIndicator size="small" color={Colors.vermilion} />
                      )}
                    </InsetWindow>
                  </Pressable>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '80%',
    backgroundColor: Colors.matteFog,
    borderRadius: 16,
    overflow: 'hidden',
    // Shadow
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    ...Typography.label,
    fontSize: 14,
    color: Colors.vermilion,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.alloy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memoInfo: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.alloy,
  },
  memoLabel: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 10,
    letterSpacing: 1,
    color: Colors.graphite,
    marginBottom: 4,
  },
  memoTitle: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.charcoal,
  },
  currentStatus: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(65, 123, 90, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  currentLabel: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 10,
    letterSpacing: 1,
    color: Colors.moss,
    marginBottom: 4,
  },
  currentBand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currentBandName: {
    fontFamily: 'LexendDecaBold',
    fontSize: 13,
    color: Colors.moss,
  },
  bandList: {
    padding: 16,
  },
  bandOption: {
    marginBottom: 8,
  },
  bandOptionSelected: {
    // Visual indicator handled by content styling
  },
  bandContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  bandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  bandDetails: {
    flex: 1,
  },
  bandName: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.charcoal,
  },
  bandNameSelected: {
    color: Colors.moss,
  },
  bandMembers: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 11,
    color: Colors.graphite,
    marginTop: 2,
  },
  unshareOption: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 16,
  },
  unshareName: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.vermilion,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.charcoal,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.graphite,
    textAlign: 'center',
  },
});

export default ShareToBandModal;
