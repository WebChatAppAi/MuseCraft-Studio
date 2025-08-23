import { UnifiedPlaybackEngine, type PlaybackState } from './unified-playback-engine';
import type { MIDINote } from '../components/grid-area';

/**
 * Simplified Playback Control Manager using Unified Engine
 * Eliminates timing conflicts and synchronization issues
 */
export class UnifiedPlaybackControls {
  private engine: UnifiedPlaybackEngine;
  private notes: MIDINote[] = [];
  private playbackState: PlaybackState;
  private isInitialized = false;
  private isTransitioning = false;
  
  // Callbacks
  private onPositionUpdate?: (position: number) => void;
  private onStateChange?: (state: PlaybackState) => void;
  private onPlayerHeadToggle?: (visible: boolean) => void;

  constructor() {
    this.engine = new UnifiedPlaybackEngine();
    this.playbackState = this.engine.getState();
    console.log('🎛️ Controls constructor: setting up engine callbacks...');
    this.setupEngine();
  }

  // Initialize the playback system
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await this.engine.initialize();
      this.isInitialized = true;
      console.log('✅ Unified Playback controls initialized');
      
      // Log audio status
      const audioStatus = this.engine.getAudioStatus();
      console.log('🎹 Audio Status:', audioStatus);
    } catch (error) {
      console.error('❌ Failed to initialize unified playback controls:', error);
    }
  }

  // Setup engine callbacks
  private setupEngine(): void {
    console.log('🎛️ Registering engine callbacks...');
    
    this.engine.onPositionChange((position) => {
      console.log(`🎛️ Controls received position update: ${position.toFixed(3)}`);
      if (this.onPositionUpdate) {
        this.onPositionUpdate(position);
      }
    });

    this.engine.onPlaybackStateChange((state) => {
      console.log('🎛️ Controls received state change:', state);
      this.playbackState = state;
      if (this.onStateChange) {
        this.onStateChange(state);
      }
    });
    
    console.log('✅ Engine callbacks registered');
  }

  // Set callbacks
  setCallbacks(callbacks: {
    onPositionUpdate?: (position: number) => void;
    onStateChange?: (state: PlaybackState) => void;
    onPlayerHeadToggle?: (visible: boolean) => void;
  }): void {
    this.onPositionUpdate = callbacks.onPositionUpdate;
    this.onStateChange = callbacks.onStateChange;
    this.onPlayerHeadToggle = callbacks.onPlayerHeadToggle;
  }

  // Update notes for playback
  setNotes(notes: MIDINote[]): void {
    this.notes = [...notes];
    this.engine.setNotes(this.notes);
  }

  // Set BPM
  setBPM(bpm: number): void {
    this.engine.setBPM(bpm);
  }

  // Handle spacebar press with proper debouncing
  handleSpaceBar(): void {
    // Ignore rapid spacebar presses
    if (this.isTransitioning) {
      console.log('🔒 Space bar ignored - transition in progress');
      return;
    }

    if (!this.isInitialized) {
      this.initialize().then(() => {
        this.togglePlayback();
      });
      return;
    }

    this.togglePlayback();
  }

  // Toggle playback with state protection
  private async togglePlayback(): Promise<void> {
    if (this.isTransitioning) {
      console.log('🔒 Toggle ignored - already transitioning');
      return;
    }

    this.isTransitioning = true;
    
    try {
      // Get actual state from engine (authoritative source)
      const engineState = this.engine.getState();
      console.log(`🔄 Current engine state: isPlaying=${engineState.isPlaying}`);
      
      if (engineState.isPlaying) {
        console.log('⏸️ Space: Stopping playback');
        this.stop();
      } else {
        console.log('▶️ Space: Starting playback from beginning');
        // Always start from beginning (position 0)
        await this.play(0);
      }
    } finally {
      // Small delay to prevent rapid toggling
      setTimeout(() => {
        this.isTransitioning = false;
      }, 100);
    }
  }

  // Start playback
  async play(fromPosition?: number): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // If no position specified, always start from beginning
    const startPosition = fromPosition ?? 0;
    console.log(`▶️ Starting playback from position: ${startPosition}`);
    await this.engine.play(startPosition);
    
    // Show player head
    if (this.onPlayerHeadToggle) {
      this.onPlayerHeadToggle(true);
    }
  }

  // Stop playback
  stop(): void {
    this.engine.stop();
    
    // Hide player head
    if (this.onPlayerHeadToggle) {
      this.onPlayerHeadToggle(false);
    }
  }

  // Pause playback
  pause(): void {
    this.engine.pause();
  }

  // Resume playback
  async resume(): Promise<void> {
    await this.engine.resume();
  }

  // Set playback position
  setPosition(position: number): void {
    this.engine.setPosition(position);
  }

  // Get current state
  getState(): PlaybackState {
    return this.playbackState;
  }

  // Play preview note
  playPreviewNote(midi: number, velocity?: number): void {
    if (this.isInitialized) {
      this.engine.playPreviewNote(midi, velocity);
    }
  }

  // Audio controls
  setReverbLevel(level: number): void {
    this.engine.setReverbLevel(level);
  }

  setPianoType(type: 'acoustic' | 'electric' | 'synth'): void {
    this.engine.setPianoType(type);
  }

  // Check if spacebar should be handled
  shouldHandleSpaceBar(event: KeyboardEvent): boolean {
    // Don't handle if user is typing in an input
    const activeElement = document.activeElement;
    if (activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.getAttribute('contenteditable') === 'true'
    )) {
      return false;
    }

    return event.code === 'Space';
  }

  // Cleanup
  dispose(): void {
    this.stop();
    this.engine.dispose();
    
    this.onPositionUpdate = undefined;
    this.onStateChange = undefined;
    this.onPlayerHeadToggle = undefined;
    
    console.log('✅ Unified Playback Controls disposed');
  }
}
