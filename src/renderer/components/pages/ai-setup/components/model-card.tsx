import React from 'react';
import { 
  Bot, 
  Download, 
  Upload, 
  Loader2, 
  Cpu,
  HardDrive,
  Zap,
  Server
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { BorderBeam } from '../../../magicui/border-beam';

import { AIModel } from '../../../../../shared/types/ai-models';

interface ModelCardProps {
  model: AIModel;
  isLoading: boolean;
  isLoaded: boolean;
  onLoad: () => void;
  onUnload: () => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({
  model,
  isLoading,
  isLoaded,
  onLoad,
  onUnload,
}) => {
  console.log('ModelCard received model:', model); // Debug log
  console.log(`ModelCard ${model.name}: isLoading=${isLoading}, isLoaded=${isLoaded}`); // Debug log
  
  const getStatusColor = () => {
    if (isLoaded) return 'bg-green-500';
    if (isLoading) return 'bg-yellow-500';
    if (model.status === 'error') return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (isLoading && isLoaded) return 'Unloading...';
    if (isLoading && !isLoaded) return 'Loading...';
    if (isLoaded) return 'Loaded';
    if (model.status === 'error') return 'Error';
    return 'Available';
  };

  const getModelColor = () => {
    if (isLoaded) return 'bg-green-500/10 text-green-400';
    return 'bg-blue-500/10 text-blue-400';
  };

  const getBeamColor = () => {
    return 'via-green-400';
  };

  return (
    <Card 
      key={model.id} 
      className="relative hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${getModelColor()}`}>
            <Bot className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
            <Badge variant="secondary" className="capitalize text-xs">
              {getStatusText()}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-lg">{model.name}</CardTitle>
        <CardDescription className="text-sm">
          {model.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Model Info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-muted-foreground" />
            <span>{model.architecture || 'Transformer'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Server className="h-3 w-3 text-muted-foreground" />
            <span>Local</span>
          </div>
          {model.file_size && (
            <div className="flex items-center gap-1">
              <HardDrive className="h-3 w-3 text-muted-foreground" />
              <span>{model.file_size}</span>
            </div>
          )}
          {model.parameters && (
            <div className="flex items-center gap-1">
              <Cpu className="h-3 w-3 text-muted-foreground" />
              <span>{model.parameters}</span>
            </div>
          )}
        </div>

        {/* Config Details */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Seq: {model.config?.seq_len || 'N/A'} | Vocab: {model.config?.vocab_size || 'N/A'}</div>
          <div>Dim: {model.config?.dim || 'N/A'} | Heads: {model.config?.heads || 'N/A'}</div>
          {model.last_used && (
            <div>Last used: {new Date(model.last_used).toLocaleDateString()}</div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isLoaded ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={onUnload}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Upload className="h-3 w-3 mr-1" />
              )}
              {isLoading ? 'Unloading...' : 'Unload'}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onLoad}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Download className="h-3 w-3 mr-1" />
              )}
              {isLoading ? 'Loading...' : 'Load'}
            </Button>
          )}
        </div>
      </CardContent>

      {/* Animated border for loaded models - exactly like dashboard */}
      {isLoaded && (
        <BorderBeam
          size={200}
          duration={6}
          delay={0}
          className={`from-transparent ${getBeamColor()} to-transparent`}
          reverse={false}
        />
      )}
    </Card>
  );
};
