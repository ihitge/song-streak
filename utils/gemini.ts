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
 * Analyze a video URL using Gemini API
 * Extracts: title, artist, instrument, key, tempo, time signature, difficulty, techniques
 *
 * @param videoUrl - YouTube or video URL to analyze
 * @returns Promise with analyzed song data
 * @throws Error if API call fails
 */
export async function analyzeVideoWithGemini(
  videoUrl: string
): Promise<GeminiAnalysisResponse> {
  try {
    const apiUrl = process.env.EXPO_PUBLIC_GEMINI_API_URL || '';
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

    if (!apiUrl || !apiKey) {
      throw new Error('Gemini API configuration missing');
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

    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
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

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
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
