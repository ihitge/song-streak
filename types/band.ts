/**
 * Band & Setlist Types
 */

export type BandMemberRole = 'admin' | 'member';

export type BandInviteStatus = 'pending' | 'accepted' | 'declined';

export interface Band {
  id: string;
  name: string;
  join_code: string;
  created_by: string | null;
  created_at: string;
}

export interface BandMember {
  id: string;
  band_id: string;
  user_id: string;
  role: BandMemberRole;
  joined_at: string;
}

export interface BandInvite {
  id: string;
  band_id: string;
  email: string;
  invited_by: string | null;
  status: BandInviteStatus;
  created_at: string;
}

export interface Setlist {
  id: string;
  band_id: string;
  name: string;
  venue: string | null;
  gig_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SetlistSong {
  id: string;
  setlist_id: string;
  song_id: string;
  position: number;
  added_by: string | null;
  added_at: string;
}

// Extended types with joined data

export interface BandWithMemberCount extends Band {
  member_count: number;
  setlist_count: number;
  user_role: BandMemberRole;
}

export interface BandMemberWithProfile extends BandMember {
  email?: string;
  display_name?: string;
  avatar_url?: string;
}

export interface SetlistWithSongs extends Setlist {
  songs: SetlistSongWithDetails[];
  song_count: number;
}

export interface SetlistSongWithDetails extends SetlistSong {
  title: string;
  artist: string;
  instrument: string;
  artwork_url: string | null;
  added_by_name?: string;
}

// Constants
export const MAX_SETLISTS_PER_BAND = 5;
export const JOIN_CODE_LENGTH = 6;

/**
 * Generate a random 6-character alphanumeric join code
 */
export function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded I, O, 0, 1 to avoid confusion
  let code = '';
  for (let i = 0; i < JOIN_CODE_LENGTH; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Format a join code for display (e.g., "ABC-123")
 */
export function formatJoinCode(code: string): string {
  if (code.length !== 6) return code;
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

/**
 * Normalize a join code input (remove dashes, uppercase)
 */
export function normalizeJoinCode(input: string): string {
  return input.replace(/[-\s]/g, '').toUpperCase().slice(0, JOIN_CODE_LENGTH);
}

/**
 * Validate a join code format
 */
export function isValidJoinCode(code: string): boolean {
  const normalized = normalizeJoinCode(code);
  return normalized.length === JOIN_CODE_LENGTH && /^[A-Z0-9]+$/.test(normalized);
}
