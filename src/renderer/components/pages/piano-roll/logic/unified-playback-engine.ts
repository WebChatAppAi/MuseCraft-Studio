/**
 * Unified Playback Engine - Position-Driven Audio-Visual Synchronization
 * 
 * This engine solves the synchronization problem by making the playerhead position
 * the single source of truth. Audio is triggered when the playerhead reaches notes,
 * ensuring perfect sync between visual and audio.
 */

import * as Tone from 'tone';
import type { MIDINote } from '../components/grid-area';
import type { InstrumentType } from '../components/instruments';
import { AudioInitializationService } from '../../../../lib/services/audio-initialization';

// Simple playback state
export interface PlaybackState {
  isPlaying: boolean;
  currentPosition: number; // In beats - this is the authoritative position
  bpm: number;
  isLooping: boolean;
}

// Note trigger tracking
interface NoteState {
  note: MIDINote;
  isTriggered: boolean;
  triggerTime?: number;
}

export class UnifiedPlaybackEngine {
  // Core state
  private playbackState: PlaybackState;
  private notes: MIDINote[] = [];
  private triggeredNotes: Set<string> = new Set(); // Track which notes have been triggered
  private animationFrame: number | null = null;
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private startTime = 0;
  private noteStates: Map<string, NoteState> = new Map();
  
  // Audio components
  private currentInstrument: any = null; // Using any to support all Tone.js synth types
  private currentInstrumentType: InstrumentType = 'piano';
  private initialized = false;
  
  // Callbacks
  private onPositionUpdate: ((position: number) => void) | null = null;
  private onStateChange: ((state: PlaybackState) => void) | null = null;

  constructor() {
    this.playbackState = {
      isPlaying: false,
      currentPosition: 0,
      bpm: 128,
      isLooping: false,
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      console.log('🔧 Initializing Unified Playback Engine...');
      
      // Initialize audio using the centralized service
      await AudioInitializationService.getInstance().initializeAudioSystem();
      
      // Create default instrument
      this.createInstrument(this.currentInstrumentType);
      
      this.initialized = true;
      console.log('✅ Unified Playback Engine initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Unified Playback Engine:', error);
      throw error;
    }
  }

  // Create instrument based on type
  private createInstrument(type: InstrumentType): void {
    // Dispose of current instrument
    if (this.currentInstrument) {
      this.currentInstrument.dispose();
    }

    console.log(`🎵 Creating instrument: ${type}`);

    switch (type) {
      case 'piano':
        // Piano-like sound using FM synthesis
        this.currentInstrument = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 3,
          modulationIndex: 2,
          oscillator: { type: 'sine' },
          envelope: {
            attack: 0.008,
            decay: 0.2,
            sustain: 0.4,
            release: 1.2
          },
          modulation: { type: 'sine' },
          modulationEnvelope: {
            attack: 0.001,
            decay: 0.2,
            sustain: 0.3,
            release: 0.4
          }
        }).toDestination();
        break;
        
      case 'synth':
        // Classic analog-style poly synth
        this.currentInstrument = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sawtooth' },
          envelope: {
            attack: 0.01,
            decay: 0.3,
            sustain: 0.4,
            release: 0.8
          }
        }).toDestination();
        break;
        
      case 'amSynth':
        // Amplitude modulation synth
        this.currentInstrument = new Tone.PolySynth(Tone.AMSynth, {
          harmonicity: 3,
          oscillator: { type: 'sine' },
          envelope: {
            attack: 0.01,
            decay: 0.01,
            sustain: 1,
            release: 0.5
          },
          modulation: { type: 'square' },
          modulationEnvelope: {
            attack: 0.5,
            decay: 0,
            sustain: 1,
            release: 0.5
          }
        }).toDestination();
        break;
        
      case 'fmSynth':
        // Frequency modulation synth (great for bell/metallic sounds)
        this.currentInstrument = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 3,
          modulationIndex: 10,
          oscillator: { type: 'sine' },
          envelope: {
            attack: 0.001,
            decay: 0.2,
            sustain: 0.2,
            release: 0.2
          },
          modulation: { type: 'square' },
          modulationEnvelope: {
            attack: 0.002,
            decay: 0.2,
            sustain: 0.3,
            release: 0.2
          }
        }).toDestination();
        break;
        
      case 'monoSynth':
        // Monophonic synth with filter
        this.currentInstrument = new Tone.MonoSynth({
          oscillator: { type: 'square' },
          envelope: {
            attack: 0.01,
            decay: 0.1,
            sustain: 0.8,
            release: 0.4
          },
          filterEnvelope: {
            attack: 0.001,
            decay: 0.2,
            sustain: 0.5,
            release: 0.2,
            baseFrequency: 200,
            octaves: 3
          }
        }).toDestination();
        break;
        
      case 'duoSynth':
        // Two voice synth
        this.currentInstrument = new Tone.DuoSynth({
          harmonicity: 1.5,
          voice0: {
            oscillator: { type: 'sawtooth' },
            envelope: {
              attack: 0.01,
              decay: 0.3,
              sustain: 0.5,
              release: 0.8
            }
          },
          voice1: {
            oscillator: { type: 'square' },
            envelope: {
              attack: 0.01,
              decay: 0.3,
              sustain: 0.5,
              release: 0.8
            }
          }
        }).toDestination();
        break;
        
      case 'membraneSynth':
        // Drum membrane synth (kick drum style)
        this.currentInstrument = new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 4,
          oscillator: { type: 'sine' },
          envelope: {
            attack: 0.001,
            decay: 0.4,
            sustain: 0.01,
            release: 1.4
          }
        }).toDestination();
        break;
        
      case 'metalSynth':
        // Metallic percussion synth
        this.currentInstrument = new Tone.MetalSynth({
          envelope: {
            attack: 0.001,
            decay: 0.4,
            release: 0.2
          },
          harmonicity: 5.1,
          modulationIndex: 32,
          resonance: 4000,
          octaves: 1.5
        }).toDestination();
        break;
        
      case 'pluckSynth':
        // Karplus-Strong string synthesis
        this.currentInstrument = new Tone.PluckSynth({
          attackNoise: 2,
          dampening: 4000,
          resonance: 0.98
        }).toDestination();
        break;
        
      default:
        this.currentInstrument = new Tone.PolySynth(Tone.Synth).toDestination();
    }

    this.currentInstrumentType = type;
  }

  // Set instrument type
  setInstrument(type: InstrumentType): void {
    if (type !== this.currentInstrumentType) {
      console.log(`🎵 Switching instrument from ${this.currentInstrumentType} to ${type}`);
      this.createInstrument(type);
    }
  }

  // Set notes for playback
  setNotes(notes: MIDINote[]): void {
    this.notes = [...notes];
    this.prepareNoteStates();
  }

  // Prepare note state tracking
  private prepareNoteStates(): void {
    this.noteStates.clear();
    
    for (const note of this.notes) {
      this.noteStates.set(note.id, {
        note,
        isTriggered: false,
      });
    }
    
    console.log(`🎼 Prepared ${this.noteStates.size} notes for position-driven playback`);
  }

  // Start playback from a specific position
  async play(fromPosition = 0): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    console.log(`▶️ Starting unified playback from position ${fromPosition}`);
    
    // Reset state
    this.playbackState.currentPosition = fromPosition;
    this.playbackState.isPlaying = true;
    
    // Initialize timing for smooth animation
    const now = performance.now();
    this.startTime = now;
    this.lastFrameTime = now;
    
    console.log(`⏰ Timing initialized: startTime=${this.startTime}, BPM=${this.playbackState.bpm}`);
    
    // Reset note triggers based on current position
    this.resetNoteTriggers(fromPosition);
    
    // Start the position-driven animation loop
    this.startPlaybackLoop();
    
    // Notify state change
    this.notifyStateChange();
  }

  // Reset note triggers based on current position
  private resetNoteTriggers(currentPosition: number): void {
    this.noteStates.forEach((noteState, noteId) => {
      const note = noteState.note;
      
      // If we're starting after this note's start, mark it as already triggered
      if (currentPosition > note.start) {
        noteState.isTriggered = true;
      } else {
        noteState.isTriggered = false;
      }
    });
  }

  // Stop playback
  stop(): void {
    console.log('⏹️ Stopping unified playback');
    
    this.playbackState.isPlaying = false;
    this.playbackState.currentPosition = 0;
    
    // Stop animation loop
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Stop all playing notes
    this.stopAllNotes();
    
    // Reset note triggers
    this.resetNoteTriggers(0);
    
    // Notify changes
    this.notifyStateChange();
    this.notifyPositionUpdate();
  }

  // Pause playback
  pause(): void {
    console.log('⏸️ Pausing unified playback');
    
    this.playbackState.isPlaying = false;
    
    // Stop animation loop
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Stop all playing notes
    this.stopAllNotes();
    
    this.notifyStateChange();
  }

  // Resume playback
  async resume(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    console.log('▶️ Resuming unified playback');
    
    this.playbackState.isPlaying = true;
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;
    
    // Reset note triggers from current position
    this.resetNoteTriggers(this.playbackState.currentPosition);
    
    // Restart animation loop
    this.startPlaybackLoop();
    
    this.notifyStateChange();
  }

  // Set BPM
  setBPM(bpm: number): void {
    const clampedBpm = Math.max(60, Math.min(200, bpm));
    if (clampedBpm !== this.playbackState.bpm) {
      console.log(`🎵 BPM changed: ${this.playbackState.bpm} → ${clampedBpm}`);
      this.playbackState.bpm = clampedBpm;
      this.notifyStateChange();
    }
  }

  // Set position (for scrubbing)
  setPosition(position: number): void {
    const clampedPosition = Math.max(0, position);
    
    if (clampedPosition !== this.playbackState.currentPosition) {
      console.log(`⏭️ Position set: ${this.playbackState.currentPosition} → ${clampedPosition}`);
      
      // Stop all current notes
      this.stopAllNotes();
      
      // Update position
      this.playbackState.currentPosition = clampedPosition;
      
      // Reset timing if playing
      if (this.playbackState.isPlaying) {
        this.startTime = performance.now();
        this.lastFrameTime = this.startTime;
      }
      
      // Reset note triggers for new position
      this.resetNoteTriggers(clampedPosition);
      
      this.notifyPositionUpdate();
    }
  }

  // Main playback loop - position-driven
  private startPlaybackLoop(): void {
    console.log('🔄 Starting unified playback loop...');
    
    const playbackLoop = () => {
      if (!this.playbackState.isPlaying) {
        console.log('⏹️ Playback loop stopped - not playing');
        this.animationFrameId = null;
        return;
      }
      
      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastFrameTime;
      this.lastFrameTime = currentTime;
      
      // Calculate position advancement based on BPM and frame time
      const beatsPerSecond = this.playbackState.bpm / 60;
      const deltaBeats = (deltaTime / 1000) * beatsPerSecond;
      
      // Update position (this is the authoritative position)
      this.playbackState.currentPosition += deltaBeats;
      
      // Removed debug logging for performance
      
      // Trigger notes that the playerhead has reached
      this.processNoteTriggers();
      
      // Check for end of song
      this.checkPlaybackEnd();
      
      // Notify position update
      this.notifyPositionUpdate();
      
      // Continue loop
      this.animationFrameId = requestAnimationFrame(playbackLoop);
    };
    
    this.animationFrameId = requestAnimationFrame(playbackLoop);
  }

  // Process note triggers based on current position
  private processNoteTriggers(): void {
    const currentPosition = this.playbackState.currentPosition;
    const audioTime = Tone.now();
    
    this.noteStates.forEach((noteState, noteId) => {
      const note = noteState.note;
      
      // Check if we should trigger this note
      if (!noteState.isTriggered && currentPosition >= note.start) {
        // Trigger note ON
        console.log(`🎵 Triggering note ${note.midi} at position ${currentPosition.toFixed(3)}`);
        
        if (this.currentInstrument) {
          const frequency = Tone.Frequency(note.midi, "midi").toFrequency();
          const velocity = note.velocity / 127; // Normalize velocity
          
          // Different synths need different trigger methods
          if (this.currentInstrumentType === 'metalSynth') {
            // MetalSynth doesn't use frequency, just trigger
            this.currentInstrument.triggerAttack(audioTime, velocity);
          } else if (this.currentInstrumentType === 'membraneSynth') {
            // MembraneSynth uses frequency differently
            this.currentInstrument.triggerAttack(frequency, audioTime, velocity);
          } else if ('triggerAttack' in this.currentInstrument) {
            // Most synths use frequency and time
            this.currentInstrument.triggerAttack(frequency, audioTime, velocity);
          }
        }
        
        noteState.isTriggered = true;
        noteState.triggerTime = audioTime;
        
        // Schedule note OFF
        const noteDuration = (note.duration * 60) / this.playbackState.bpm; // Convert beats to seconds
        setTimeout(() => {
          if (this.currentInstrument) {
            const frequency = Tone.Frequency(note.midi, "midi").toFrequency();
            
            // Different synths need different release methods
            if (this.currentInstrumentType === 'metalSynth' || this.currentInstrumentType === 'membraneSynth') {
              // These synths use triggerRelease without frequency
              this.currentInstrument.triggerRelease(Tone.now());
            } else if ('triggerRelease' in this.currentInstrument) {
              // Most poly/mono synths use frequency
              this.currentInstrument.triggerRelease(frequency, Tone.now());
            }
          }
        }, noteDuration * 1000);
      }
    });
  }

  // Check if playback should end
  private checkPlaybackEnd(): void {
    if (this.notes.length === 0) return;
    
    // Find the end of the last note
    const lastNoteEnd = Math.max(...this.notes.map(note => note.start + note.duration));
    
    // Stop if we've passed the end of all notes
    if (this.playbackState.currentPosition >= lastNoteEnd + 1) {
      console.log('🏁 Reached end of song, stopping playback');
      this.stop();
    }
  }

  // Stop all currently playing notes
  private stopAllNotes(): void {
    if (!this.currentInstrument) return;
    
    try {
      // PolySynth has releaseAll, individual synths need to be released differently
      if ('releaseAll' in this.currentInstrument) {
        this.currentInstrument.releaseAll();
      } else {
        // For individual synths, trigger release at current time
        this.currentInstrument.triggerRelease();
      }
    } catch (error) {
      // Ignore errors
      console.warn('Error stopping notes:', error);
    }
  }

  // Play preview note
  playPreviewNote(midi: number, velocity = 80): void {
    if (this.currentInstrument) {
      const frequency = Tone.Frequency(midi, "midi").toFrequency();
      const vel = velocity / 127;
      
      // Different synths need different methods
      if (this.currentInstrumentType === 'metalSynth') {
        // MetalSynth doesn't use frequency
        this.currentInstrument.triggerAttackRelease("8n", Tone.now(), vel);
      } else if (this.currentInstrumentType === 'membraneSynth') {
        // MembraneSynth uses frequency differently
        this.currentInstrument.triggerAttackRelease(frequency, "8n", Tone.now(), vel);
      } else if ('triggerAttackRelease' in this.currentInstrument) {
        // Most synths
        this.currentInstrument.triggerAttackRelease(frequency, "8n", Tone.now(), vel);
      }
    }
  }

  // Set reverb level (placeholder for future implementation)
  setReverbLevel(level: number): void {
    console.log(`Setting reverb level to ${level}%`);
    // TODO: Implement reverb effects with Tone.js
  }

  // Set piano type (placeholder for future implementation)
  setPianoType(type: 'acoustic' | 'electric' | 'synth'): void {
    console.log(`Setting piano type to ${type}`);
    // TODO: Implement different piano sounds
  }

  // Get current state
  getState(): PlaybackState {
    return { ...this.playbackState };
  }

  // Get audio status
  getAudioStatus() {
    const audioService = AudioInitializationService.getInstance();
    return {
      isInitialized: this.initialized,
      hasSF2: false,
      contextState: audioService.getAudioContext()?.state || null
    };
  }

  // Callback registration
  onPositionChange(callback: (position: number) => void): void {
    console.log('🔧 Engine: registering position callback');
    this.onPositionUpdate = callback;
    console.log('🔧 Engine: position callback registered:', !!this.onPositionUpdate);
  }

  onPlaybackStateChange(callback: (state: PlaybackState) => void): void {
    console.log('🔧 Engine: registering state callback');
    this.onStateChange = callback;
    console.log('🔧 Engine: state callback registered:', !!this.onStateChange);
  }

  // Notification methods
  private notifyPositionUpdate(): void {
    if (this.onPositionUpdate) {
      this.onPositionUpdate(this.playbackState.currentPosition);
    }
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  // Cleanup
  dispose(): void {
    console.log('🧹 Disposing Unified Playback Engine...');
    
    this.stop();
    
    if (this.currentInstrument) {
      this.currentInstrument.dispose();
    }
    
    this.onPositionUpdate = null;
    this.onStateChange = null;
    
    console.log('✅ Unified Playback Engine disposed');
  }
}
