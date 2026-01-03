#!/usr/bin/env node

/**
 * Quick test script to check what Gemini API returns
 * Run: node test-gemini.js <video-url>
 * Example: node test-gemini.js "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 */

// Load .env file
require('dotenv').config();

const videoUrl = process.argv[2] || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const apiUrl = process.env.EXPO_PUBLIC_GEMINI_API_URL;

if (!apiKey || !apiUrl) {
  console.error('❌ Missing environment variables!');
  console.error('Make sure .env file has EXPO_PUBLIC_GEMINI_API_KEY and EXPO_PUBLIC_GEMINI_API_URL');
  process.exit(1);
}

console.log('🔍 Testing Gemini API...');
console.log(`Video URL: ${videoUrl}`);
console.log(`API URL: ${apiUrl}`);
console.log('---');

const prompt = `Analyze this music video URL and extract the following information:

Video URL: ${videoUrl}

Extract and return ONLY a JSON object (no markdown, no extra text) with this exact structure:
{
  "title": "song title",
  "artist": "artist name",
  "instrument": "Guitar|Bass",
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

fetch(`${apiUrl}?key=${apiKey}`, {
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
})
  .then(response => {
    console.log(`HTTP Status: ${response.status} ${response.statusText}`);
    return response.json();
  })
  .then(data => {
    console.log('\n📄 Full API Response:');
    console.log(JSON.stringify(data, null, 2));

    console.log('\n🔎 Extracting text content...');
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      console.error('❌ No text content found in response!');
      console.error('Expected structure: candidates[0].content.parts[0].text');
      process.exit(1);
    }

    console.log('📝 Gemini returned text:');
    console.log(textContent);

    console.log('\n🔨 Attempting to parse as JSON...');

    // Try to extract JSON from markdown code blocks
    let jsonMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    let jsonString = jsonMatch ? jsonMatch[1] : textContent;
    jsonString = jsonString.trim();

    console.log('JSON string to parse:');
    console.log(jsonString);

    try {
      const result = JSON.parse(jsonString);
      console.log('\n✅ Successfully parsed JSON!');
      console.log('Parsed result:');
      console.log(JSON.stringify(result, null, 2));

      // Validate required fields
      const required = ['title', 'artist', 'instrument', 'theoryData', 'practiceData'];
      const missing = required.filter(field => !result[field]);

      if (missing.length > 0) {
        console.warn(`\n⚠️ Missing required fields: ${missing.join(', ')}`);
      } else {
        console.log('\n✅ All required fields present!');
      }
    } catch (error) {
      console.error('\n❌ JSON parse error:');
      console.error(error.message);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ API request failed:');
    console.error(error);
    process.exit(1);
  });
