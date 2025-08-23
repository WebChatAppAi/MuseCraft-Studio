// AI Setup state management with Zustand
import { create } from 'zustand';
import type { AIModel, AISystemStatus, BackendSettings, SystemInfo } from '../../../../../shared/types/ai-models';
import { aiModelsAPI } from '../services/ai-models.api';
import { httpService } from '../../../../lib/services/http';
import { getWebSocketService, disconnectWebSocket } from '../services/websocket.service';

interface AISetupState {
  // Data
  models: AIModel[];
  systemStatus: AISystemStatus | null;
  systemInfo: SystemInfo | null;
  backendSettings: BackendSettings;
  
  // Loading states
  isLoading: boolean;
  isLoadingModels: boolean;
  isTestingConnection: boolean;
  loadingModelId: string | null;
  
  // Error states
  error: string | null;
  connectionError: string | null;
  
  // Force re-render trigger
  lastUpdated: number;

  // Actions
  fetchModels: () => Promise<void>;
  fetchSystemStatus: () => Promise<void>;
  fetchSystemInfo: () => Promise<void>;
  loadModel: (modelId: string) => Promise<void>;
  unloadModel: (modelId: string) => Promise<void>;
  testConnection: () => Promise<boolean>;
  updateBackendSettings: (settings: Partial<BackendSettings>) => void;
  clearError: () => void;
  refresh: () => Promise<void>;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
}

// Default backend settings
const defaultBackendSettings: BackendSettings = {
  url: 'http://localhost:8899',
  websocket_url: 'ws://localhost:8899/ws',
  connection_timeout: 10000,
  retry_attempts: 3,
};

export const useAISetupStore = create<AISetupState>((set, get) => ({
  // Initial state
  models: [],
  systemStatus: null,
  systemInfo: null,
  backendSettings: defaultBackendSettings,
  isLoading: false,
  isLoadingModels: false,
  isTestingConnection: false,
  loadingModelId: null,
  error: null,
  connectionError: null,
  lastUpdated: Date.now(),

    // Fetch available models
  fetchModels: async () => {
    set({ isLoadingModels: true, error: null });

    try {
      const models = await aiModelsAPI.getAvailableModels();
      console.log('Fetched models:', models); // Debug log
      set({ models, isLoadingModels: false, connectionError: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch models';
      set({
        models: [], // Clear models when connection fails
        systemStatus: null, // Clear system status when connection fails
        systemInfo: null, // Clear system info when connection fails
        error: errorMessage,
        isLoadingModels: false,
        connectionError: 'Unable to connect to MuseCraftEngine. Please check if the backend is running on the configured URL.'
      });
    }
  },

    // Fetch system status
  fetchSystemStatus: async () => {
    console.log('🔄 fetchSystemStatus called');
    try {
      const systemStatus = await aiModelsAPI.getSystemStatus();
      console.log('✅ Fetched system status:', systemStatus); // Debug log
      console.log('🔍 Loaded models in response:', systemStatus.loaded_models);
      set((state) => ({ 
        ...state,
        systemStatus: { ...systemStatus }, 
        connectionError: null, 
        lastUpdated: Date.now() 
      }));
      console.log('✅ System status set in state');
    } catch (error) {
      console.error('❌ fetchSystemStatus failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch system status';
      set({
        systemStatus: null, // Clear system status when connection fails
        systemInfo: null, // Clear system info when connection fails
        connectionError: 'Unable to connect to MuseCraftEngine. Please check if the backend is running on the configured URL.'
      });
    }
  },

  // Fetch detailed system information
  fetchSystemInfo: async () => {
    try {
      const systemInfo = await aiModelsAPI.getSystemInfo();
      console.log('Fetched system info:', systemInfo); // Debug log
      set({ systemInfo });
    } catch (error) {
      console.error('Failed to fetch system info:', error);
      // Don't set error for system info since it's optional additional info
    }
  },

  // Load a model
  loadModel: async (modelId: string) => {
    set({ loadingModelId: modelId, error: null });
    
    // Optimistic update - temporarily add to loaded models for immediate UI feedback
    const currentState = get();
    const optimisticLoadedModels = [...(currentState.systemStatus?.loaded_models || [])];
    if (!optimisticLoadedModels.includes(modelId)) {
      optimisticLoadedModels.push(modelId);
      set((state) => ({
        ...state,
        systemStatus: state.systemStatus ? {
          ...state.systemStatus,
          loaded_models: optimisticLoadedModels
        } : null,
        lastUpdated: Date.now()
      }));
      console.log('✨ Optimistic update applied - button should change immediately');
    }
    
    try {
      const response = await aiModelsAPI.loadModel(modelId);
      console.log('Load model response:', response); // Debug log
      
      // Check if the response indicates success (backend doesn't send 'success' field)
      const isSuccess = response.message && (
        response.message.includes('loaded successfully') || 
        response.message.includes('success')
      );
      
      if (isSuccess) {
        console.log('Model loaded successfully, refreshing status...');
        
        // Simple refresh after successful load - optimistic update already handled UI
        console.log('⏱️ Waiting 1 second for backend to sync...');
        setTimeout(async () => {
          try {
            await get().fetchSystemStatus();
            console.log('✅ Background refresh completed after model load');
          } catch (error) {
            console.error('❌ Background refresh failed:', error);
          }
        }, 1000);
      } else {
        // Revert optimistic update on failure
        console.log('❌ Load failed, reverting optimistic update');
        const currentState = get();
        const revertedLoadedModels = (currentState.systemStatus?.loaded_models || []).filter(id => id !== modelId);
        set((state) => ({
          ...state,
          systemStatus: state.systemStatus ? {
            ...state.systemStatus,
            loaded_models: revertedLoadedModels
          } : null,
          error: `Failed to load model: ${response.message || 'Unknown error'}`,
          lastUpdated: Date.now()
        }));
      }
    } catch (error) {
      // Revert optimistic update on error
      console.log('❌ Load error, reverting optimistic update');
      const currentState = get();
      const revertedLoadedModels = (currentState.systemStatus?.loaded_models || []).filter(id => id !== modelId);
      set((state) => ({
        ...state,
        systemStatus: state.systemStatus ? {
          ...state.systemStatus,
          loaded_models: revertedLoadedModels
        } : null,
        error: error instanceof Error ? error.message : 'Failed to load model',
        lastUpdated: Date.now()
      }));
      console.error('Load model error:', error); // Debug log
    } finally {
      // Ensure loadingModelId is always cleared
      set({ loadingModelId: null });
    }
  },

  // Unload a model
  unloadModel: async (modelId: string) => {
    set({ loadingModelId: modelId, error: null });
    
    // Optimistic update - temporarily remove from loaded models for immediate UI feedback
    const currentState = get();
    const optimisticLoadedModels = (currentState.systemStatus?.loaded_models || []).filter(id => id !== modelId);
    set((state) => ({
      ...state,
      systemStatus: state.systemStatus ? {
        ...state.systemStatus,
        loaded_models: optimisticLoadedModels
      } : null,
      lastUpdated: Date.now()
    }));
    console.log('✨ Optimistic unload update applied - button should change immediately');
    
    try {
      const response = await aiModelsAPI.unloadModel(modelId);
      console.log('Unload model response:', response); // Debug log
      
      // Check if the response indicates success (backend doesn't send 'success' field)
      const isSuccess = response.message && (
        response.message.includes('unloaded successfully') || 
        response.message.includes('success')
      );
      
      if (isSuccess) {
        console.log('Model unloaded successfully, refreshing status...');
        
        // Simple refresh after successful unload - optimistic update already handled UI
        console.log('⏱️ Waiting 1 second for backend to sync...');
        setTimeout(async () => {
          try {
            await get().fetchSystemStatus();
            console.log('✅ Background refresh completed after model unload');
          } catch (error) {
            console.error('❌ Background refresh failed:', error);
          }
        }, 1000);
      } else {
        // Revert optimistic update on failure - add model back
        console.log('❌ Unload failed, reverting optimistic update');
        const currentState = get();
        const revertedLoadedModels = [...(currentState.systemStatus?.loaded_models || [])];
        if (!revertedLoadedModels.includes(modelId)) {
          revertedLoadedModels.push(modelId);
        }
        set((state) => ({
          ...state,
          systemStatus: state.systemStatus ? {
            ...state.systemStatus,
            loaded_models: revertedLoadedModels
          } : null,
          error: `Failed to unload model: ${response.message || 'Unknown error'}`,
          lastUpdated: Date.now()
        }));
      }
    } catch (error) {
      // Revert optimistic update on error - add model back
      console.log('❌ Unload error, reverting optimistic update');
      const currentState = get();
      const revertedLoadedModels = [...(currentState.systemStatus?.loaded_models || [])];
      if (!revertedLoadedModels.includes(modelId)) {
        revertedLoadedModels.push(modelId);
      }
      set((state) => ({
        ...state,
        systemStatus: state.systemStatus ? {
          ...state.systemStatus,
          loaded_models: revertedLoadedModels
        } : null,
        error: error instanceof Error ? error.message : 'Failed to unload model',
        lastUpdated: Date.now()
      }));
      console.error('Unload model error:', error); // Debug log
    } finally {
      // Ensure loadingModelId is always cleared
      set({ loadingModelId: null });
    }
  },

  // Test backend connection
  testConnection: async () => {
    set({ isTestingConnection: true, connectionError: null });
    
    try {
      const isConnected = await aiModelsAPI.testConnection();
      
      if (isConnected) {
        set({ connectionError: null });
        return true;
      }
      set({ 
        models: [], // Clear models when connection fails
        systemStatus: null, // Clear system status when connection fails
        systemInfo: null, // Clear system info when connection fails
        connectionError: 'Unable to connect to MuseCraftEngine. Please check if the backend is running.' 
      });
      return false;
    } catch (error) {
      set({ 
        models: [], // Clear models when connection fails
        systemStatus: null, // Clear system status when connection fails
        systemInfo: null, // Clear system info when connection fails
        connectionError: 'Unable to connect to MuseCraftEngine. Please check if the backend is running on the configured URL.' 
      });
      return false;
    } finally {
      set({ isTestingConnection: false });
    }
  },

  // Update backend settings
  updateBackendSettings: (newSettings: Partial<BackendSettings>) => {
    const { backendSettings } = get();
    const updatedSettings = { ...backendSettings, ...newSettings };
    
    // Update HTTP service configuration
    httpService.setBackendSettings(updatedSettings);
    
    // Clear all cached data when settings change
    set({ 
      backendSettings: updatedSettings,
      models: [], // Clear models since we're changing connection
      systemStatus: null, // Clear system status since we're changing connection
      systemInfo: null, // Clear system info since we're changing connection
      connectionError: null, // Reset connection error
      error: null // Reset general error
    });
  },

  // Clear error
  clearError: () => {
    set({ error: null, connectionError: null });
  },

  // Refresh all data
  refresh: async () => {
    set({ isLoading: true });
    
    try {
      await Promise.all([
        get().fetchModels(),
        get().fetchSystemStatus(),
        get().fetchSystemInfo()
      ]);
    } finally {
      set({ isLoading: false });
    }
  },

  // WebSocket connection management
  connectWebSocket: () => {
    const { backendSettings } = get();
    const wsService = getWebSocketService(backendSettings.websocket_url);
    wsService.connect();
    
    // Expose WebSocket service globally for piano roll access
    (window as any).wsService = wsService;
    
    console.log('🔌 WebSocket connection initiated and exposed globally');
  },

  disconnectWebSocket: () => {
    disconnectWebSocket();
    console.log('🔌 WebSocket disconnected');
  },
}));
