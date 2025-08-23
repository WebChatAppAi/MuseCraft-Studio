// AI Generation API service for Piano Roll integration
import { httpService } from '../../../../lib/services/http';
import { AIGenerationParams, GenerationJob, GenerationResult } from '../../../../../shared/types/ai-generation-types';
import type { MIDINote } from '../components/grid-area';

export class AIGenerationAPI {
  /**
   * Start AI generation request
   */
  async startGeneration(
    modelId: string, 
    params: Partial<AIGenerationParams>, 
    existingNotes: MIDINote[] = [],
    includeExistingNotes: boolean = false
  ): Promise<GenerationJob> {
    try {
      // Convert MIDINote[] to API format
      const apiNotes = includeExistingNotes ? existingNotes.map(note => ({
        pitch: note.midi,
        velocity: note.velocity,
        start: note.start,
        end: note.start + note.duration,
        channel: 0 // Default channel
      })) : [];

      // Default generation parameters
      const defaultParams: AIGenerationParams = {
        model_id: modelId,
        temperature: 0.8,
        max_notes: 50,
        num_steps: 32,
        note_duration: 0.5,
        velocity: 80,
        channel: 0,
        ...params // Override with provided params
      };

      const requestBody = {
        model_id: modelId,
        parameters: defaultParams,
        existing_notes: apiNotes
      };

      console.log('🎵 Starting AI generation:', requestBody);

      const response = await httpService.post<GenerationJob>('/api/ai/generate/local', requestBody);
      
      console.log('✅ Generation request sent:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to start AI generation:', error);
      throw new Error('Failed to start AI generation');
    }
  }

  /**
   * Get generation job status
   */
  async getGenerationStatus(jobId: string): Promise<GenerationJob> {
    try {
      return await httpService.get<GenerationJob>(`/api/ai/generation/${jobId}`);
    } catch (error) {
      console.error(`❌ Failed to get generation status for job ${jobId}:`, error);
      throw new Error(`Failed to get generation status for job ${jobId}`);
    }
  }

  /**
   * Cancel generation job
   */
  async cancelGeneration(jobId: string): Promise<void> {
    try {
      await httpService.post(`/api/ai/generation/${jobId}/cancel`);
      console.log(`🛑 Generation job ${jobId} cancelled`);
    } catch (error) {
      console.error(`❌ Failed to cancel generation job ${jobId}:`, error);
      throw new Error(`Failed to cancel generation job ${jobId}`);
    }
  }

  /**
   * Convert API generation result to MIDI notes
   */
  convertResultToMIDINotes(result: GenerationResult): MIDINote[] {
    return result.notes.map((note, index) => ({
      id: `ai_generated_${result.job_id}_${index}_${Date.now()}`,
      midi: note.pitch,
      start: note.start,
      duration: note.end - note.start,
      velocity: note.velocity,
      selected: false
    }));
  }
}

export const aiGenerationAPI = new AIGenerationAPI();
