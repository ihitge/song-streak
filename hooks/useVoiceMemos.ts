/**
 * useVoiceMemos Hook
 *
 * CRUD operations for voice memos with Supabase Storage.
 * Handles uploading, fetching, and sharing memos with band members.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabase/client';
import {
  VoiceMemo,
  VoiceMemoWithMeta,
  CreateVoiceMemoInput,
  UpdateVoiceMemoInput,
} from '@/types/voiceMemo';

interface UseVoiceMemosOptions {
  /** Filter by band ID (null = personal only) */
  bandId?: string | null;
  /** Include shared band memos */
  includeShared?: boolean;
}

interface UseVoiceMemosReturn {
  // State
  memos: VoiceMemoWithMeta[];
  isLoading: boolean;
  error: string | null;
  isUploading: boolean;
  uploadProgress: number;

  // Actions
  refresh: () => Promise<void>;
  uploadMemo: (blob: Blob, duration: number, title?: string) => Promise<VoiceMemo | null>;
  updateMemo: (id: string, updates: UpdateVoiceMemoInput) => Promise<boolean>;
  deleteMemo: (id: string) => Promise<boolean>;
  shareToBand: (id: string, bandId: string) => Promise<boolean>;
  unshareMemo: (id: string) => Promise<boolean>;
  getSignedUrl: (memoId: string) => Promise<string | null>;
}

/**
 * Generate a unique filename for audio uploads
 */
function generateAudioFilename(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `memo_${timestamp}_${random}.webm`;
}

/**
 * Hook for managing voice memos
 */
export function useVoiceMemos(options: UseVoiceMemosOptions = {}): UseVoiceMemosReturn {
  const { bandId = null, includeShared = true } = options;

  const [memos, setMemos] = useState<VoiceMemoWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Fetch memos from database
   */
  const fetchMemos = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMemos([]);
        setIsLoading(false);
        return;
      }

      // Build query
      let query = supabase
        .from('voice_memos')
        .select('*')
        .order('recorded_at', { ascending: false });

      // Filter based on options
      if (bandId) {
        // Specific band memos
        query = query.eq('band_id', bandId);
      } else if (!includeShared) {
        // Personal memos only
        query = query.eq('created_by', user.id).is('band_id', null);
      }
      // If includeShared is true, RLS will handle returning all visible memos

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Enrich with meta information
      const enrichedMemos: VoiceMemoWithMeta[] = (data || []).map((memo) => ({
        ...memo,
        is_owner: memo.created_by === user.id,
      }));

      setMemos(enrichedMemos);
    } catch (err) {
      console.error('[useVoiceMemos] Error fetching memos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load memos');
    } finally {
      setIsLoading(false);
    }
  }, [bandId, includeShared]);

  // Initial fetch
  useEffect(() => {
    fetchMemos();
  }, [fetchMemos]);

  /**
   * Upload a new voice memo
   */
  const uploadMemo = useCallback(async (
    blob: Blob,
    duration: number,
    title?: string
  ): Promise<VoiceMemo | null> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate filename and path
      const filename = generateAudioFilename();
      const storagePath = `${user.id}/${filename}`;

      // Upload to Supabase Storage
      setUploadProgress(10);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice-memos')
        .upload(storagePath, blob, {
          contentType: blob.type || 'audio/webm',
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setUploadProgress(60);

      // Create database record
      const memoData: CreateVoiceMemoInput = {
        audio_url: storagePath,
        duration_seconds: duration,
        file_size_bytes: blob.size,
        title: title || undefined,
      };

      const { data: memo, error: insertError } = await supabase
        .from('voice_memos')
        .insert({
          ...memoData,
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setUploadProgress(100);

      // Refresh list
      await fetchMemos();

      return memo;
    } catch (err) {
      console.error('[useVoiceMemos] Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload memo');
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [fetchMemos]);

  /**
   * Update memo metadata
   */
  const updateMemo = useCallback(async (
    id: string,
    updates: UpdateVoiceMemoInput
  ): Promise<boolean> => {
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('voice_memos')
        .update(updates)
        .eq('id', id)
        .eq('created_by', user.id); // Ensure ownership

      if (updateError) throw updateError;

      await fetchMemos();
      return true;
    } catch (err) {
      console.error('[useVoiceMemos] Update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update memo');
      return false;
    }
  }, [fetchMemos]);

  /**
   * Delete a memo and its audio file
   */
  const deleteMemo = useCallback(async (id: string): Promise<boolean> => {
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get memo to find storage path
      const { data: memo, error: fetchError } = await supabase
        .from('voice_memos')
        .select('audio_url')
        .eq('id', id)
        .eq('created_by', user.id)
        .single();

      if (fetchError) throw fetchError;
      if (!memo) throw new Error('Memo not found');

      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from('voice-memos')
        .remove([memo.audio_url]);

      if (storageError) {
        console.warn('[useVoiceMemos] Storage delete error:', storageError);
        // Continue anyway - the file might already be gone
      }

      // Delete database record
      const { error: deleteError } = await supabase
        .from('voice_memos')
        .delete()
        .eq('id', id)
        .eq('created_by', user.id);

      if (deleteError) throw deleteError;

      await fetchMemos();
      return true;
    } catch (err) {
      console.error('[useVoiceMemos] Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete memo');
      return false;
    }
  }, [fetchMemos]);

  /**
   * Share memo with a band
   */
  const shareToBand = useCallback(async (id: string, targetBandId: string): Promise<boolean> => {
    return updateMemo(id, { band_id: targetBandId });
  }, [updateMemo]);

  /**
   * Remove band sharing (make personal only)
   */
  const unshareMemo = useCallback(async (id: string): Promise<boolean> => {
    return updateMemo(id, { band_id: null });
  }, [updateMemo]);

  /**
   * Get a signed URL for playing a memo
   */
  const getSignedUrl = useCallback(async (memoId: string): Promise<string | null> => {
    try {
      // Find memo
      const memo = memos.find((m) => m.id === memoId);
      if (!memo) {
        console.error('[useVoiceMemos] Memo not found:', memoId);
        return null;
      }

      // Get signed URL (expires in 1 hour)
      const { data, error } = await supabase.storage
        .from('voice-memos')
        .createSignedUrl(memo.audio_url, 3600);

      if (error) throw error;

      return data?.signedUrl || null;
    } catch (err) {
      console.error('[useVoiceMemos] Signed URL error:', err);
      return null;
    }
  }, [memos]);

  return {
    memos,
    isLoading,
    error,
    isUploading,
    uploadProgress,
    refresh: fetchMemos,
    uploadMemo,
    updateMemo,
    deleteMemo,
    shareToBand,
    unshareMemo,
    getSignedUrl,
  };
}
