// Musical constants and utilities for AI generation

/**
 * Scale to MIDI number mapping (based on musical-friendly.md)
 * Maps note names to their MIDI numbers in the 4th octave
 */
export const SCALE_TO_MIDI: Record<string, number> = {
  "C": 60,   // C4 (Middle C)
  "C#": 61,  // C#4/Db4
  "Db": 61,  // Db4
  "D": 62,   // D4
  "D#": 63,  // D#4/Eb4
  "Eb": 63,  // Eb4
  "E": 64,   // E4
  "F": 65,   // F4
  "F#": 66,  // F#4/Gb4
  "Gb": 66,  // Gb4
  "G": 67,   // G4
  "G#": 68,  // G#4/Ab4
  "Ab": 68,  // Ab4
  "A": 69,   // A4 (440 Hz)
  "A#": 70,  // A#4/Bb4
  "Bb": 70,  // Bb4
  "B": 71    // B4
};

/**
 * Available musical scales
 */
export const MUSICAL_SCALES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
] as const;

export const ENHARMONIC_SCALES = [
  'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'
] as const;

/**
 * Scale types with their characteristics
 */
export const SCALE_TYPES = {
  'Major': { 
    label: 'Major', 
    description: 'Happy, bright sound',
    primeDuration: 8 // Shorter for major scales
  },
  'Minor': { 
    label: 'Minor', 
    description: 'Melancholic, emotional',
    primeDuration: 12 // Longer for minor scales
  },
  'Pentatonic': { 
    label: 'Pentatonic', 
    description: 'Asian-inspired, peaceful',
    primeDuration: 10
  },
  'Blues': { 
    label: 'Blues', 
    description: 'Soulful, expressive',
    primeDuration: 14
  },
  'Dorian': { 
    label: 'Dorian', 
    description: 'Folk, medieval feel',
    primeDuration: 11
  },
  'Mixolydian': { 
    label: 'Mixolydian', 
    description: 'Rock, folk, Celtic',
    primeDuration: 9
  }
} as const;

/**
 * Musical styles with generation hints
 */
export const MUSICAL_STYLES = {
  'Classical': {
    label: 'Classical',
    description: 'Structured, elegant melodies',
    temperatureModifier: -0.2, // More structured
    noteCountModifier: 1.2
  },
  'Jazz': {
    label: 'Jazz',
    description: 'Complex, syncopated rhythms',
    temperatureModifier: 0.1, // Slightly more creative
    noteCountModifier: 1.0
  },
  'Pop': {
    label: 'Pop',
    description: 'Catchy, accessible melodies',
    temperatureModifier: 0.0, // Balanced
    noteCountModifier: 0.8
  },
  'Rock': {
    label: 'Rock',
    description: 'Driving, energetic patterns',
    temperatureModifier: 0.2, // More creative
    noteCountModifier: 0.9
  },
  'Electronic': {
    label: 'Electronic',
    description: 'Synthetic, rhythmic patterns',
    temperatureModifier: 0.3, // Very creative
    noteCountModifier: 1.1
  },
  'Ambient': {
    label: 'Ambient',
    description: 'Atmospheric, flowing sounds',
    temperatureModifier: 0.1,
    noteCountModifier: 0.6 // Fewer, sustained notes
  }
} as const;

/**
 * Rhythm patterns
 */
export const RHYTHM_PATTERNS = {
  'Simple': {
    label: 'Simple',
    description: 'Basic, easy to follow',
    complexityModifier: 0.3
  },
  'Complex': {
    label: 'Complex',
    description: 'Intricate, detailed',
    complexityModifier: 0.8
  },
  'Syncopated': {
    label: 'Syncopated',
    description: 'Off-beat, jazzy feel',
    complexityModifier: 0.9
  },
  'Straight': {
    label: 'Straight',
    description: 'On-beat, steady rhythm',
    complexityModifier: 0.2
  }
} as const;

/**
 * Note density options
 */
export const NOTE_DENSITY = {
  'Sparse': {
    label: 'Sparse',
    description: 'Few notes, spacious',
    noteModifier: 0.6
  },
  'Moderate': {
    label: 'Moderate',
    description: 'Balanced note count',
    noteModifier: 1.0
  },
  'Dense': {
    label: 'Dense',
    description: 'Many notes, busy',
    noteModifier: 1.5
  }
} as const;

/**
 * Convert user-friendly parameters to technical API parameters
 */
export function convertMusicalToTechnical(musicalParams: {
  scaleRoot: string;
  scaleType: keyof typeof SCALE_TYPES;
  creativityLevel: number; // 0-100
  musicalStyle: keyof typeof MUSICAL_STYLES;
  rhythmPattern: keyof typeof RHYTHM_PATTERNS;
  noteDensity: keyof typeof NOTE_DENSITY;
  maxNotes?: number;
}): {
  mode: 'prime_note';
  prime_pitch: number;
  prime_duration: number;
  temperature: number;
  max_notes: number;
} {
  const { scaleRoot, scaleType, creativityLevel, musicalStyle, rhythmPattern, noteDensity, maxNotes = 32 } = musicalParams;
  
  // Convert scale to MIDI
  const primePitch = SCALE_TO_MIDI[scaleRoot];
  if (!primePitch) {
    throw new Error(`Invalid scale root: ${scaleRoot}`);
  }
  
  // Get prime duration from scale type
  const primeDuration = SCALE_TYPES[scaleType].primeDuration;
  
  // Convert creativity level (0-100) to temperature (0.1-2.0)
  // Base temperature: 0.5 + (creativity / 100) * 1.5 = 0.5 to 2.0
  let temperature = 0.5 + (creativityLevel / 100.0) * 1.5;
  
  // Apply style modifier
  temperature += MUSICAL_STYLES[musicalStyle].temperatureModifier;
  
  // Clamp temperature to valid range
  temperature = Math.max(0.1, Math.min(2.0, temperature));
  
  // Calculate max notes with modifiers
  let adjustedMaxNotes = maxNotes;
  adjustedMaxNotes *= MUSICAL_STYLES[musicalStyle].noteCountModifier;
  adjustedMaxNotes *= NOTE_DENSITY[noteDensity].noteModifier;
  adjustedMaxNotes = Math.round(Math.max(5, Math.min(200, adjustedMaxNotes)));
  
  return {
    mode: 'prime_note',
    prime_pitch: primePitch,
    prime_duration: primeDuration,
    temperature,
    max_notes: adjustedMaxNotes
  };
}

/**
 * Get scale display name with both sharp and flat notation
 */
export function getScaleDisplayName(scale: string): string {
  const alternatives: Record<string, string[]> = {
    'C#': ['C#', 'Db'],
    'D#': ['D#', 'Eb'],
    'F#': ['F#', 'Gb'],
    'G#': ['G#', 'Ab'],
    'A#': ['A#', 'Bb']
  };
  
  if (alternatives[scale]) {
    return alternatives[scale].join(' / ');
  }
  return scale;
}