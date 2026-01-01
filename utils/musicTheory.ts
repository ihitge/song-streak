/**
 * Music Theory Utilities
 * Circle of Fifths data, scale calculations, and mode definitions
 */

// Circle of Fifths - clockwise from C (12 o'clock position)
export const CIRCLE_OF_FIFTHS_MAJOR = [
  'C', 'G', 'D', 'A', 'E', 'B', 'F#/Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F'
] as const;

// Relative minors (same position as their relative major)
export const CIRCLE_OF_FIFTHS_MINOR = [
  'Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m/Ebm', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'
] as const;

// Number of sharps/flats for each key (positive = sharps, negative = flats)
export const KEY_SIGNATURES: Record<string, number> = {
  'C': 0, 'Am': 0,
  'G': 1, 'Em': 1,
  'D': 2, 'Bm': 2,
  'A': 3, 'F#m': 3,
  'E': 4, 'C#m': 4,
  'B': 5, 'G#m': 5,
  'F#': 6, 'Gb': -6, 'D#m': 6, 'Ebm': -6,
  'Db': -5, 'Bbm': -5,
  'Ab': -4, 'Fm': -4,
  'Eb': -3, 'Cm': -3,
  'Bb': -2, 'Gm': -2,
  'F': -1, 'Dm': -1,
};

// All 7 modes with their scale degree patterns (semitones from root)
export const MODES = {
  lydian: {
    name: 'Lydian',
    pattern: [0, 2, 4, 6, 7, 9, 11], // W-W-W-H-W-W-H
    description: 'Bright, dreamy',
    chordQuality: 'maj7#11',
    degreeFromMajor: 4, // IV of relative major
  },
  ionian: {
    name: 'Major / Ionian',
    pattern: [0, 2, 4, 5, 7, 9, 11], // W-W-H-W-W-W-H
    description: 'Happy, resolved',
    chordQuality: 'maj7',
    degreeFromMajor: 1, // I
  },
  mixolydian: {
    name: 'Mixolydian',
    pattern: [0, 2, 4, 5, 7, 9, 10], // W-W-H-W-W-H-W
    description: 'Bluesy, dominant',
    chordQuality: '7',
    degreeFromMajor: 5, // V
  },
  dorian: {
    name: 'Dorian',
    pattern: [0, 2, 3, 5, 7, 9, 10], // W-H-W-W-W-H-W
    description: 'Minor with bright 6th',
    chordQuality: 'm7',
    degreeFromMajor: 2, // ii
  },
  aeolian: {
    name: 'Natural Minor / Aeolian',
    pattern: [0, 2, 3, 5, 7, 8, 10], // W-H-W-W-H-W-W
    description: 'Sad, dark',
    chordQuality: 'm7',
    degreeFromMajor: 6, // vi
  },
  phrygian: {
    name: 'Phrygian',
    pattern: [0, 1, 3, 5, 7, 8, 10], // H-W-W-W-H-W-W
    description: 'Spanish, exotic',
    chordQuality: 'm7b9',
    degreeFromMajor: 3, // iii
  },
  locrian: {
    name: 'Locrian',
    pattern: [0, 1, 3, 5, 6, 8, 10], // H-W-W-H-W-W-W
    description: 'Diminished, unstable',
    chordQuality: 'm7b5',
    degreeFromMajor: 7, // vii
  },
} as const;

export type ModeName = keyof typeof MODES;

// Mode order for the circle (from brightest to darkest)
export const MODE_ORDER: ModeName[] = [
  'lydian', 'ionian', 'mixolydian', 'dorian', 'aeolian', 'phrygian', 'locrian'
];

// Chromatic notes
const CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHROMATIC_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Diatonic chord qualities for major key
export const DIATONIC_CHORDS_MAJOR = [
  { degree: 'I', quality: 'maj', roman: 'I' },
  { degree: 'ii', quality: 'min', roman: 'ii' },
  { degree: 'iii', quality: 'min', roman: 'iii' },
  { degree: 'IV', quality: 'maj', roman: 'IV' },
  { degree: 'V', quality: 'maj', roman: 'V' },
  { degree: 'vi', quality: 'min', roman: 'vi' },
  { degree: 'vii°', quality: 'dim', roman: 'vii°' },
];

// Diatonic chord qualities for minor key
export const DIATONIC_CHORDS_MINOR = [
  { degree: 'i', quality: 'min', roman: 'i' },
  { degree: 'ii°', quality: 'dim', roman: 'ii°' },
  { degree: 'III', quality: 'maj', roman: 'III' },
  { degree: 'iv', quality: 'min', roman: 'iv' },
  { degree: 'v', quality: 'min', roman: 'v' },
  { degree: 'VI', quality: 'maj', roman: 'VI' },
  { degree: 'VII', quality: 'maj', roman: 'VII' },
];

/**
 * Parse a key string into root note and quality
 * e.g., "C Major" -> { root: "C", quality: "major" }
 * e.g., "F# Minor" -> { root: "F#", quality: "minor" }
 * e.g., "D (Drop D Tuning)" -> { root: "D", quality: "major" }
 */
export function parseKey(keyString: string): { root: string; quality: 'major' | 'minor' } {
  // Remove parenthetical annotations like "(Drop D Tuning)"
  let normalized = keyString.trim().replace(/\s*\([^)]*\)/g, '').trim();

  // Check for minor
  if (normalized.toLowerCase().includes('minor') || normalized.toLowerCase().includes('min') || normalized.endsWith('m')) {
    const root = normalized
      .replace(/\s*(minor|min|m)$/i, '')
      .replace(/\s+/g, '')
      .trim();
    return { root: root || 'C', quality: 'minor' };
  }

  // Default to major
  const root = normalized
    .replace(/\s*(major|maj)$/i, '')
    .replace(/\s+/g, '')
    .trim();
  return { root: root || 'C', quality: 'major' };
}

/**
 * Get the index of a key in the circle of fifths (0-11)
 */
export function getCircleIndex(root: string): number {
  const normalizedRoot = root.replace(/\s+/g, '');

  // Check major keys first
  let index = CIRCLE_OF_FIFTHS_MAJOR.findIndex(k =>
    k === normalizedRoot || k.split('/').includes(normalizedRoot)
  );

  if (index === -1) {
    // Check minor keys
    index = CIRCLE_OF_FIFTHS_MINOR.findIndex(k =>
      k === normalizedRoot || k.split('/').includes(normalizedRoot) ||
      k.replace('m', '') === normalizedRoot.replace('m', '')
    );
  }

  return index === -1 ? 0 : index;
}

/**
 * Get rotation angle for a key to position it at 12 o'clock
 * @param root Root note
 * @returns Rotation angle in degrees
 */
export function getKeyRotation(root: string): number {
  const index = getCircleIndex(root);
  // Each key is 30 degrees apart (360 / 12)
  // Negative because we rotate counter-clockwise to bring key to top
  return -index * 30;
}

/**
 * Get scale notes for a given root and mode
 */
export function getScaleNotes(root: string, mode: ModeName = 'ionian'): string[] {
  const modeData = MODES[mode];
  const useFlats = root.includes('b') || ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(root);
  const chromatic = useFlats ? CHROMATIC_FLATS : CHROMATIC_SHARPS;

  // Find root index in chromatic scale
  let rootIndex = chromatic.findIndex(n => n === root || n === root.replace('b', 'b'));
  if (rootIndex === -1) {
    // Try the other chromatic
    const altChromatic = useFlats ? CHROMATIC_SHARPS : CHROMATIC_FLATS;
    rootIndex = altChromatic.findIndex(n => n === root);
    if (rootIndex === -1) rootIndex = 0;
  }

  // Build scale from pattern
  return modeData.pattern.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    return chromatic[noteIndex];
  });
}

/**
 * Get the relative key (major <-> minor)
 */
export function getRelativeKey(root: string, quality: 'major' | 'minor'): string {
  const index = getCircleIndex(root);
  if (quality === 'major') {
    // Return relative minor
    return CIRCLE_OF_FIFTHS_MINOR[index];
  } else {
    // Return relative major
    return CIRCLE_OF_FIFTHS_MAJOR[index];
  }
}

/**
 * Get the parallel key (same root, opposite quality)
 */
export function getParallelKey(root: string, quality: 'major' | 'minor'): string {
  if (quality === 'major') {
    return root + 'm';
  } else {
    return root.replace('m', '');
  }
}

/**
 * Get related keys for chord progressions
 * Returns keys that are commonly used together
 */
export function getRelatedKeys(root: string, quality: 'major' | 'minor'): {
  tonic: string;
  dominant: string;      // V
  subdominant: string;   // IV
  relative: string;      // vi or III
  parallel: string;      // Same root, opposite quality
} {
  const index = getCircleIndex(root);

  if (quality === 'major') {
    return {
      tonic: root,
      dominant: CIRCLE_OF_FIFTHS_MAJOR[(index + 1) % 12],     // One step clockwise = V
      subdominant: CIRCLE_OF_FIFTHS_MAJOR[(index + 11) % 12], // One step counter-clockwise = IV
      relative: CIRCLE_OF_FIFTHS_MINOR[index],                // Relative minor
      parallel: root + 'm',
    };
  } else {
    return {
      tonic: root,
      dominant: CIRCLE_OF_FIFTHS_MINOR[(index + 1) % 12],     // V
      subdominant: CIRCLE_OF_FIFTHS_MINOR[(index + 11) % 12], // iv
      relative: CIRCLE_OF_FIFTHS_MAJOR[index],                // Relative major
      parallel: root.replace('m', ''),
    };
  }
}

/**
 * Get chord positions on the circle for a key
 * Returns indices of keys that form the diatonic chords
 */
export function getDiatonicChordPositions(root: string, quality: 'major' | 'minor'): {
  index: number;
  roman: string;
  chordRoot: string;
}[] {
  const rootIndex = getCircleIndex(root);

  if (quality === 'major') {
    // Circle of Fifths positions for major key diatonic chords:
    //
    // For C Major: I=C, ii=Dm, iii=Em, IV=F, V=G, vi=Am, vii°=B°
    //
    // The MINOR ring at each position shows the relative minor of that major key.
    // So to find a minor chord's position, we find where that minor appears.
    //
    // Circle positions relative to tonic (each step = one fifth):
    // I   = rootIndex (tonic major)
    // IV  = rootIndex - 1 (one fifth down = counter-clockwise)
    // V   = rootIndex + 1 (one fifth up = clockwise)
    // vii°= rootIndex + 5 (five fifths up: C→G→D→A→E→B)
    //
    // Minor chords appear in the MINOR ring at specific positions:
    // ii  = rootIndex - 1 (Dm is relative minor of F, F is at rootIndex-1)
    // iii = rootIndex + 1 (Em is relative minor of G, G is at rootIndex+1)
    // vi  = rootIndex (Am is relative minor of C, C is at rootIndex)
    //
    return [
      { index: rootIndex, roman: 'I', chordRoot: CIRCLE_OF_FIFTHS_MAJOR[rootIndex] },
      { index: (rootIndex + 1) % 12, roman: 'V', chordRoot: CIRCLE_OF_FIFTHS_MAJOR[(rootIndex + 1) % 12] },
      { index: (rootIndex + 11) % 12, roman: 'IV', chordRoot: CIRCLE_OF_FIFTHS_MAJOR[(rootIndex + 11) % 12] },
      { index: (rootIndex + 5) % 12, roman: 'vii°', chordRoot: CIRCLE_OF_FIFTHS_MAJOR[(rootIndex + 5) % 12] },
      // Minor chords - appear in MINOR ring at relative major positions
      { index: (rootIndex + 11) % 12, roman: 'ii', chordRoot: CIRCLE_OF_FIFTHS_MINOR[(rootIndex + 11) % 12] },
      { index: (rootIndex + 1) % 12, roman: 'iii', chordRoot: CIRCLE_OF_FIFTHS_MINOR[(rootIndex + 1) % 12] },
      { index: rootIndex, roman: 'vi', chordRoot: CIRCLE_OF_FIFTHS_MINOR[rootIndex] },
    ];
  } else {
    // Minor key diatonic positions (natural minor):
    //
    // For A minor: i=Am, ii°=Bdim, III=C, iv=Dm, v=Em, VI=F, VII=G
    //
    // Minor scale relationships to circle:
    // i   = rootIndex (tonic minor)
    // iv  = rootIndex - 1 (one fifth down: Dm is relative of F, F is at Am's -1)
    // v   = rootIndex + 1 (one fifth up: Em is relative of G, but v is minor)
    // III = rootIndex (relative major: C is at same position as Am)
    // VI  = rootIndex - 1 (F is one fifth below C, so at rootIndex - 1)
    // VII = rootIndex + 1 (G is one fifth above C, so at rootIndex + 1)
    // ii° = rootIndex + 5 (B is 5 fifths up from E, but ii° is diminished)
    //
    return [
      { index: rootIndex, roman: 'i', chordRoot: CIRCLE_OF_FIFTHS_MINOR[rootIndex] },
      { index: (rootIndex + 11) % 12, roman: 'iv', chordRoot: CIRCLE_OF_FIFTHS_MINOR[(rootIndex + 11) % 12] },
      { index: (rootIndex + 1) % 12, roman: 'v', chordRoot: CIRCLE_OF_FIFTHS_MINOR[(rootIndex + 1) % 12] },
      { index: rootIndex, roman: 'III', chordRoot: CIRCLE_OF_FIFTHS_MAJOR[rootIndex] },
      { index: (rootIndex + 11) % 12, roman: 'VI', chordRoot: CIRCLE_OF_FIFTHS_MAJOR[(rootIndex + 11) % 12] },
      { index: (rootIndex + 1) % 12, roman: 'VII', chordRoot: CIRCLE_OF_FIFTHS_MAJOR[(rootIndex + 1) % 12] },
      // ii° is diminished, based on the 2nd scale degree (B in Am)
      { index: (rootIndex + 5) % 12, roman: 'ii°', chordRoot: CIRCLE_OF_FIFTHS_MAJOR[(rootIndex + 5) % 12] },
    ];
  }
}

/**
 * Format a key for display
 */
export function formatKey(root: string, quality: 'major' | 'minor'): string {
  const qualityText = quality === 'major' ? 'Major' : 'Minor';
  return `${root} ${qualityText}`;
}

/**
 * Get enharmonic equivalent
 */
export function getEnharmonic(note: string): string | null {
  const enharmonics: Record<string, string> = {
    'C#': 'Db', 'Db': 'C#',
    'D#': 'Eb', 'Eb': 'D#',
    'F#': 'Gb', 'Gb': 'F#',
    'G#': 'Ab', 'Ab': 'G#',
    'A#': 'Bb', 'Bb': 'A#',
    'B': 'Cb', 'Cb': 'B',
    'E': 'Fb', 'Fb': 'E',
    'C': 'B#', 'B#': 'C',
    'F': 'E#', 'E#': 'F',
  };
  return enharmonics[note] || null;
}

/**
 * Check if two keys are enharmonically equivalent
 */
export function areEnharmonic(key1: string, key2: string): boolean {
  if (key1 === key2) return true;
  const enharmonic = getEnharmonic(key1);
  return enharmonic === key2;
}
