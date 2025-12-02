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

export const fetchAlbumArtwork = async (title: string, artist: string): Promise<ArtworkResult> => {
  try {
    // Construct search term
    const term = encodeURIComponent(`${artist} ${title}`);
    const url = `https://itunes.apple.com/search?term=${term}&entity=song&limit=1`;

    const response = await fetch(url);
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
