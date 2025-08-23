import type { MIDINote } from '../../components/pages/piano-roll/components/grid-area';

export interface MIDITrackEvent {
  deltaTime: number;
  type: 'noteOn' | 'noteOff' | 'meta' | 'sysex';
  channel?: number;
  noteNumber?: number;
  velocity?: number;
  metaType?: number;
  data?: Uint8Array;
}

export interface MIDITrack {
  events: MIDITrackEvent[];
}

export interface MIDIFile {
  format: number;
  trackCount: number;
  ticksPerQuarter: number;
  tracks: MIDITrack[];
}

export class MIDIParser {
  private data: Uint8Array;
  private pos: number = 0;

  constructor(arrayBuffer: ArrayBuffer) {
    this.data = new Uint8Array(arrayBuffer);
  }

  // Read variable-length quantity (VLQ)
  private readVLQ(): number {
    let value = 0;
    let byte: number;
    
    do {
      byte = this.data[this.pos++];
      value = (value << 7) | (byte & 0x7F);
    } while (byte & 0x80);
    
    return value;
  }

  // Read fixed-length integer
  private readInt(bytes: number): number {
    let value = 0;
    for (let i = 0; i < bytes; i++) {
      value = (value << 8) | this.data[this.pos++];
    }
    return value;
  }

  // Read string
  private readString(length: number): string {
    const bytes = this.data.slice(this.pos, this.pos + length);
    this.pos += length;
    return String.fromCharCode(...bytes);
  }

  // Parse MIDI file
  public parse(): MIDIFile {
    // Read header chunk
    const headerChunk = this.readString(4);
    if (headerChunk !== 'MThd') {
      throw new Error('Invalid MIDI file: Missing MThd header');
    }

    const headerLength = this.readInt(4);
    const format = this.readInt(2);
    const trackCount = this.readInt(2);
    const timeDivision = this.readInt(2);

    // Calculate ticks per quarter note
    let ticksPerQuarter: number;
    if (timeDivision & 0x8000) {
      // SMPTE format (not commonly used)
      const framesPerSecond = -(timeDivision >> 8);
      const ticksPerFrame = timeDivision & 0xFF;
      ticksPerQuarter = framesPerSecond * ticksPerFrame * 4; // Approximate
    } else {
      ticksPerQuarter = timeDivision;
    }

    // Parse tracks
    const tracks: MIDITrack[] = [];
    for (let i = 0; i < trackCount; i++) {
      tracks.push(this.parseTrack());
    }

    return {
      format,
      trackCount,
      ticksPerQuarter,
      tracks
    };
  }

  // Parse a single track
  private parseTrack(): MIDITrack {
    const trackChunk = this.readString(4);
    if (trackChunk !== 'MTrk') {
      throw new Error('Invalid MIDI track: Missing MTrk header');
    }

    const trackLength = this.readInt(4);
    const trackEnd = this.pos + trackLength;
    const events: MIDITrackEvent[] = [];
    let runningStatus = 0;

    while (this.pos < trackEnd) {
      const deltaTime = this.readVLQ();
      let status = this.data[this.pos];

      // Handle running status
      if (status < 0x80) {
        status = runningStatus;
        this.pos--;
      } else {
        runningStatus = status;
      }

      this.pos++;

      if (status >= 0x80 && status <= 0xEF) {
        // Channel messages
        const channel = status & 0x0F;
        const command = status & 0xF0;

        if (command === 0x90 || command === 0x80) {
          // Note on/off
          const noteNumber = this.data[this.pos++];
          const velocity = this.data[this.pos++];
          
          events.push({
            deltaTime,
            type: (command === 0x90 && velocity > 0) ? 'noteOn' : 'noteOff',
            channel,
            noteNumber,
            velocity
          });
        } else {
          // Other channel messages (skip for now)
          this.pos += this.getMessageLength(command) - 1;
        }
      } else if (status === 0xFF) {
        // Meta events
        const metaType = this.data[this.pos++];
        const length = this.readVLQ();
        const data = this.data.slice(this.pos, this.pos + length);
        this.pos += length;

        events.push({
          deltaTime,
          type: 'meta',
          metaType,
          data
        });
      } else {
        // System exclusive or other (skip)
        const length = this.readVLQ();
        this.pos += length;
      }
    }

    return { events };
  }

  // Get message length for different commands
  private getMessageLength(command: number): number {
    switch (command) {
      case 0x80: case 0x90: case 0xA0: case 0xB0: case 0xE0:
        return 3;
      case 0xC0: case 0xD0:
        return 2;
      default:
        return 1;
    }
  }

  // Convert MIDI events to our note format
  public static convertToNotes(midiFile: MIDIFile): MIDINote[] {
    const notes: MIDINote[] = [];
    const activeNotes = new Map<string, { start: number; velocity: number }>();

    for (const track of midiFile.tracks) {
      let currentTime = 0;

      for (const event of track.events) {
        currentTime += event.deltaTime;
        
        if (event.type === 'noteOn' && event.noteNumber !== undefined && event.velocity !== undefined) {
          const noteKey = `${event.channel || 0}_${event.noteNumber}`;
          // Convert absolute ticks to absolute beats (1 beat = 1 quarter note)
          const beatTime = currentTime / midiFile.ticksPerQuarter;
          
          activeNotes.set(noteKey, {
            start: beatTime,
            velocity: event.velocity
          });
        } else if (event.type === 'noteOff' && event.noteNumber !== undefined) {
          const noteKey = `${event.channel || 0}_${event.noteNumber}`;
          const activeNote = activeNotes.get(noteKey);
          
          if (activeNote) {
            const beatTime = currentTime / midiFile.ticksPerQuarter;
            const duration = Math.max(0.125, beatTime - activeNote.start); // Minimum 32nd note
            
            notes.push({
              id: `midi_${Date.now()}_${Math.random()}`,
              midi: event.noteNumber!,
              start: activeNote.start,
              duration,
              velocity: activeNote.velocity,
              selected: false
            });
            
            activeNotes.delete(noteKey);
          }
        }
      }
    }

    return notes;
  }
}

// Utility function to parse MIDI file from File object
export async function parseMIDIFile(file: File): Promise<MIDINote[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const parser = new MIDIParser(arrayBuffer);
        const midiFile = parser.parse();
        const notes = MIDIParser.convertToNotes(midiFile);
        resolve(notes);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}
