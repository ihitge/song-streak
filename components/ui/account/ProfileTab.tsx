import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Camera } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/ctx/AuthContext';
import { supabase } from '@/utils/supabase/client';
import { useClickSound } from '@/hooks/useClickSound';
import { useStyledAlert } from '@/hooks/useStyledAlert';

/**
 * Helper to extract initials from email
 */
const getInitials = (email?: string | null): string => {
  if (!email) return '??';
  const name = email.split('@')[0];
  const parts = name.split(/[._-]/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase();
};

export const ProfileTab: React.FC = () => {
  const { user } = useAuth();
  const { playSound } = useClickSound();
  const { showInfo, showError } = useStyledAlert();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const initials = getInitials(user?.email);
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Unknown';

  // Fetch profile on mount
  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  async function fetchProfile() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found (new user)
        console.error('Error fetching profile:', error);
      }

      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function uploadAvatar() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await playSound();

      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showInfo('Permission Required', 'Please allow access to your photo library to upload an avatar.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      setUploading(true);

      const image = result.assets[0];
      const fileExt = image.uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user?.id}/avatar.${fileExt}`;

      // Read the file as base64
      const response = await fetch(image.uri);
      const blob = await response.blob();

      // Convert blob to ArrayBuffer
      const arrayBuffer = await new Response(blob).arrayBuffer();

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`; // Cache bust

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        });

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      showError('Upload Failed', error.message || 'Unable to upload avatar. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Avatar with Upload Button */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity
          style={styles.avatarTouchable}
          onPress={uploadAvatar}
          disabled={uploading}
          activeOpacity={0.8}
        >
          <View style={styles.avatar}>
            {loading ? (
              <ActivityIndicator size="small" color={Colors.charcoal} />
            ) : avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}

            {/* Upload overlay */}
            {uploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color={Colors.softWhite} />
              </View>
            )}
          </View>

          {/* Camera badge */}
          <View style={styles.cameraBadge}>
            <Camera size={14} color={Colors.softWhite} />
          </View>
        </TouchableOpacity>

        <Text style={styles.avatarHint}>Tap to change photo</Text>
      </View>

      {/* User Info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>EMAIL</Text>
          <Text style={styles.value}>{user?.email || 'Not available'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>MEMBER SINCE</Text>
          <Text style={styles.value}>{memberSince}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 24,
    gap: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    gap: 8,
  },
  avatarTouchable: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.alloy,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 3,
    borderColor: '#c0c0c0',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 32,
    fontFamily: 'LexendDecaBold',
    color: Colors.charcoal,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.vermilion,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.matteFog,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  avatarHint: {
    fontSize: 11,
    fontFamily: 'LexendDecaRegular',
    color: Colors.graphite,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: Colors.alloy,
    borderRadius: 8,
    padding: 16,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    paddingVertical: 8,
  },
  label: {
    fontSize: 9,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.warmGray,
    letterSpacing: 2,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontFamily: 'LexendDecaRegular',
    color: Colors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
  },
});
