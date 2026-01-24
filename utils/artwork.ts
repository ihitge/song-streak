/**
 * Artwork Utility
 * 
 * Service to fetch album artwork for songs.
 * Currently uses the iTunes Search API as a reliable, free source for high-quality cover art.
 * 
 * In a future iteration, this could be enhanced with Gemini's multimodal capabilities
 * or a more specialized music metadata provider.
 */

interface ArtworkResult {
  artworkUrl: string | null;
  source: 'itunes' | 'placeholder';
}

// Timeout for iOS network reliability - iTunes API should respond quickly
const FETCH_TIMEOUT_MS = 8000;

/**
 * Fetch with timeout for iOS network edge cases
 */
async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export const fetchAlbumArtwork = async (title: string, artist: string): Promise<ArtworkResult> => {
  try {
    // Construct search term
    const term = encodeURIComponent(`${artist} ${title}`);
    const url = `https://itunes.apple.com/search?term=${term}&entity=song&limit=1`;

    const response = await fetchWithTimeout(url);
    const data = await response.json();

    if (data.resultCount > 0 && data.results[0].artworkUrl100) {
      // Get higher resolution image (600x600)
      const artworkUrl = data.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
      return { artworkUrl, source: 'itunes' };
    }

    return { artworkUrl: null, source: 'placeholder' };
  } catch (error) {
    console.error('Error fetching artwork:', error);
    return { artworkUrl: null, source: 'placeholder' };
  }
};
