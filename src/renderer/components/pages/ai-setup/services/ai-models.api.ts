// AI Models API service for MuseCraft backend integration
import { AIModel, AISystemStatus, ModelLoadResponse, SystemInfo } from '../../../../../shared/types/ai-models';
import { httpService } from '../../../../lib/services/http';

export class AIModelsAPI {
  /**
   * Get all available local AI models
   */
  async getAvailableModels(): Promise<AIModel[]> {
    try {
      const response = await httpService.get<{
        models: AIModel[];
        total_models: number;
        loaded_models: number;
      }>('/api/ai/models/local');
      
      console.log('Raw API response for models:', response); // Debug log
      return response.models; // Extract the models array
    } catch (error) {
      console.error('Failed to fetch available models:', error);
      throw new Error('Failed to fetch available models from MuseCraftEngine');
    }
  }

  /**
   * Get AI system status including loaded models
   */
  async getSystemStatus(): Promise<AISystemStatus> {
    try {
      return await httpService.get<AISystemStatus>('/api/ai/status');
    } catch (error) {
      console.error('Failed to fetch AI system status:', error);
      throw new Error('Failed to fetch AI system status from MuseCraftEngine');
    }
  }

  /**
   * Load a model into memory
   */
  async loadModel(modelId: string): Promise<ModelLoadResponse> {
    try {
      return await httpService.post<ModelLoadResponse>(`/api/ai/models/${modelId}/load`);
    } catch (error) {
      console.error(`Failed to load model ${modelId}:`, error);
      throw new Error(`Failed to load model: ${modelId}`);
    }
  }

  /**
   * Unload a model from memory
   */
  async unloadModel(modelId: string): Promise<ModelLoadResponse> {
    try {
      return await httpService.post<ModelLoadResponse>(`/api/ai/models/${modelId}/unload`);
    } catch (error) {
      console.error(`Failed to unload model ${modelId}:`, error);
      throw new Error(`Failed to unload model: ${modelId}`);
    }
  }

  /**
   * Get detailed system information
   */
  async getSystemInfo(): Promise<SystemInfo> {
    const response = await httpService.get('/api/settings/system');
    return response as SystemInfo;
  }

  /**
   * Test backend connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getSystemStatus();
      return true;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }
}

export const aiModelsAPI = new AIModelsAPI();
