import React from 'react';
import { ModelCard } from './model-card';
import { AIModel } from '../../../../../shared/types/ai-models';

interface ModelsGridProps {
  models: AIModel[];
  loadingModelId: string | null;
  loadedModels: string[];
  lastUpdated: number;
  onLoadModel: (modelId: string) => void;
  onUnloadModel: (modelId: string) => void;
}

export const ModelsGrid: React.FC<ModelsGridProps> = ({
  models,
  loadingModelId,
  loadedModels,
  lastUpdated,
  onLoadModel,
  onUnloadModel,
}) => {
  console.log('ModelsGrid props:', { models, loadingModelId, loadedModels }); // Debug log
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {models.map((model) => {
        const isLoadingThis = loadingModelId === model.model_id || loadingModelId === model.id;
        const isLoadedThis = loadedModels.includes(model.model_id) || loadedModels.includes(model.id);
        console.log(`ModelsGrid for ${model.name}: isLoading=${isLoadingThis}, isLoaded=${isLoadedThis}, loadedModels=${JSON.stringify(loadedModels)}, modelId=${model.model_id}, id=${model.id}`);
        
        return (
          <ModelCard
            key={`${model.model_id}-${isLoadedThis}-${lastUpdated}`}
            model={model}
            isLoading={isLoadingThis}
            isLoaded={isLoadedThis}
            onLoad={() => onLoadModel(model.model_id)}
            onUnload={() => onUnloadModel(model.model_id)}
          />
        );
      })}
    </div>
  );
};
