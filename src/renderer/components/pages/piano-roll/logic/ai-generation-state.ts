// AI Generation state management for Piano Roll
import { create } from 'zustand';
import type { AIGenerationParams, GenerationResult } from '../../../../../shared/types/ai-generation-types';
import type { AIModel } from '../../../../../shared/types/ai-models';
import { aiGenerationAPI } from '../services/ai-generation.api';
import type { MIDINote } from '../components/grid-area';

interface AIGenerationState {
  // Model integration from AI Setup
  selectedModelId: string | null;
  availableModels: AIModel[];
  loadedModels: string[];
  
  // Generation state
  isGenerating: boolean;
  currentJobId: string | null;
  generationProgress: number;
  
  // Generation parameters
  generationParams: Partial<AIGenerationParams>;
  includeExistingNotes: boolean;
  
  // Generation history
  generationHistory: Array<{
    jobId: string;
    modelId: string;
    timestamp: string;
    notesGenerated: number;
    parameters: AIGenerationParams;
  }>;
  
  // Error handling
  error: string | null;
  
  // Actions
  setSelectedModel: (modelId: string | null) => void;
  updateAvailableModels: (models: AIModel[]) => void;
  updateLoadedModels: (loadedModels: string[]) => void;
  updateGenerationParams: (params: Partial<AIGenerationParams>) => void;
  setIncludeExistingNotes: (include: boolean) => void;
  startGeneration: (existingNotes: MIDINote[], onNotesGenerated: (notes: MIDINote[]) => void) => Promise<void>;
  updateGenerationProgress: (progress: number) => void;
  completeGeneration: (result: GenerationResult, onNotesGenerated: (notes: MIDINote[]) => void) => void;
  cancelGeneration: () => Promise<void>;
  clearError: () => void;
}

export const useAIGenerationStore = create<AIGenerationState>((set, get) => ({
  // Initial state
  selectedModelId: null,
  availableModels: [],
  loadedModels: [],
  
  isGenerating: false,
  currentJobId: null,
  generationProgress: 0,
  
  generationParams: {
    temperature: 0.8,
    max_notes: 50,
    num_steps: 32,
    note_duration: 0.5,
    velocity: 80,
    channel: 0,
  },
  includeExistingNotes: false,
  
  generationHistory: [],
  error: null,
  
  // Actions
  setSelectedModel: (modelId) => {
    set({ selectedModelId: modelId, error: null });
  },
  
  updateAvailableModels: (models) => {
    set({ availableModels: models });
    
    // Auto-select first loaded model if none selected
    const state = get();
    if (!state.selectedModelId && models.length > 0) {
      const loadedModel = models.find(model => state.loadedModels.includes(model.model_id));
      if (loadedModel) {
        set({ selectedModelId: loadedModel.model_id });
      }
    }
  },
  
  updateLoadedModels: (loadedModels) => {
    set({ loadedModels });
    
    // Clear selected model if it's no longer loaded
    const state = get();
    if (state.selectedModelId && !loadedModels.includes(state.selectedModelId)) {
      set({ selectedModelId: null });
    }
    
    // Auto-select first loaded model if none selected
    if (!state.selectedModelId && loadedModels.length > 0) {
      set({ selectedModelId: loadedModels[0] });
    }
  },
  
  updateGenerationParams: (params) => {
    set((state) => ({
      generationParams: { ...state.generationParams, ...params }
    }));
  },
  
  setIncludeExistingNotes: (include) => {
    set({ includeExistingNotes: include });
  },
  
  startGeneration: async (existingNotes, onNotesGenerated) => {
    const state = get();
    
    if (!state.selectedModelId) {
      set({ error: 'No model selected for generation' });
      return;
    }
    
    if (state.isGenerating) {
      console.log('⚠️ Generation already in progress, ignoring request');
      return;
    }
    
    set({ 
      isGenerating: true, 
      currentJobId: null, 
      generationProgress: 0, 
      error: null 
    });
    
    try {
      console.log('🎵 Starting generation with params:', {
        modelId: state.selectedModelId,
        params: state.generationParams,
        includeExistingNotes: state.includeExistingNotes,
        existingNotesCount: existingNotes.length
      });
      
      // Check WebSocket connection status before starting generation
      const wsService = (window as any).wsService;
      console.log('🔗 WebSocket status before generation:', {
        wsService: !!wsService,
        isConnected: wsService?.isConnected(),
        aiGenerationStore: !!(window as any).aiGenerationStore
      });
      
      // Ensure WebSocket is connected before generation
      if (wsService && !wsService.isConnected()) {
        console.log('🔌 WebSocket not connected, reconnecting for generation...');
        wsService.connect();
        
        // Wait a moment for connection to establish
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!wsService.isConnected()) {
          console.warn('⚠️ WebSocket still not connected, generation events may not be received');
        } else {
          console.log('✅ WebSocket reconnected for generation');
        }
      }
      
      const job = await aiGenerationAPI.startGeneration(
        state.selectedModelId,
        state.generationParams,
        existingNotes,
        state.includeExistingNotes
      );
      
      set({ currentJobId: job.job_id });
      
      console.log('✅ Generation started:', job.job_id, 'Starting REST API polling...');
      
      // Poll for completion using REST API (like Python test script)
      const pollForCompletion = async () => {
        for (let i = 0; i < 30; i++) { // 30 second timeout
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          
          try {
            const statusResponse = await fetch(`http://localhost:8899/api/ai/generation/${job.job_id}`);
            
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              const status = statusData.status;
              
              console.log(`⏳ Generation status: ${status} (${(statusData.progress || 0) * 100}%)`);
              
              if (status === 'completed') {
                console.log('🎉 Generation completed via REST API:', statusData);
                
                // Get the completion handler
                const handleCompletion = get().completeGeneration;
                handleCompletion(statusData, onNotesGenerated);
                return;
              }
              if (status === 'failed') {
                console.error('❌ Generation failed:', statusData.error);
                set({ isGenerating: false, currentJobId: null, error: statusData.error || 'Generation failed' });
                return;
              }
              
              // Update progress
              if (statusData.progress) {
                set({ generationProgress: statusData.progress * 100 });
              }
            }
          } catch (error) {
            console.error('❌ Error polling generation status:', error);
          }
        }
        
        // Timeout
        console.error('❌ Generation timeout after 30 seconds');
        set({ isGenerating: false, currentJobId: null, error: 'Generation timeout' });
      };
      
      // Start polling
      pollForCompletion();
      
      // Add to history
      const historyEntry = {
        jobId: job.job_id,
        modelId: state.selectedModelId,
        timestamp: new Date().toISOString(),
        notesGenerated: 0,
        parameters: { ...state.generationParams, model_id: state.selectedModelId } as AIGenerationParams
      };
      
      set((state) => ({
        generationHistory: [historyEntry, ...state.generationHistory.slice(0, 9)] // Keep last 10
      }));
      
    } catch (error) {
      console.error('❌ Generation failed:', error);
      set({ 
        isGenerating: false, 
        currentJobId: null, 
        error: error instanceof Error ? error.message : 'Generation failed' 
      });
    }
  },
  
  updateGenerationProgress: (progress) => {
    set({ generationProgress: progress });
  },
  
  completeGeneration: (result: any, onNotesGenerated) => {
    console.log('🎉 Generation completed:', result);
    
    // Convert backend notes to frontend format if notes exist
    if (result.result?.notes && onNotesGenerated) {
      const backendNotes = result.result.notes;
      console.log('🎹 Raw backend notes:', backendNotes);
      
      // Convert backend note format to frontend format
      const frontendNotes = backendNotes.map((note: any, index: number) => {
        // Convert time (seconds) to beats assuming 120 BPM (2 beats per second)
        const bpm = 120; // Default BPM, should ideally come from UI state
        const beatsPerSecond = bpm / 60;
        
        const frontendNote = {
          id: `generated-${Date.now()}-${index}`,
          midi: note.pitch,                                    // pitch → midi
          start: note.start * beatsPerSecond,                  // seconds → beats
          duration: (note.end - note.start) * beatsPerSecond, // (end - start) → duration in beats
          velocity: note.velocity,
          selected: false
        };
        
        console.log('🔄 Note conversion:', { backend: note, frontend: frontendNote });
        return frontendNote;
      });
      
      console.log('🎹 Sending converted notes to piano roll:', frontendNotes.length);
      onNotesGenerated(frontendNotes);
    }
    
    // Update state
    set((state) => ({
      isGenerating: false,
      currentJobId: null,
      generationProgress: 100,
      generationHistory: state.generationHistory.map(entry => 
        entry.jobId === result.id || entry.jobId === result.job_id 
          ? { ...entry, notesGenerated: result.result?.notes?.length || 0 }
          : entry
      )
    }));
    
    // Reset progress after a delay
    setTimeout(() => {
      set({ generationProgress: 0 });
    }, 2000);
  },
  
  cancelGeneration: async () => {
    const state = get();
    
    if (state.currentJobId) {
      try {
        await aiGenerationAPI.cancelGeneration(state.currentJobId);
        console.log('🛑 Generation cancelled');
      } catch (error) {
        console.error('❌ Failed to cancel generation:', error);
      }
    }
    
    set({ 
      isGenerating: false, 
      currentJobId: null, 
      generationProgress: 0 
    });
  },
  
  clearError: () => {
    set({ error: null });
  },
}));
