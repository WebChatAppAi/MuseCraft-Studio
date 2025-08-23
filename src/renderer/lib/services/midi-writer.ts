import { Writer, Track, NoteEvent } from 'midi-writer-js';
import type { MIDINote } from '../../components/pages/piano-roll/components/grid-area';

// Standard MIDI resolution, common in DAWs like FL Studio
const TICKS_PER_BEAT = 96;

/**
 * Converts a duration in beats to a MIDI duration string (e.g., '4' for a quarter note).
 * Handles common note lengths and dotted notes.
 * @param beats The duration in beats (where 1 beat = 1 quarter note).
 * @returns A MIDI duration string.
 */
/**
 * Converts an array of MIDINote objects into a MIDI file data URI.
 * @param notes The array of notes from the piano roll.
 * @param bpm The beats per minute of the track.
 * @returns A data URI string representing the generated .mid file.
 */
export function exportNotesToMidiDataUri(notes: MIDINote[], bpm: number): string {
  // 1. Create a new track
  const track = new Track();

  // 2. Set the tempo for the track
  track.setTempo(bpm);

  // 3. Convert our note format to MIDI NoteEvent objects using absolute timing
  const midiEvents = notes.map(note => new NoteEvent({
    pitch: note.midi,
    duration: `T${Math.round(note.duration * TICKS_PER_BEAT)}`,
    startTick: Math.round(note.start * TICKS_PER_BEAT),
    velocity: Math.round((note.velocity / 127) * 100),
    channel: 1,
  }));

  // 4. Add the events to the track
  track.addEvent(midiEvents);

  // 5. Create a writer and build the MIDI file
  const writer = new Writer([track]);
  return writer.dataUri();
}