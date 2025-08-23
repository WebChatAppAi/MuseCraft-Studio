import React, { useEffect, useState } from 'react';
import { 
  Bot, 
  Loader2, 
  RefreshCw,
  Settings
} from 'lucide-react';

import { Button } from '../../ui/button';

import { useAISetupStore } from './logic/ai-setup-state';
import { BackendSettings } from '../../../../shared/types/ai-models';
import { SystemStatusCard } from './components/system-status-card';
import { ModelsGrid } from './components/models-grid';
import { NoModelsState, ConnectionErrorState } from './components/empty-states';
import { SettingsDialog } from './components/settings-dialog';
import { ConnectionStatus } from './components/connection-status';

export function AISetupPage() {
  const {
    models,
    systemStatus,
    systemInfo,
    isLoadingModels,
    isTestingConnection,
    loadingModelId,
    error,
    connectionError,
    backendSettings,
    lastUpdated,
    loadModel,
    unloadModel,
    testConnection,
    refresh,
    updateBackendSettings,
    connectWebSocket,
    disconnectWebSocket,
  } = useAISetupStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load data on component mount and setup WebSocket
  useEffect(() => {
    refresh().then(() => {
      // Connect WebSocket after successful initial data load
      if (systemStatus && !connectionError) {
        connectWebSocket();
      }
    });

    // Cleanup WebSocket on unmount
    return () => {
      disconnectWebSocket();
    };
  }, [refresh, connectWebSocket, disconnectWebSocket]);

  // Connect WebSocket when connection becomes successful
  useEffect(() => {
    if (systemStatus && !connectionError) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }
  }, [systemStatus, connectionError, connectWebSocket, disconnectWebSocket]);

  const handleTestConnection = async () => {
    const isConnected = await testConnection();
    if (isConnected) {
      await refresh();
    }
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handleSettingsSave = (newSettings: Partial<BackendSettings>) => {
    updateBackendSettings(newSettings);
    // Test connection with new settings and reconnect WebSocket
    setTimeout(async () => {
      const isConnected = await testConnection();
      if (isConnected) {
        await refresh();
        connectWebSocket(); // Reconnect with new WebSocket URL
      }
    }, 100);
  };

  // Real connection status: we're connected if we have systemStatus AND no connection error
  const isActuallyConnected = systemStatus !== null && connectionError === null;
  const hasConnectionError = connectionError !== null;
  const hasModels = models.length > 0;
  const loadedModels = systemStatus?.loaded_models || [];
  
  console.log('DEBUG - AI Setup Page State:');
  console.log('- models array:', models);
  console.log('- models.length:', models.length);
  console.log('- hasModels:', hasModels);
  console.log('- isLoadingModels:', isLoadingModels);
  console.log('- loadingModelId:', loadingModelId);
  console.log('- systemStatus.loaded_models:', loadedModels);
  
  // Debug: Check model ID matching
  models.forEach(model => {
    const isLoadedBySystem = loadedModels.includes(model.id);
    const isLoadedByModelId = loadedModels.includes(model.model_id);
    console.log(`Model ${model.name}: id="${model.id}", model_id="${model.model_id}", loaded by id=${isLoadedBySystem}, loaded by model_id=${isLoadedByModelId}`);
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
              <Bot className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI Model Setup</h1>
              <p className="text-muted-foreground">Configure and manage your AI models for music generation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSettingsClick}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            
            <ConnectionStatus
              isConnected={isActuallyConnected}
              isTestingConnection={isTestingConnection}
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isLoadingModels}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingModels ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

      </div>



      {/* System Status */}
      {systemStatus && (
        <SystemStatusCard 
          systemStatus={systemStatus} 
          systemInfo={systemInfo}
          isConnected={isActuallyConnected} 
        />
      )}

      {/* Models Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Available Models</h2>
            <p className="text-sm text-muted-foreground">
              {hasModels 
                ? `${models.length} models found in MuseCraftEngine`
                : 'No models available'
              }
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingModels && !hasConnectionError && (
          <div className="flex items-center justify-center py-8 bg-card/30 rounded-lg border border-dashed">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-400" />
              <p className="text-sm text-muted-foreground">Loading models...</p>
            </div>
          </div>
        )}

        {/* No Models State */}
        {!isLoadingModels && !hasModels && !hasConnectionError && (
          <NoModelsState systemStatus={systemStatus} />
        )}

        {/* Connection Error State */}
        {hasConnectionError && (
          <ConnectionErrorState 
            backendSettings={backendSettings}
          />
        )}

        {/* Models Grid */}
        {hasModels && !isLoadingModels && (
          <ModelsGrid
            models={models}
            loadingModelId={loadingModelId}
            loadedModels={loadedModels}
            lastUpdated={lastUpdated}
            onLoadModel={loadModel}
            onUnloadModel={unloadModel}
          />
        )}

        {/* Debug: Force show models if we have them but conditions are wrong */}
        {!hasModels && models.length > 0 && (
          <div className="bg-red-100 border border-red-300 rounded p-4 text-red-800">
            <h3>DEBUG: Models found but not showing!</h3>
            <p>Models array has {models.length} items but hasModels is {hasModels.toString()}</p>
            <pre className="text-xs mt-2">{JSON.stringify(models, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Settings Dialog */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        backendSettings={backendSettings}
        onSave={handleSettingsSave}
      />
    </div>
  );
}
