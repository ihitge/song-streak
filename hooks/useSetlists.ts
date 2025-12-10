import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabase/client';
import {
  Setlist,
  SetlistWithSongs,
  SetlistSong,
  SetlistSongWithDetails,
  MAX_SETLISTS_PER_BAND,
} from '@/types/band';

interface UseSetlistsReturn {
  setlists: SetlistWithSongs[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createSetlist: (bandId: string, name: string, venue?: string, gigDate?: string) => Promise<Setlist | null>;
  updateSetlist: (setlistId: string, updates: { name?: string; venue?: string; gig_date?: string | null }) => Promise<boolean>;
  deleteSetlist: (setlistId: string) => Promise<boolean>;
  addSongToSetlist: (setlistId: string, songId: string) => Promise<boolean>;
  removeSongFromSetlist: (setlistId: string, songId: string) => Promise<boolean>;
  reorderSongs: (setlistId: string, songIds: string[]) => Promise<boolean>;
}

/**
 * Hook to manage setlists for a specific band
 */
export function useSetlists(bandId: string | undefined): UseSetlistsReturn {
  const [setlists, setSetlists] = useState<SetlistWithSongs[]>([]);
  const [isLoading, setIsLoading] = useState(!!bandId);
  const [error, setError] = useState<string | null>(null);

  // Load setlists with their songs
  const loadSetlists = useCallback(async () => {
    if (!bandId) {
      setSetlists([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch setlists for the band
      const { data: setlistData, error: setlistError } = await supabase
        .from('setlists')
        .select('*')
        .eq('band_id', bandId)
        .order('created_at', { ascending: false });

      if (setlistError) throw setlistError;

      if (!setlistData || setlistData.length === 0) {
        setSetlists([]);
        setIsLoading(false);
        return;
      }

      // Fetch songs for all setlists
      const setlistIds = setlistData.map((s) => s.id);
      const { data: setlistSongs, error: songsError } = await supabase
        .from('setlist_songs')
        .select(`
          *,
          songs:song_id (
            id,
            title,
            artist,
            instrument,
            artwork_url
          )
        `)
        .in('setlist_id', setlistIds)
        .order('position', { ascending: true });

      if (songsError) throw songsError;

      // Group songs by setlist
      const songsBySetlist = new Map<string, SetlistSongWithDetails[]>();
      setlistSongs?.forEach((ss: any) => {
        const songDetails: SetlistSongWithDetails = {
          id: ss.id,
          setlist_id: ss.setlist_id,
          song_id: ss.song_id,
          position: ss.position,
          added_by: ss.added_by,
          added_at: ss.added_at,
          title: ss.songs?.title || 'Unknown',
          artist: ss.songs?.artist || 'Unknown',
          instrument: ss.songs?.instrument || 'Unknown',
          artwork_url: ss.songs?.artwork_url || null,
        };

        const existing = songsBySetlist.get(ss.setlist_id) || [];
        existing.push(songDetails);
        songsBySetlist.set(ss.setlist_id, existing);
      });

      // Combine setlists with their songs
      const enrichedSetlists: SetlistWithSongs[] = setlistData.map((setlist) => ({
        ...setlist,
        songs: songsBySetlist.get(setlist.id) || [],
        song_count: (songsBySetlist.get(setlist.id) || []).length,
      }));

      setSetlists(enrichedSetlists);
    } catch (err) {
      console.error('Error loading setlists:', err);
      setError(err instanceof Error ? err.message : 'Failed to load setlists');
    } finally {
      setIsLoading(false);
    }
  }, [bandId]);

  // Initial load
  useEffect(() => {
    loadSetlists();
  }, [loadSetlists]);

  /**
   * Create a new setlist
   */
  const createSetlist = useCallback(async (
    bandId: string,
    name: string,
    venue?: string,
    gigDate?: string
  ): Promise<Setlist | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check setlist limit
      const { count, error: countError } = await supabase
        .from('setlists')
        .select('*', { count: 'exact', head: true })
        .eq('band_id', bandId);

      if (countError) throw countError;

      if (count && count >= MAX_SETLISTS_PER_BAND) {
        throw new Error(`Maximum ${MAX_SETLISTS_PER_BAND} setlists per band`);
      }

      // Create setlist
      const { data: setlist, error: createError } = await supabase
        .from('setlists')
        .insert({
          band_id: bandId,
          name: name.trim(),
          venue: venue?.trim() || null,
          gig_date: gigDate || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (createError) throw createError;

      await loadSetlists();
      return setlist;
    } catch (err) {
      console.error('Error creating setlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to create setlist');
      return null;
    }
  }, [loadSetlists]);

  /**
   * Update a setlist
   */
  const updateSetlist = useCallback(async (
    setlistId: string,
    updates: { name?: string; venue?: string; gig_date?: string | null }
  ): Promise<boolean> => {
    try {
      const cleanUpdates: Record<string, any> = {};
      if (updates.name !== undefined) cleanUpdates.name = updates.name.trim();
      if (updates.venue !== undefined) cleanUpdates.venue = updates.venue?.trim() || null;
      if (updates.gig_date !== undefined) cleanUpdates.gig_date = updates.gig_date;

      const { error: updateError } = await supabase
        .from('setlists')
        .update(cleanUpdates)
        .eq('id', setlistId);

      if (updateError) throw updateError;

      await loadSetlists();
      return true;
    } catch (err) {
      console.error('Error updating setlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to update setlist');
      return false;
    }
  }, [loadSetlists]);

  /**
   * Delete a setlist
   */
  const deleteSetlist = useCallback(async (setlistId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('setlists')
        .delete()
        .eq('id', setlistId);

      if (deleteError) throw deleteError;

      await loadSetlists();
      return true;
    } catch (err) {
      console.error('Error deleting setlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete setlist');
      return false;
    }
  }, [loadSetlists]);

  /**
   * Add a song to a setlist
   */
  const addSongToSetlist = useCallback(async (
    setlistId: string,
    songId: string
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get next position
      const { data: existing, error: posError } = await supabase
        .from('setlist_songs')
        .select('position')
        .eq('setlist_id', setlistId)
        .order('position', { ascending: false })
        .limit(1);

      if (posError) throw posError;

      const nextPosition = (existing?.[0]?.position ?? -1) + 1;

      // Add song
      const { error: addError } = await supabase
        .from('setlist_songs')
        .insert({
          setlist_id: setlistId,
          song_id: songId,
          position: nextPosition,
          added_by: user.id,
        });

      if (addError) {
        if (addError.code === '23505') { // Unique violation
          throw new Error('Song is already in this setlist');
        }
        throw addError;
      }

      await loadSetlists();
      return true;
    } catch (err) {
      console.error('Error adding song to setlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to add song');
      return false;
    }
  }, [loadSetlists]);

  /**
   * Remove a song from a setlist
   */
  const removeSongFromSetlist = useCallback(async (
    setlistId: string,
    songId: string
  ): Promise<boolean> => {
    try {
      const { error: removeError } = await supabase
        .from('setlist_songs')
        .delete()
        .eq('setlist_id', setlistId)
        .eq('song_id', songId);

      if (removeError) throw removeError;

      await loadSetlists();
      return true;
    } catch (err) {
      console.error('Error removing song from setlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove song');
      return false;
    }
  }, [loadSetlists]);

  /**
   * Reorder songs in a setlist
   */
  const reorderSongs = useCallback(async (
    setlistId: string,
    songIds: string[]
  ): Promise<boolean> => {
    try {
      // Update positions for each song
      const updates = songIds.map((songId, index) => ({
        setlist_id: setlistId,
        song_id: songId,
        position: index,
      }));

      // Use upsert to update positions
      for (let i = 0; i < updates.length; i++) {
        const { error } = await supabase
          .from('setlist_songs')
          .update({ position: updates[i].position })
          .eq('setlist_id', updates[i].setlist_id)
          .eq('song_id', updates[i].song_id);

        if (error) throw error;
      }

      await loadSetlists();
      return true;
    } catch (err) {
      console.error('Error reordering songs:', err);
      setError(err instanceof Error ? err.message : 'Failed to reorder songs');
      return false;
    }
  }, [loadSetlists]);

  return {
    setlists,
    isLoading,
    error,
    refresh: loadSetlists,
    createSetlist,
    updateSetlist,
    deleteSetlist,
    addSongToSetlist,
    removeSongFromSetlist,
    reorderSongs,
  };
}
