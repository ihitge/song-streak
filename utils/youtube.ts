/**
 * YouTube URL Utilities
 * Extracts video IDs and generates thumbnail/embed URLs from YouTube links
 */

/**
 * Extract video ID from various YouTube URL formats
 * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/shorts/
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    if (!hostname.includes('youtube.com') && !hostname.includes('youtu.be')) {
      return null;
    }

    // youtu.be/VIDEO_ID
    if (hostname.includes('youtu.be')) {
      const videoId = urlObj.pathname.slice(1).split('?')[0];
      return videoId?.length === 11 ? videoId : null;
    }

    // youtube.com/watch?v=VIDEO_ID
    const vParam = urlObj.searchParams.get('v');
    if (vParam?.length === 11) return vParam;

    // youtube.com/embed/VIDEO_ID or /shorts/VIDEO_ID or /v/VIDEO_ID
    const pathMatch = urlObj.pathname.match(/\/(embed|shorts|v)\/([a-zA-Z0-9_-]{11})/);
    if (pathMatch) return pathMatch[2];

    return null;
  } catch {
    return null;
  }
}

export type YouTubeThumbnailQuality = 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault';

/**
 * Generate YouTube thumbnail URL
 * Quality options:
 * - 'default' (120x90)
 * - 'mqdefault' (320x180)
 * - 'hqdefault' (480x360)
 * - 'sddefault' (640x480) - may not exist for all videos
 * - 'maxresdefault' (1280x720) - may not exist for all videos
 */
export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: YouTubeThumbnailQuality = 'hqdefault'
): string | null {
  if (!videoId || videoId.length !== 11) return null;
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Generate YouTube embed URL with player parameters
 * @param videoId - YouTube video ID (11 characters)
 * @returns Embed URL with optimal parameters for in-app playback
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  const params = new URLSearchParams({
    playsinline: '1',      // Play inline on mobile (not fullscreen by default)
    rel: '0',              // Don't show related videos from other channels
    modestbranding: '1',   // Minimal YouTube branding
    enablejsapi: '1',      // Enable JavaScript API for potential future control
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Check if URL is a valid YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}

/**
 * Get thumbnail URL directly from a YouTube video URL
 * Convenience function that combines extractVideoId + getThumbnailUrl
 */
export function getYouTubeThumbnailFromUrl(
  url: string,
  quality: YouTubeThumbnailQuality = 'hqdefault'
): string | null {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;
  return getYouTubeThumbnailUrl(videoId, quality);
}
