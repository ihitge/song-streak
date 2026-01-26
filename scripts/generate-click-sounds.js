/**
 * Generate Metronome Click Sounds
 *
 * Creates woodblock-style click sounds as WAV files for the metronome.
 * Characteristics:
 * - Sharp transient (0-5ms attack)
 * - High frequency content (>5kHz to cut through instruments)
 * - Short duration (~50ms)
 *
 * Run with: node scripts/generate-click-sounds.js
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const BITS_PER_SAMPLE = 16;
const NUM_CHANNELS = 1;

/**
 * Write a WAV file header
 */
function writeWavHeader(dataView, numSamples) {
  const bytesPerSample = BITS_PER_SAMPLE / 8;
  const blockAlign = NUM_CHANNELS * bytesPerSample;
  const byteRate = SAMPLE_RATE * blockAlign;
  const dataSize = numSamples * blockAlign;
  const fileSize = 36 + dataSize;

  // RIFF header
  writeString(dataView, 0, 'RIFF');
  dataView.setUint32(4, fileSize, true);
  writeString(dataView, 8, 'WAVE');

  // fmt chunk
  writeString(dataView, 12, 'fmt ');
  dataView.setUint32(16, 16, true); // fmt chunk size
  dataView.setUint16(20, 1, true); // PCM format
  dataView.setUint16(22, NUM_CHANNELS, true);
  dataView.setUint32(24, SAMPLE_RATE, true);
  dataView.setUint32(28, byteRate, true);
  dataView.setUint16(32, blockAlign, true);
  dataView.setUint16(34, BITS_PER_SAMPLE, true);

  // data chunk
  writeString(dataView, 36, 'data');
  dataView.setUint32(40, dataSize, true);
}

function writeString(dataView, offset, str) {
  for (let i = 0; i < str.length; i++) {
    dataView.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Generate a woodblock-style click sound
 *
 * Uses a combination of:
 * - Sharp noise burst for attack
 * - Resonant filtered decay
 * - High-frequency emphasis
 */
function generateWoodblockClick(frequency, amplitude, duration) {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  // Attack time in samples (very short - 2ms)
  const attackSamples = Math.floor(SAMPLE_RATE * 0.002);

  // Multiple harmonics for rich "woody" tone
  const fundamentalFreq = frequency;
  const harmonics = [
    { freq: fundamentalFreq, amp: 1.0 },
    { freq: fundamentalFreq * 2.4, amp: 0.6 }, // Non-integer for inharmonicity
    { freq: fundamentalFreq * 4.2, amp: 0.3 },
    { freq: fundamentalFreq * 6.8, amp: 0.15 },
    { freq: fundamentalFreq * 9.5, amp: 0.08 },
  ];

  // Decay constant (exponential decay)
  const decayConstant = -6 / duration; // Decay to ~-60dB at end

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;

    // Envelope: sharp attack, exponential decay
    let envelope;
    if (i < attackSamples) {
      // Quick attack with slight overshoot
      envelope = (i / attackSamples) * 1.2;
    } else {
      // Exponential decay
      const decayTime = t - attackSamples / SAMPLE_RATE;
      envelope = Math.exp(decayConstant * decayTime);
    }

    // Combine harmonics
    let sample = 0;
    for (const h of harmonics) {
      // Add slight pitch drop for natural woodblock sound
      const pitchDrop = 1 - t * 0.1;
      sample += h.amp * Math.sin(2 * Math.PI * h.freq * pitchDrop * t);
    }

    // Add noise transient in the attack
    if (i < attackSamples * 2) {
      const noiseEnv = 1 - i / (attackSamples * 2);
      sample += (Math.random() * 2 - 1) * noiseEnv * 0.4;
    }

    // High-pass filter simulation (emphasize higher frequencies)
    // Done by reducing low frequency contribution over time
    const highPassFactor = Math.min(1, t * 50 + 0.5);

    samples[i] = sample * envelope * amplitude * highPassFactor;
  }

  // Normalize and apply final limiting
  let maxAbs = 0;
  for (let i = 0; i < samples.length; i++) {
    maxAbs = Math.max(maxAbs, Math.abs(samples[i]));
  }
  if (maxAbs > 0) {
    const normalizeGain = 0.9 / maxAbs; // Leave headroom
    for (let i = 0; i < samples.length; i++) {
      samples[i] *= normalizeGain;
    }
  }

  return samples;
}

/**
 * Convert Float32Array to WAV buffer
 */
function samplesToWavBuffer(samples) {
  const headerSize = 44;
  const bytesPerSample = BITS_PER_SAMPLE / 8;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(headerSize + dataSize);
  const dataView = new DataView(buffer);

  writeWavHeader(dataView, samples.length);

  // Write samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    dataView.setInt16(offset, intSample, true);
    offset += 2;
  }

  return Buffer.from(buffer);
}

// Generate the sounds
const outputDir = path.join(__dirname, '..', 'assets', 'audio');

// Accent click (downbeat) - higher pitch, louder
const accentSamples = generateWoodblockClick(2800, 1.0, 0.05); // 2.8kHz fundamental, 50ms
const accentWav = samplesToWavBuffer(accentSamples);
fs.writeFileSync(path.join(outputDir, 'metronome-click-accent.wav'), accentWav);
console.log('Generated: metronome-click-accent.wav');

// Normal tick - slightly lower pitch, softer
const tickSamples = generateWoodblockClick(2200, 0.8, 0.04); // 2.2kHz fundamental, 40ms
const tickWav = samplesToWavBuffer(tickSamples);
fs.writeFileSync(path.join(outputDir, 'metronome-click-tick.wav'), tickWav);
console.log('Generated: metronome-click-tick.wav');

console.log('\nDone! Audio files created in assets/audio/');
