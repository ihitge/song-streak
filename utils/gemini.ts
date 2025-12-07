/**
 * Gemini API Integration for Video Analysis
 * Analyzes YouTube/video URLs to extract song metadata
 */

export interface GeminiAnalysisResponse {
  title: string;
  artist: string;
  instrument: 'Guitar' | 'Bass' | 'Drums' | 'Keys';
  theoryData: {
    key: string;
    tempo: string;
    timeSignature: string;
  };
  practiceData: {
    difficulty: string;
    techniques: string[];
  };
}

/**
 * Retry a function with exponential backoff
 * Used for retrying on quota exceeded (429) errors
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  initialDelay: number = 2000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry non-retryable errors
      if (!lastError.message.includes('QUOTA_EXCEEDED')) {
        throw lastError;
      }

      // Don't wait after last attempt
      if (i < maxRetries) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Quota exceeded. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * Analyze a video URL using Gemini API
 * Extracts: title, artist, instrument, key, tempo, time signature, difficulty, techniques
 *
 * @param videoUrl - YouTube or video URL to analyze
 * @returns Promise with analyzed song data
 * @throws Error if API call fails with error code prefix (e.g., "MODEL_NOT_FOUND:", "QUOTA_EXCEEDED:")
 */
export async function analyzeVideoWithGemini(
  videoUrl: string
): Promise<GeminiAnalysisResponse> {
  try {
    const apiUrl = process.env.EXPO_PUBLIC_GEMINI_API_URL || '';
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

    if (!apiUrl || !apiKey) {
      throw new Error('CONFIG_ERROR: Gemini API configuration missing. Check your environment variables.');
    }

    // Validate video URL format
    if (!videoUrl || !videoUrl.trim()) {
      throw new Error('VALIDATION_ERROR: Video URL is required');
    }

    // Basic URL validation
    try {
      new URL(videoUrl);
    } catch {
      throw new Error('VALIDATION_ERROR: Invalid video URL format. Please provide a valid URL.');
    }

    const prompt = `Analyze this music video URL and extract the following information:

Video URL: ${videoUrl}

Extract and return ONLY a JSON object (no markdown, no extra text) with this exact structure:
{
  "title": "song title",
  "artist": "artist name",
  "instrument": "Guitar|Bass|Drums|Keys",
  "theoryData": {
    "key": "musical key (e.g., 'A Minor')",
    "tempo": "tempo in BPM (e.g., '120 BPM')",
    "timeSignature": "time signature (e.g., '4/4')"
  },
  "practiceData": {
    "difficulty": "Easy|Medium|Hard",
    "techniques": ["technique1", "technique2"]
  }
}

IMPORTANT: Return ONLY the JSON object, nothing else.`;

    // Wrap API call in retry logic for quota handling
    const response = await retryWithBackoff(async () => {
      return await fetch(`${apiUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      if (response.status === 404) {
        throw new Error('MODEL_NOT_FOUND: The Gemini model is not available. Please verify your API URL configuration is correct.');
      } else if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '60';
        throw new Error(`QUOTA_EXCEEDED: API quota exhausted. Please try again in ${retryAfter} seconds or upgrade your plan.`);
      } else if (response.status === 401 || response.status === 403) {
        throw new Error('AUTH_ERROR: Invalid API key or insufficient permissions. Please check your credentials.');
      } else {
        const message = errorData?.error?.message || response.statusText;
        throw new Error(`GEMINI_API_ERROR: ${message}`);
      }
    }

    const data = await response.json();

    // Extract the text response from Gemini
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) {
      throw new Error('Invalid Gemini API response structure');
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    let jsonString = jsonMatch ? jsonMatch[1] : textContent;

    // Clean up the JSON string
    jsonString = jsonString.trim();

    const result = JSON.parse(jsonString);

    // Validate required fields
    if (!result.title || !result.artist || !result.instrument || !result.theoryData || !result.practiceData) {
      throw new Error('Gemini response missing required fields');
    }

    return result as GeminiAnalysisResponse;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

/**
 * Mock implementation for development/testing
 * Returns realistic sample data
 */
export function getMockGeminiResponse(): GeminiAnalysisResponse {
  return {
    title: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    instrument: 'Guitar',
    theoryData: {
      key: 'A Minor',
      tempo: '76 BPM',
      timeSignature: '4/4',
    },
    practiceData: {
      difficulty: 'Hard',
      techniques: ['Fingerpicking', 'Hammer-ons', 'Pull-offs', 'Barre Chords'],
    },
  };
}
