// Global audio initialization service
export class AudioInitializationService {
  private static instance: AudioInitializationService;
  private isInitialized = false;
  private audioContext: AudioContext | null = null;
  private soundfont: any = null;
  
  private constructor() {}

  static getInstance(): AudioInitializationService {
    if (!AudioInitializationService.instance) {
      AudioInitializationService.instance = new AudioInitializationService();
    }
    return AudioInitializationService.instance;
  }

  // Initialize audio system at app startup
  async initializeAudioSystem(): Promise<void> {
    if (this.isInitialized) {
      console.log('Audio system already initialized');
      return;
    }

    try {
      console.log('🎵 Initializing audio system at startup...');
      
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if suspended (required by browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Pre-load soundfont for immediate playback
      await this.preloadSoundfont();

      this.isInitialized = true;
      console.log('✅ Audio system initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize audio system:', error);
      // Continue without audio - the app should still work
    }
  }

  // Pre-load soundfont for immediate use
  private async preloadSoundfont(): Promise<void> {
    try {
      if (!this.audioContext) return;

      // Dynamic import to avoid loading issues
      const Soundfont = (await import('soundfont-player')).default;
      
      // Load default piano soundfont
      this.soundfont = await Soundfont.instrument(this.audioContext, 'acoustic_grand_piano');
      console.log('🎹 Default piano soundfont preloaded');
      
    } catch (error) {
      console.warn('⚠️ Could not preload soundfont, will use fallback:', error);
    }
  }

  // Get initialized audio context
  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  // Get preloaded soundfont
  getSoundfont(): any {
    return this.soundfont;
  }

  // Check if audio is ready
  isAudioReady(): boolean {
    return this.isInitialized && this.audioContext !== null;
  }

  // Play a test note to verify audio works
  async playTestNote(): Promise<boolean> {
    try {
      if (this.soundfont && this.audioContext) {
        this.soundfont.play(60, this.audioContext.currentTime, { gain: 0.1, duration: 0.3 });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Test note failed:', error);
      return false;
    }
  }

  // Force audio context resume (needed for user interaction)
  async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      console.log('🔊 Audio context resumed');
    }
  }

  // Get audio context state
  getAudioState(): string {
    return this.audioContext?.state || 'not-initialized';
  }
}
