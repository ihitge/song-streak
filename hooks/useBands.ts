import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabase/client';
import {
  Band,
  BandWithMemberCount,
  BandMember,
  BandMemberRole,
  generateJoinCode,
  MAX_SETLISTS_PER_BAND,
} from '@/types/band';

interface UseBandsReturn {
  bands: BandWithMemberCount[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createBand: (name: string) => Promise<Band | null>;
  joinBandByCode: (joinCode: string) => Promise<Band | null>;
  leaveBand: (bandId: string) => Promise<boolean>;
  deleteBand: (bandId: string) => Promise<boolean>;
  regenerateJoinCode: (bandId: string) => Promise<string | null>;
}

/**
 * Hook to manage user's bands
 */
export function useBands(): UseBandsReturn {
  const [bands, setBands] = useState<BandWithMemberCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's bands with member and setlist counts
  const loadBands = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setBands([]);
        setIsLoading(false);
        return;
      }

      // Get all bands user is a member of
      const { data: memberData, error: memberError } = await supabase
        .from('band_members')
        .select('band_id, role')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      if (!memberData || memberData.length === 0) {
        setBands([]);
        setIsLoading(false);
        return;
      }

      const bandIds = memberData.map((m) => m.band_id);
      const roleMap = new Map(memberData.map((m) => [m.band_id, m.role as BandMemberRole]));

      // Fetch band details
      const { data: bandsData, error: bandsError } = await supabase
        .from('bands')
        .select('*')
        .in('id', bandIds);

      if (bandsError) throw bandsError;

      // Fetch member counts for each band
      const { data: memberCounts, error: countError } = await supabase
        .from('band_members')
        .select('band_id')
        .in('band_id', bandIds);

      if (countError) throw countError;

      // Fetch setlist counts for each band
      const { data: setlistCounts, error: setlistError } = await supabase
        .from('setlists')
        .select('band_id')
        .in('band_id', bandIds);

      if (setlistError) throw setlistError;

      // Calculate counts
      const memberCountMap = new Map<string, number>();
      memberCounts?.forEach((m) => {
        memberCountMap.set(m.band_id, (memberCountMap.get(m.band_id) || 0) + 1);
      });

      const setlistCountMap = new Map<string, number>();
      setlistCounts?.forEach((s) => {
        setlistCountMap.set(s.band_id, (setlistCountMap.get(s.band_id) || 0) + 1);
      });

      // Combine data
      const enrichedBands: BandWithMemberCount[] = (bandsData || []).map((band) => ({
        ...band,
        member_count: memberCountMap.get(band.id) || 0,
        setlist_count: setlistCountMap.get(band.id) || 0,
        user_role: roleMap.get(band.id) || 'member',
      }));

      // Sort by name
      enrichedBands.sort((a, b) => a.name.localeCompare(b.name));

      setBands(enrichedBands);
    } catch (err) {
      console.error('Error loading bands:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bands');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadBands();
  }, [loadBands]);

  /**
   * Create a new band and add user as admin
   */
  const createBand = useCallback(async (name: string): Promise<Band | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate unique join code
      let joinCode = generateJoinCode();
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        const { data: existing } = await supabase
          .from('bands')
          .select('id')
          .eq('join_code', joinCode)
          .single();

        if (!existing) break;
        joinCode = generateJoinCode();
        attempts++;
      }

      if (attempts >= maxAttempts) {
        throw new Error('Failed to generate unique join code');
      }

      // Create the band
      const { data: band, error: bandError } = await supabase
        .from('bands')
        .insert({
          name: name.trim(),
          join_code: joinCode,
          created_by: user.id,
        })
        .select()
        .single();

      if (bandError) throw bandError;

      // Add creator as admin
      const { error: memberError } = await supabase
        .from('band_members')
        .insert({
          band_id: band.id,
          user_id: user.id,
          role: 'admin',
        });

      if (memberError) throw memberError;

      await loadBands();
      return band;
    } catch (err) {
      console.error('Error creating band:', err);
      setError(err instanceof Error ? err.message : 'Failed to create band');
      return null;
    }
  }, [loadBands]);

  /**
   * Join a band using a join code
   */
  const joinBandByCode = useCallback(async (joinCode: string): Promise<Band | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Find band by join code
      const normalizedCode = joinCode.replace(/[-\s]/g, '').toUpperCase();
      const { data: band, error: findError } = await supabase
        .from('bands')
        .select('*')
        .eq('join_code', normalizedCode)
        .single();

      if (findError || !band) {
        throw new Error('Invalid join code');
      }

      // Check if already a member
      const { data: existing } = await supabase
        .from('band_members')
        .select('id')
        .eq('band_id', band.id)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        throw new Error('You are already a member of this band');
      }

      // Join as member
      const { error: joinError } = await supabase
        .from('band_members')
        .insert({
          band_id: band.id,
          user_id: user.id,
          role: 'member',
        });

      if (joinError) throw joinError;

      await loadBands();
      return band;
    } catch (err) {
      console.error('Error joining band:', err);
      setError(err instanceof Error ? err.message : 'Failed to join band');
      return null;
    }
  }, [loadBands]);

  /**
   * Leave a band
   */
  const leaveBand = useCallback(async (bandId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user is the only admin
      const { data: admins, error: adminError } = await supabase
        .from('band_members')
        .select('id, user_id')
        .eq('band_id', bandId)
        .eq('role', 'admin');

      if (adminError) throw adminError;

      if (admins?.length === 1 && admins[0].user_id === user.id) {
        // Get total member count
        const { count, error: countError } = await supabase
          .from('band_members')
          .select('*', { count: 'exact', head: true })
          .eq('band_id', bandId);

        if (countError) throw countError;

        if (count && count > 1) {
          throw new Error('You must transfer admin role before leaving');
        }
        // If user is only member, delete the band
        await deleteBand(bandId);
        return true;
      }

      // Remove membership
      const { error: leaveError } = await supabase
        .from('band_members')
        .delete()
        .eq('band_id', bandId)
        .eq('user_id', user.id);

      if (leaveError) throw leaveError;

      await loadBands();
      return true;
    } catch (err) {
      console.error('Error leaving band:', err);
      setError(err instanceof Error ? err.message : 'Failed to leave band');
      return false;
    }
  }, [loadBands]);

  /**
   * Delete a band (admin only)
   */
  const deleteBand = useCallback(async (bandId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Verify user is admin
      const { data: membership, error: memberError } = await supabase
        .from('band_members')
        .select('role')
        .eq('band_id', bandId)
        .eq('user_id', user.id)
        .single();

      if (memberError || membership?.role !== 'admin') {
        throw new Error('Only admins can delete bands');
      }

      // Delete band (cascades to members, setlists, etc.)
      const { error: deleteError } = await supabase
        .from('bands')
        .delete()
        .eq('id', bandId);

      if (deleteError) throw deleteError;

      await loadBands();
      return true;
    } catch (err) {
      console.error('Error deleting band:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete band');
      return false;
    }
  }, [loadBands]);

  /**
   * Regenerate a band's join code (admin only)
   */
  const regenerateJoinCode = useCallback(async (bandId: string): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Verify user is admin
      const { data: membership, error: memberError } = await supabase
        .from('band_members')
        .select('role')
        .eq('band_id', bandId)
        .eq('user_id', user.id)
        .single();

      if (memberError || membership?.role !== 'admin') {
        throw new Error('Only admins can regenerate join codes');
      }

      // Generate new unique code
      let newCode = generateJoinCode();
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        const { data: existing } = await supabase
          .from('bands')
          .select('id')
          .eq('join_code', newCode)
          .neq('id', bandId)
          .single();

        if (!existing) break;
        newCode = generateJoinCode();
        attempts++;
      }

      if (attempts >= maxAttempts) {
        throw new Error('Failed to generate unique join code');
      }

      // Update band
      const { error: updateError } = await supabase
        .from('bands')
        .update({ join_code: newCode })
        .eq('id', bandId);

      if (updateError) throw updateError;

      await loadBands();
      return newCode;
    } catch (err) {
      console.error('Error regenerating join code:', err);
      setError(err instanceof Error ? err.message : 'Failed to regenerate join code');
      return null;
    }
  }, [loadBands]);

  return {
    bands,
    isLoading,
    error,
    refresh: loadBands,
    createBand,
    joinBandByCode,
    leaveBand,
    deleteBand,
    regenerateJoinCode,
  };
}
