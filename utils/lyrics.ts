/**
 * Lyrics Fetching Utility
 * Fetches song lyrics from free internet APIs using a waterfall approach:
 * 1. Lyrics.ovh (simplest, no auth)
 * 2. LRCLIB (better search, synced lyrics)
 * 3. Gemini API fallback (web search)
 */

const LYRICS_OVH_BASE = 'https://api.lyrics.ovh/v1';
const LRCLIB_BASE = 'https://lrclib.net/api';

// Timeout for iOS network reliability - external APIs should fail fast
const FETCH_TIMEOUT_MS = 10000;

/**
 * Fetch with timeout for iOS network edge cases
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

interface LrclibResult {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics: string | null;
  syncedLyrics: string | null;
}

/**
 * Main function to fetch lyrics with waterfall fallback
 */
export async function fetchLyrics(title: string, artist: string): Promise<string | null> {
  console.log(`🎵 Fetching lyrics for "${title}" by ${artist}`);

  // Try Lyrics.ovh first (simplest API)
  const lyricsOvh = await tryLyricsOvh(title, artist);
  if (lyricsOvh) {
    console.log('✅ Found lyrics via Lyrics.ovh');
    return lyricsOvh;
  }

  // Try LRCLIB second (better search)
  const lrclib = await tryLrclib(title, artist);
  if (lrclib) {
    console.log('✅ Found lyrics via LRCLIB');
    return lrclib;
  }

  // No lyrics found
  console.log('❌ No lyrics found from any source');
  return null;
}

/**
 * Try fetching from Lyrics.ovh
 * Endpoint: GET https://api.lyrics.ovh/v1/{artist}/{title}
 */
async function tryLyricsOvh(title: string, artist: string): Promise<string | null> {
  try {
    // URL encode the artist and title
    const encodedArtist = encodeURIComponent(artist.trim());
    const encodedTitle = encodeURIComponent(title.trim());

    const url = `${LYRICS_OVH_BASE}/${encodedArtist}/${encodedTitle}`;
    console.log(`📡 Trying Lyrics.ovh: ${url}`);

    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`⚠️ Lyrics.ovh returned ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.lyrics && data.lyrics.trim()) {
      return data.lyrics.trim();
    }

    return null;
  } catch (error) {
    console.error('❌ Lyrics.ovh error:', error);
    return null;
  }
}

/**
 * Try fetching from LRCLIB
 * Endpoint: GET https://lrclib.net/api/search?track_name={title}&artist_name={artist}
 */
async function tryLrclib(title: string, artist: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      track_name: title.trim(),
      artist_name: artist.trim(),
    });

    const url = `${LRCLIB_BASE}/search?${params.toString()}`;
    console.log(`📡 Trying LRCLIB: ${url}`);

    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SongStreak/1.0 (https://songstreak.app)',
      },
    });

    if (!response.ok) {
      console.log(`⚠️ LRCLIB returned ${response.status}`);
      return null;
    }

    const results: LrclibResult[] = await response.json();

    if (!results || results.length === 0) {
      console.log('⚠️ LRCLIB returned no results');
      return null;
    }

    // Find the first result with plain lyrics (prefer non-instrumental)
    const withLyrics = results.find(r => !r.instrumental && r.plainLyrics);
    if (withLyrics?.plainLyrics) {
      return withLyrics.plainLyrics.trim();
    }

    // Fall back to synced lyrics if no plain lyrics
    const withSynced = results.find(r => !r.instrumental && r.syncedLyrics);
    if (withSynced?.syncedLyrics) {
      // Convert synced lyrics (LRC format) to plain text
      return convertLrcToPlain(withSynced.syncedLyrics);
    }

    return null;
  } catch (error) {
    console.error('❌ LRCLIB error:', error);
    return null;
  }
}

/**
 * Convert LRC (synced) lyrics format to plain text
 * LRC format: [00:12.34]Line of lyrics
 */
function convertLrcToPlain(lrcLyrics: string): string {
  return lrcLyrics
    .split('\n')
    .map(line => {
      // Remove timestamp prefix like [00:12.34]
      return line.replace(/^\[\d{2}:\d{2}\.\d{2,3}\]\s*/, '');
    })
    .filter(line => line.trim()) // Remove empty lines
    .join('\n');
}
