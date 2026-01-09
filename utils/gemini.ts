/**
 * Gemini API Integration for Video Analysis
 * Analyzes YouTube/video URLs to extract song metadata using multimodal AI
 */
import Constants from 'expo-constants';

export interface GeminiAnalysisResponse {
  title: string;
  artist: string;
  instrument: 'Guitar' | 'Bass';
  theoryData: {
    tuning: string;
    key: string;
    tempo: string;
    timeSignature: string;
    chords: string[];
    scales: string[];
  };
  practiceData: {
    difficulty: string;
    techniques: string[];
    strummingPattern?: string;
  };
}

/**
 * Detect video platform from URL
 */
type VideoPlatform = 'youtube' | 'instagram' | 'tiktok' | 'other';

function detectVideoPlatform(url: string): VideoPlatform {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube';
    if (hostname.includes('instagram.com')) return 'instagram';
    if (hostname.includes('tiktok.com')) return 'tiktok';
    return 'other';
  } catch {
    return 'other';
  }
}

/**
 * Function declaration schema for structured output
 * This forces Gemini to return data in a predictable JSON format
 */
const extractSongTheoryFunction = {
  name: 'extract_song_theory',
  description: 'Extract song metadata and music theory from a video tutorial. Analyze the video content including title, description, audio, and visual elements to identify the song being taught.',
  parameters: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'The actual song title being taught (not the video title)',
      },
      artist: {
        type: 'string',
        description: 'The original artist who performs the song (not the tutorial creator)',
      },
      instrument: {
        type: 'string',
        enum: ['Guitar', 'Bass'],
        description: 'The primary instrument being taught in the tutorial (Guitar or Bass only)',
      },
      theoryData: {
        type: 'object',
        properties: {
          tuning: {
            type: 'string',
            description: 'The guitar/bass tuning (e.g., "Standard", "Drop D", "Half Step Down", "DADGAD"). Default to "Standard" if not mentioned.',
          },
          key: {
            type: 'string',
            description: 'The musical key of the song (e.g., "A Minor", "G Major")',
          },
          tempo: {
            type: 'string',
            description: 'The tempo in BPM (e.g., "120 BPM")',
          },
          timeSignature: {
            type: 'string',
            description: 'The time signature (e.g., "4/4", "3/4", "6/8")',
          },
          chords: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of chords used in the song (e.g., ["Am", "G", "C", "F"])',
          },
          scales: {
            type: 'array',
            items: { type: 'string' },
            description: 'Scales used in the song (e.g., ["A Minor Pentatonic", "A Natural Minor"])',
          },
        },
        required: ['tuning', 'key', 'tempo', 'timeSignature', 'chords', 'scales'],
      },
      practiceData: {
        type: 'object',
        properties: {
          difficulty: {
            type: 'string',
            enum: ['Easy', 'Medium', 'Hard'],
            description: 'Difficulty level based on techniques required',
          },
          techniques: {
            type: 'array',
            items: { type: 'string' },
            description: 'Techniques used (e.g., ["Fingerpicking", "Barre Chords", "Hammer-ons"])',
          },
          strummingPattern: {
            type: 'string',
            description: 'The strumming or picking pattern if applicable (e.g., "D DU UDU")',
          },
        },
        required: ['difficulty', 'techniques'],
      },
    },
    required: ['title', 'artist', 'instrument', 'theoryData', 'practiceData'],
  },
};

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
 * Analyze a video URL using Gemini API with multimodal processing
 * Uses tool calling for reliable structured output
 *
 * @param videoUrl - YouTube or video URL to analyze
 * @returns Promise with analyzed song data
 * @throws Error if API call fails with error code prefix
 */
export async function analyzeVideoWithGemini(
  videoUrl: string
): Promise<GeminiAnalysisResponse> {
  try {
    // Get config from expo-constants (works in EAS builds) with fallback to process.env (works in dev)
    const apiUrl = Constants.expoConfig?.extra?.geminiApiUrl || process.env.EXPO_PUBLIC_GEMINI_API_URL || '';
    const apiKey = Constants.expoConfig?.extra?.geminiApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

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

    // Detect platform to determine the best approach
    const platform = detectVideoPlatform(videoUrl);
    console.log(`Detected platform: ${platform} for URL: ${videoUrl}`);

    const prompt = `Watch and analyze this music tutorial video. Extract the song being taught, including:
- The actual song title and original artist
- The instrument being taught
- Music theory: key, tempo, time signature, chords used, scales used
- Practice info: difficulty level, techniques required, strumming/picking pattern

Analyze the video title, description, audio content, and any visible chord diagrams or tablature.`;

    // Build request body based on platform
    let requestBody: object;

    if (platform === 'youtube') {
      // YouTube: Use file_data with file_uri (snake_case per Gemini API spec)
      // Note: YouTube URLs do NOT need mimeType - only uploaded files need it
      console.log('Using YouTube multimodal approach with file_data');
      requestBody = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                file_data: {
                  file_uri: videoUrl,
                },
              },
            ],
          },
        ],
        tools: [
          {
            functionDeclarations: [extractSongTheoryFunction],
          },
        ],
        toolConfig: {
          functionCallingConfig: {
            mode: 'ANY',
            allowedFunctionNames: ['extract_song_theory'],
          },
        },
      };
    } else {
      // Other platforms: Use url_context tool to fetch page content
      console.log('Using url_context tool approach for:', platform);
      requestBody = {
        contents: [
          {
            parts: [
              { text: `${prompt}\n\nVideo URL to analyze: ${videoUrl}` },
            ],
          },
        ],
        tools: [
          { urlContext: {} },
          { functionDeclarations: [extractSongTheoryFunction] },
        ],
        toolConfig: {
          functionCallingConfig: {
            mode: 'ANY',
            allowedFunctionNames: ['extract_song_theory'],
          },
        },
      };
    }

    console.log('Sending request to Gemini API...');

    // Wrap API call in retry logic for quota handling
    const response = await retryWithBackoff(async () => {
      return await fetch(`${apiUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Gemini API error response:', errorData);

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
    console.log('Gemini API raw response:', JSON.stringify(data, null, 2));

    // Try to extract function call response (preferred - structured output)
    const parts = data.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.functionCall?.name === 'extract_song_theory') {
        const args = part.functionCall.args;
        console.log('Extracted via function call:', args);

        // Ensure arrays exist even if empty
        const result: GeminiAnalysisResponse = {
          title: args.title || 'Unknown',
          artist: args.artist || 'Unknown',
          instrument: args.instrument || 'Guitar',
          theoryData: {
            tuning: args.theoryData?.tuning || 'Standard',
            key: args.theoryData?.key || 'Unknown',
            tempo: args.theoryData?.tempo || 'Unknown',
            timeSignature: args.theoryData?.timeSignature || '4/4',
            chords: args.theoryData?.chords || [],
            scales: args.theoryData?.scales || [],
          },
          practiceData: {
            difficulty: args.practiceData?.difficulty || 'Medium',
            techniques: args.practiceData?.techniques || [],
            strummingPattern: args.practiceData?.strummingPattern,
          },
        };

        return result;
      }
    }

    // Fallback: Try to parse text response as JSON (legacy behavior)
    const textContent = parts.find((p: { text?: string }) => p.text)?.text;
    if (textContent) {
      console.log('Falling back to text parsing:', textContent);

      // Parse JSON from response (handle markdown code blocks)
      let jsonMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      let jsonString = jsonMatch ? jsonMatch[1] : textContent;
      jsonString = jsonString.trim();

      try {
        const parsed = JSON.parse(jsonString);

        // Normalize to our expected format
        const result: GeminiAnalysisResponse = {
          title: parsed.title || 'Unknown',
          artist: parsed.artist || 'Unknown',
          instrument: parsed.instrument || 'Guitar',
          theoryData: {
            tuning: parsed.theoryData?.tuning || parsed.tuning || 'Standard',
            key: parsed.theoryData?.key || parsed.key || 'Unknown',
            tempo: parsed.theoryData?.tempo || parsed.tempo || 'Unknown',
            timeSignature: parsed.theoryData?.timeSignature || parsed.timeSignature || '4/4',
            chords: parsed.theoryData?.chords || parsed.chords || [],
            scales: parsed.theoryData?.scales || parsed.scales || [],
          },
          practiceData: {
            difficulty: parsed.practiceData?.difficulty || parsed.difficulty || 'Medium',
            techniques: parsed.practiceData?.techniques || parsed.techniques || [],
            strummingPattern: parsed.practiceData?.strummingPattern || parsed.strummingPattern,
          },
        };

        console.log('Parsed from text response:', result);
        return result;
      } catch (parseError) {
        console.error('Failed to parse text response as JSON:', parseError);
      }
    }

    throw new Error('PARSE_ERROR: Could not extract song data from Gemini response');
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
    title: 'Sample Song',
    artist: 'Sample Artist',
    instrument: 'Guitar',
    theoryData: {
      tuning: 'Standard',
      key: 'A Minor',
      tempo: '120 BPM',
      timeSignature: '4/4',
      chords: ['Am', 'G', 'C', 'F'],
      scales: ['A Minor Pentatonic'],
    },
    practiceData: {
      difficulty: 'Medium',
      techniques: ['Fingerpicking', 'Hammer-ons', 'Pull-offs'],
      strummingPattern: 'D DU UDU',
    },
  };
}
