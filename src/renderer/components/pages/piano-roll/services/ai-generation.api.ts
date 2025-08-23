// AI Generation API service for Piano Roll integration
import { httpService } from '../../../../lib/services/http';
import { AIGenerationParams, GenerationJob, GenerationResult } from '../../../../../shared/types/ai-generation-types';
import { convertMusicalToTechnical } from '../../../../../shared/utils/musical-constants';
import type { MIDINote } from '../components/grid-area';

export class AIGenerationAPI {
  /**
   * Start AI generation request with Prime Token System support
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

      // Process musical parameters if provided
      let processedParams = { ...params };
      
      // Check if we have musical-friendly parameters to convert
      if (params.scale_root && params.scale_type && params.creativity_level !== undefined) {
        console.log('🎼 Converting musical parameters to Prime Token format:', {
          scale_root: params.scale_root,
          scale_type: params.scale_type,
          creativity_level: params.creativity_level,
          musical_style: params.musical_style,
          rhythm_pattern: params.rhythm_pattern,
          note_density: params.note_density
        });
        
        // Convert musical parameters to technical Prime Token parameters
        const technicalParams = convertMusicalToTechnical({
          scaleRoot: params.scale_root,
          scaleType: params.scale_type,
          creativityLevel: params.creativity_level,
          musicalStyle: params.musical_style || 'Pop',
          rhythmPattern: params.rhythm_pattern || 'Simple',
          noteDensity: params.note_density || 'Moderate',
          maxNotes: params.max_notes || 32
        });
        
        // Merge technical params with other parameters
        processedParams = {
          ...processedParams,
          ...technicalParams,
          model_id: modelId
        };
        
        console.log('🔄 Converted to technical parameters:', technicalParams);
      }

      // Default generation parameters (fallback for non-musical mode)
      const defaultParams: AIGenerationParams = {
        model_id: modelId,
        mode: 'prime_note', // Default to Prime Token mode
        temperature: 0.8,
        max_notes: 32, // Reduced from 50 for better performance
        num_steps: 32,
        note_duration: 0.5,
        velocity: 80,
        channel: 0,
        // Default Prime Token params if not provided
        prime_pitch: 69, // A4 note
        prime_duration: 10,
        ...processedParams // Override with processed params
      };

      const requestBody = {
        model_id: modelId,
        parameters: defaultParams,
        existing_notes: apiNotes
      };

      console.log('🎵 Starting AI generation with Prime Token System:', {
        mode: defaultParams.mode,
        prime_pitch: defaultParams.prime_pitch,
        prime_duration: defaultParams.prime_duration,
        temperature: defaultParams.temperature,
        max_notes: defaultParams.max_notes,
        musical_context: params.scale_root ? `${params.scale_root} ${params.scale_type}` : 'Technical mode'
      });

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
