/**
 * Enhanced Audio Engine for MuseCraft
 * Uses Tone.js with high-quality piano samples and enhanced synthesis
 */

import * as Tone from 'tone';
import { AudioInitializationService } from '../../../../lib/services/audio-initialization';

// Audio engine configuration
interface AudioEngineConfig {
  useCompression: boolean;
  reverbLevel: number;
  pianoType: 'acoustic' | 'electric' | 'synth';
}

// Enhanced Audio Engine with multiple synthesis methods
export class EnhancedAudioEngine {
  private isInitialized = false;
  private readyPromise: Promise<void>;
  private resolveReady!: () => void;

  // Tone.js instruments
  private pianoSampler: Tone.Sampler | null = null;
  private synthPiano: Tone.PolySynth<Tone.FMSynth> | null = null;
  private masterCompressor: Tone.Compressor | null = null;
  private reverb: Tone.Reverb | null = null;

  // Configuration
  private config: AudioEngineConfig = {
    useCompression: true,
    reverbLevel: 0.1,
    pianoType: 'synth'
  };

  constructor() {
    this.readyPromise = new Promise((resolve) => {
      this.resolveReady = resolve;
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return this.readyPromise;
    }
    this.isInitialized = true;

    try {
      console.log('🎹 Initializing Enhanced Audio Engine...');
      
      const audioService = AudioInitializationService.getInstance();
      if (!audioService.isAudioReady()) {
        await audioService.initializeAudioSystem();
      }
      
      await Tone.start();
      console.log('✅ Tone.js audio context started');

      await this._createPianoInstruments();
      this._setupEffects();
      
      console.log('✅ Enhanced Audio Engine initialization completed');
      this.resolveReady(); // Signal that the engine is ready
      
    } catch (error) {
      console.error('❌ Enhanced Audio Engine initialization failed:', error);
      throw error;
    }
  }

  private async _createPianoInstruments(): Promise<void> {
    console.log('🎹 Creating piano instruments...');
    
    // Fallback synth piano (always available)
    this.synthPiano = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 0.8,
      oscillator: { type: "sine" },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: 1.2 },
      modulation: { type: "sine" },
      modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.8 }
    });
    this.synthPiano.maxPolyphony = 16;
    console.log('🎹 Enhanced synthesis piano created');

    // Try to load the sampler
    try {
      this.pianoSampler = new Tone.Sampler({
        urls: {
          C1: "C1.mp3", C2: "C2.mp3", C3: "C3.mp3", C4: "C4.mp3",
          C5: "C5.mp3", C6: "C6.mp3", C7: "C7.mp3"
        },
        baseUrl: "https://tonejs.github.io/audio/salamander/",
        onload: () => {
          console.log('✅ Piano samples loaded successfully');
        },
      });
      await Tone.loaded();
      console.log('🎵 Salamander piano sampler is ready');
    } catch (error) {
      console.warn('⚠️ Failed to load sampler, will use synth as fallback:', error);
      this.pianoSampler?.dispose();
      this.pianoSampler = null;
    }
  }

  private _setupEffects(): void {
    console.log('🎛️ Setting up audio effects...');
    
    this.reverb = new Tone.Reverb({
      decay: 2.0,
      wet: this.config.reverbLevel
    });
    
    this.masterCompressor = new Tone.Compressor({
      threshold: -12,
      ratio: 3,
      attack: 0.003,
      release: 0.1
    });
    
    const effectsChain = [this.reverb, this.masterCompressor, Tone.getDestination()];
    
    if (this.pianoSampler) {
      this.pianoSampler.chain(...effectsChain);
      console.log('🔗 Piano sampler connected to effects chain');
    }
    
    if (this.synthPiano) {
      this.synthPiano.chain(...effectsChain);
      console.log('🔗 Synth piano connected to effects chain');
    }
    
    console.log('✅ Effects chain setup completed');
  }

  async noteOn(midi: number, velocity: number, time: number): Promise<void> {
    await this.readyPromise;
    const note = Tone.Frequency(midi, "midi").toNote();
    const vel = Math.max(0, Math.min(1, velocity / 127));
    
    try {
      if (this.pianoSampler && this.pianoSampler.loaded) {
        this.pianoSampler.triggerAttack(note, time, vel);
      } else if (this.synthPiano) {
        this.synthPiano.triggerAttack(note, time, vel);
      }
    } catch (error) {
      console.error('❌ Note ON failed:', error);
    }
  }

  async noteOff(midi: number, time: number): Promise<void> {
    await this.readyPromise;
    const note = Tone.Frequency(midi, "midi").toNote();
    
    try {
      if (this.pianoSampler && this.pianoSampler.loaded) {
        this.pianoSampler.triggerRelease(note, time);
      } else if (this.synthPiano) {
        this.synthPiano.triggerRelease(note, time);
      }
    } catch (error) {
      console.error('❌ Note OFF failed:', error);
    }
  }

  async playPreviewNote(midi: number, velocity: number = 80, duration: number = 0.5): Promise<void> {
    await this.readyPromise;
    const note = Tone.Frequency(midi, "midi").toNote();
    const vel = Math.max(0, Math.min(1, velocity / 127));
    const now = Tone.now();
    
    try {
      if (this.pianoSampler && this.pianoSampler.loaded) {
        this.pianoSampler.triggerAttackRelease(note, duration, now, vel);
      } else if (this.synthPiano) {
        this.synthPiano.triggerAttackRelease(note, duration, now, vel);
      }
    } catch (error) {
      console.error('❌ Preview note failed:', error);
    }
  }

  setReverbLevel(level: number): void {
    const clampedLevel = Math.max(0, Math.min(1, level));
    this.config.reverbLevel = clampedLevel;
    
    if (this.reverb) {
      this.reverb.wet.value = clampedLevel;
    }
  }

  setPianoType(type: 'acoustic' | 'electric' | 'synth'): void {
    this.config.pianoType = type;
    if (this.synthPiano && type === 'electric') {
      this.synthPiano.set({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.01, decay: 0.4, sustain: 0.6, release: 0.8 }
      });
    }
  }

  getStatus(): {
    isInitialized: boolean;
    hasSampler: boolean;
    samplerLoaded: boolean;
    hasSynth: boolean;
    contextState: string;
  } {
    return {
      isInitialized: this.isInitialized,
      hasSampler: !!this.pianoSampler,
      samplerLoaded: this.pianoSampler?.loaded || false,
      hasSynth: !!this.synthPiano,
      contextState: Tone.getContext().state,
    };
  }

  dispose(): void {
    console.log('🧹 Disposing Enhanced Audio Engine...');
    
    this.pianoSampler?.dispose();
    this.synthPiano?.dispose();
    this.reverb?.dispose();
    this.masterCompressor?.dispose();
    
    this.isInitialized = false;
    this.readyPromise = new Promise((resolve) => {
      this.resolveReady = resolve;
    });
    
    console.log('✅ Enhanced Audio Engine disposed');
  }
}