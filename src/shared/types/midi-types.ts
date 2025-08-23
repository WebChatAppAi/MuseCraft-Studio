// MIDI-related types for MuseCraft Piano Roll

export interface MIDINote {
  id: string;
  pitch: number; // MIDI note number (0-127)
  velocity: number; // Velocity (0-127)
  start: number; // Start time in beats
  end: number; // End time in beats
  channel: number; // MIDI channel (0-15)
  selected?: boolean;
}

export interface MIDIComposition {
  id?: string;
  name?: string;
  notes: MIDINote[];
  bpm: number;
  time_signature: string; // e.g., "4/4"
  key_signature: string; // e.g., "C"
  created_at?: string;
  updated_at?: string;
}

export interface PianoKey {
  midi: number;
  name: string;
  octave: number;
  isBlackKey: boolean;
  displayName: string; // e.g., "C4", "F#3"
}

export interface TimelineMarker {
  position: number; // Position in beats
  type: 'measure' | 'beat' | 'subdivision';
  label?: string;
}

export interface Viewport {
  scrollTop: number;
  scrollLeft: number;
  visibleHeight: number;
  visibleWidth: number;
}

export interface ZoomState {
  horizontal: number; // Horizontal zoom factor (0.1 - 5.0)
  vertical: number; // Vertical zoom factor (0.5 - 3.0)
}

export interface GridDimensions {
  keyHeight: number;
  beatWidth: number;
  totalBeats: number;
  totalKeys: number;
}

export interface SelectionState {
  selectedNoteIds: Set<string>;
  selectionBox?: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };
}

// MIDI file operations
export interface MIDIExportOptions {
  filename: string;
  format?: 0 | 1 | 2; // MIDI file format
  ticks_per_beat?: number;
}

export interface MIDIImportResult {
  composition: MIDIComposition;
  metadata: {
    original_filename: string;
    format: number;
    track_count: number;
    ticks_per_beat: number;
  };
}

// Real-time MIDI events
export interface MIDIEvent {
  type: 'note_on' | 'note_off' | 'control_change' | 'program_change';
  channel: number;
  timestamp: number;
  data: {
    note?: number;
    velocity?: number;
    controller?: number;
    value?: number;
    program?: number;
  };
}

export interface PlaybackState {
  isPlaying: boolean;
  currentPosition: number; // Current playback position in beats
  loopStart?: number;
  loopEnd?: number;
  metronomeEnabled: boolean;
}
