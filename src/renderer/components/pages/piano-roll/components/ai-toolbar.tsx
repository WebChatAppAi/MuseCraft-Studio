import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Loader2, 
  Settings, 
  ChevronDown,
  Zap,
  Music,
  Target
} from 'lucide-react';

import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Slider } from '../../../ui/slider';
import { Switch } from '../../../ui/switch';
import { Label } from '../../../ui/label';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '../../../ui/dropdown-menu';

import { BorderBeam } from '../../../magicui/border-beam';
import { useAIGenerationStore } from '../logic/ai-generation-state';
import type { MIDINote } from './grid-area';

interface AIToolbarProps {
  currentNotes: MIDINote[];
  onNotesGenerated: (notes: MIDINote[]) => void;
  className?: string;
}

export function AIToolbar({ currentNotes, onNotesGenerated, className = '' }: AIToolbarProps) {
  const {
    selectedModelId,
    availableModels,
    loadedModels,
    isGenerating,
    generationProgress,
    generationParams,
    includeExistingNotes,
    error,
    startGeneration,
    cancelGeneration,
    updateGenerationParams,
    setIncludeExistingNotes,
    clearError,
  } = useAIGenerationStore();

  // Get selected model info
  const selectedModel = availableModels.find(model => model.model_id === selectedModelId);
  const isModelLoaded = selectedModelId && loadedModels.includes(selectedModelId);
  const canGenerate = isModelLoaded && !isGenerating;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    
    clearError();
    await startGeneration(currentNotes, onNotesGenerated);
  };

  const handleCancel = async () => {
    await cancelGeneration();
  };

  // Don't show toolbar if no models are loaded
  if (loadedModels.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Model Status Indicator */}
      {isModelLoaded && selectedModel && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-card/50 rounded-lg border">
            <Bot className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-foreground">
              {selectedModel.name}
            </span>
            <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
              Loaded
            </Badge>
          </div>
        </div>
      )}

      {/* Generate Button with BorderBeam when loaded */}
      {isModelLoaded && (
        <div className="relative">
          <Button
            onClick={isGenerating ? handleCancel : handleGenerate}
            disabled={!canGenerate && !isGenerating}
            size="sm"
            className={`
              relative flex items-center gap-2 px-4 py-2 rounded-lg
              ${isGenerating 
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30' 
                : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-blue-400 border-blue-500/30'
              }
              border transition-all duration-200
            `}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cancel ({Math.round(generationProgress)}%)
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Generate
              </>
            )}
          </Button>
          
          {/* BorderBeam effect when model is loaded and ready */}
          {canGenerate && (
            <BorderBeam 
              size={250} 
              duration={12} 
              delay={9}
              colorFrom="#3b82f6"
              colorTo="#8b5cf6"
            />
          )}
        </div>
      )}

      {/* Parameters Dropdown */}
      {isModelLoaded && (
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-card/50 border-border/50 hover:bg-card/70 rounded-lg"
              >
                <Settings className="h-4 w-4" />
                Parameters
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-80 p-4"
              sideOffset={5}
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenuLabel className="flex items-center gap-2 text-popover-foreground mb-2">
                <Target className="h-4 w-4 text-blue-400" />
                Generation Parameters
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border mb-2" />
              
              <div className="space-y-4 py-2">
                {/* Temperature */}
                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-popover-foreground">Temperature</Label>
                    <span className="text-xs text-muted-foreground">
                      {generationParams.temperature?.toFixed(1) || '0.8'}
                    </span>
                  </div>
                  <Slider
                    value={[generationParams.temperature || 0.8]}
                    onValueChange={([value]) => updateGenerationParams({ temperature: value })}
                    min={0.1}
                    max={2.0}
                    step={0.1}
                    className="w-full"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower = more predictable, Higher = more creative
                  </p>
                </div>

                {/* Max Notes */}
                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-popover-foreground">Max Notes</Label>
                    <span className="text-xs text-muted-foreground">
                      {generationParams.max_notes || 50}
                    </span>
                  </div>
                  <Slider
                    value={[generationParams.max_notes || 50]}
                    onValueChange={([value]) => updateGenerationParams({ max_notes: value })}
                    min={5}
                    max={200}
                    step={5}
                    className="w-full"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Note Duration */}
                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-popover-foreground">Note Duration</Label>
                    <span className="text-xs text-muted-foreground">
                      {generationParams.note_duration || 0.5}s
                    </span>
                  </div>
                  <Slider
                    value={[generationParams.note_duration || 0.5]}
                    onValueChange={([value]) => updateGenerationParams({ note_duration: value })}
                    min={0.125}
                    max={4.0}
                    step={0.125}
                    className="w-full"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Velocity */}
                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-popover-foreground">Velocity</Label>
                    <span className="text-xs text-muted-foreground">
                      {generationParams.velocity || 80}
                    </span>
                  </div>
                  <Slider
                    value={[generationParams.velocity || 80]}
                    onValueChange={([value]) => updateGenerationParams({ velocity: value })}
                    min={1}
                    max={127}
                    step={1}
                    className="w-full"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  />
                </div>

                <DropdownMenuSeparator className="bg-border" />

                {/* Include Existing Notes Toggle */}
                <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                  <div className="space-y-1">
                    <Label className="text-sm text-popover-foreground">Include Existing Notes</Label>
                    <p className="text-xs text-muted-foreground">
                      Use current notes as context ({currentNotes.length} notes)
                    </p>
                  </div>
                  <Switch
                    checked={includeExistingNotes}
                    onCheckedChange={setIncludeExistingNotes}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
          <span className="text-xs text-red-400">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="h-auto p-0 text-red-400 hover:text-red-300"
          >
            ×
          </Button>
        </div>
      )}
    </div>
  );
}
