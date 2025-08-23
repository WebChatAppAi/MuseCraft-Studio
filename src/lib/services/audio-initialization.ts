/**
 * Audio Initialization Service for MuseCraft
 * Handles Web Audio API setup and management
 */

export class AudioInitializationService {
  private static instance: AudioInitializationService;
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): AudioInitializationService {
    if (!AudioInitializationService.instance) {
      AudioInitializationService.instance = new AudioInitializationService();
    }
    return AudioInitializationService.instance;
  }

  /**
   * Initialize the audio system with user interaction requirement handling
   */
  async initializeAudioSystem(): Promise<void> {
    if (this.isInitialized && this.audioContext?.state === 'running') {
      return; // Already initialized and running
    }

    // Prevent multiple simultaneous initializations
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  private async _performInitialization(): Promise<void> {
    try {
      console.log('🎵 Initializing audio system...');

      // Create AudioContext if it doesn't exist
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
        console.log('✅ AudioContext created');
      }

      // Resume context if suspended (required after user interaction)
      if (this.audioContext.state === 'suspended') {
        console.log('🔓 Resuming suspended AudioContext...');
        await this.audioContext.resume();
        console.log('✅ AudioContext resumed');
      }

      // Verify context is running
      if (this.audioContext.state !== 'running') {
        throw new Error(`AudioContext failed to start. State: ${this.audioContext.state}`);
      }

      this.isInitialized = true;
      console.log(`✅ Audio system initialized successfully (sample rate: ${this.audioContext.sampleRate}Hz)`);
    } catch (error) {
      console.error('❌ Failed to initialize audio system:', error);
      this.audioContext = null;
      this.isInitialized = false;
      throw error;
    } finally {
      this.initializationPromise = null;
    }
  }

  /**
   * Get the current AudioContext
   */
  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  /**
   * Check if audio system is ready for use
   */
  isAudioReady(): boolean {
    return this.isInitialized && 
           this.audioContext !== null && 
           this.audioContext.state === 'running';
  }

  /**
   * Get current audio system status
   */
  getStatus(): {
    isInitialized: boolean;
    contextState: string | null;
    sampleRate: number | null;
    currentTime: number | null;
  } {
    return {
      isInitialized: this.isInitialized,
      contextState: this.audioContext?.state || null,
      sampleRate: this.audioContext?.sampleRate || null,
      currentTime: this.audioContext?.currentTime || null,
    };
  }

  /**
   * Cleanup audio resources
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up audio system...');
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      await this.audioContext.close();
      console.log('✅ AudioContext closed');
    }

    this.audioContext = null;
    this.isInitialized = false;
    this.initializationPromise = null;
  }

  /**
   * Handle user interaction to enable audio
   * Call this on first user click/tap to enable audio
   */
  async handleUserInteraction(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeAudioSystem();
    } else if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
      console.log('✅ AudioContext resumed after user interaction');
    }
  }
}