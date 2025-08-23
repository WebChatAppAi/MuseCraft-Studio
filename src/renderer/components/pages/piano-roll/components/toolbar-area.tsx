import { 
  MousePointer2, 
  Pencil, 
  SlidersHorizontal,
  Play,
  Square,
  Pause,
  Bot,
  Settings,
  ChevronDown,
  Zap,
  Target,
  Loader2,
  Download,
  Music,
  ToggleLeft,
  Palette,
  TrendingUp,
  Volume2,
  BarChart3
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
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../../../ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';

import { useAIGenerationStore } from '../logic/ai-generation-state';
import { 
  MUSICAL_SCALES, 
  SCALE_TYPES, 
  MUSICAL_STYLES, 
  RHYTHM_PATTERNS, 
  NOTE_DENSITY,
  getScaleDisplayName 
} from '../../../../../shared/utils/musical-constants';
import type { MIDINote } from './grid-area';
import { Instruments, type InstrumentType } from './instruments';

export type Tool = 'select' | 'draw';
export type { InstrumentType } from './instruments';

interface ToolbarAreaProps {
  currentTool: Tool;
  bpm: number[];
  showVelocityLane: boolean;
  showPanLane: boolean;
  isPlaying?: boolean;
  selectedInstrument?: InstrumentType;
  onToolChange: (tool: Tool) => void;
  onBpmChange: (bpm: number[]) => void;
  onVelocityLaneToggle: (show: boolean) => void;
  onPanLaneToggle: (show: boolean) => void;
  onPlayToggle?: () => void;
  onStop?: () => void;
  onInstrumentChange?: (instrument: InstrumentType) => void;
  // AI Props
  currentNotes: MIDINote[];
  onNotesGenerated: (notes: MIDINote[]) => void;
  onExportDragStart: () => void;
}

export function ToolbarArea({
  currentTool,
  bpm,
  showVelocityLane,
  showPanLane,
  isPlaying = false,
  selectedInstrument,
  onToolChange,
  onBpmChange,
  onVelocityLaneToggle,
  onPanLaneToggle,
  onPlayToggle,
  onStop,
  onInstrumentChange,
  currentNotes,
  onNotesGenerated,
  onExportDragStart
}: ToolbarAreaProps) {
  // AI Generation Store
  const {
    selectedModelId,
    availableModels,
    loadedModels,
    isGenerating,
    generationProgress,
    generationParams,
    musicalParams,
    useMusicalMode,
    includeExistingNotes,
    error,
    startGeneration,
    cancelGeneration,
    updateGenerationParams,
    updateMusicalParams,
    setUseMusicalMode,
    setIncludeExistingNotes,
    clearError,
  } = useAIGenerationStore();

  // Get selected model info
  const selectedModel = availableModels.find(model => model.model_id === selectedModelId);
  const isModelLoaded = selectedModelId && loadedModels.includes(selectedModelId);
  const canGenerate = isModelLoaded && !isGenerating;

  // Debug logging for state values
  console.log('🔧 Toolbar render - useMusicalMode:', useMusicalMode);
  console.log('🔧 Toolbar render - includeExistingNotes:', includeExistingNotes);

  const handleGenerate = async () => {
    if (!canGenerate) return;
    
    clearError();
    await startGeneration(currentNotes, onNotesGenerated);
  };

  const handleCancel = async () => {
    await cancelGeneration();
  };
  return (
    <div className="flex items-center justify-between h-12 px-4 bg-card border-b border-border flex-shrink-0">
      <div className="flex items-center gap-2">
        {/* Tool Buttons */}
        <div className="flex items-center gap-1 mr-4">
          <Button
            variant={currentTool === 'select' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onToolChange('select')}
            className="h-8 w-8 p-0 rounded-lg"
          >
            <MousePointer2 className="h-4 w-4" />
          </Button>
          <Button
            variant={currentTool === 'draw' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onToolChange('draw')}
            className="h-8 w-8 p-0 rounded-lg"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1 mr-4 border-r border-border pr-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPlayToggle}
            className={`h-8 w-8 p-0 rounded-lg ${isPlaying ? 'text-green-400 hover:text-green-300' : 'hover:text-green-400'}`}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onStop}
            className="h-8 w-8 p-0 rounded-lg hover:text-red-400"
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>
        
        {/* BPM Slider */}
        <div className="flex items-center gap-2 mr-4">
          <span className="text-sm font-medium text-muted-foreground">BPM:</span>
          <div className="w-24">
            <Slider
              value={bpm}
              onValueChange={onBpmChange}
              min={60}
              max={200}
              step={1}
              className="h-6"
            />
          </div>
          <span className="text-sm font-mono bg-muted px-2 py-1 rounded-lg text-muted-foreground min-w-[3rem] text-center">
            {bpm[0]}
          </span>
        </div>
        
        {/* Lanes Toggler */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Visible Lanes</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={showVelocityLane}
              onCheckedChange={onVelocityLaneToggle}
            >
              Show Velocity Lane
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showPanLane}
              onCheckedChange={onPanLaneToggle}
            >
              Show Pan Lane
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Instruments Selector */}
        <Instruments 
          selectedInstrument={selectedInstrument}
          onInstrumentChange={onInstrumentChange}
        />

        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <div
            className={`h-8 w-8 p-0 rounded-lg inline-flex items-center justify-center ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              currentNotes.length === 0
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-grab hover:bg-accent hover:text-accent-foreground'
            }`}
            onMouseDown={(e) => {
              if (currentNotes.length > 0) {
                e.preventDefault();
                
                const startX = e.clientX;
                const startY = e.clientY;
                const DRAG_THRESHOLD = 5;

                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const dx = Math.abs(moveEvent.clientX - startX);
                  const dy = Math.abs(moveEvent.clientY - startY);
                  if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
                    onExportDragStart();
                    cleanup();
                  }
                };

                const handleMouseUp = () => {
                  cleanup();
                };

                const cleanup = () => {
                  window.removeEventListener('mousemove', handleMouseMove);
                  window.removeEventListener('mouseup', handleMouseUp);
                };

                window.addEventListener('mousemove', handleMouseMove);
                window.addEventListener('mouseup', handleMouseUp);
              }
            }}
            title="Export MIDI"
          >
            <Download className="h-4 w-4" />
          </div>
        </div>
        
        {/* AI Components - Only show when model is loaded */}
        {isModelLoaded && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* AI Model Info */}
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-card/50 rounded-lg border max-w-[200px]">
                <Bot className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span 
                  className="text-sm font-medium text-foreground truncate max-w-[120px]"
                  title={selectedModel?.name}
                >
                  {selectedModel?.name}
                </span>
                <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/30 flex-shrink-0">
                  Loaded
                </Badge>
              </div>
            </div>

            {/* Generate Button - Clean with glow effect */}
            <div className="relative flex-shrink-0">
              {isGenerating ? (
                <button
                  onClick={handleCancel}
                  className="cursor-pointer px-3 py-1.5 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-200 text-red-700 rounded-md dark:border-red-800 dark:text-red-400 dark:from-red-500/20 dark:to-red-600/20 hover:from-red-500/20 hover:to-red-600/20 transition-all"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Cancel ({Math.round(generationProgress)}%)</span>
                  </div>
                </button>
              ) : (
                <button
                  onClick={canGenerate ? handleGenerate : undefined}
                  disabled={!canGenerate}
                  className={`px-3 py-1.5 border border-emerald-200 text-emerald-700 bg-emerald-50 rounded-md dark:border-emerald-800 dark:text-emerald-400 dark:bg-emerald-950 transition-all ${
                    canGenerate 
                      ? 'cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/50 shadow-emerald-500/20 shadow-lg hover:shadow-emerald-500/30 hover:shadow-xl' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4" />
                    <span>Generate {useMusicalMode ? `${musicalParams.scaleRoot} ${musicalParams.scaleType}` : 'AI'}</span>
                  </div>
                </button>
              )}
            </div>

            {/* Parameters Dropdown */}
            <div className="relative flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-card/50 border-border/50 hover:bg-card/70 rounded-lg"
                  >
                    <Music className="h-4 w-4" />
                    {useMusicalMode ? 'Musical' : 'Technical'}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-96 p-4 max-h-[80vh] overflow-visible"
                  sideOffset={5}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  avoidCollisions={false}
                  sticky="always"
                >
                  <div className="space-y-4">
                    {/* Mode Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm text-popover-foreground flex items-center gap-2">
                          <ToggleLeft className="h-4 w-4" />
                          Parameter Mode
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {useMusicalMode ? 'Musical terms for musicians' : 'Technical parameters for developers'}
                        </p>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={useMusicalMode}
                          onCheckedChange={(checked) => {
                            console.log('Toggle switch changed to:', checked);
                            setUseMusicalMode(checked);
                          }}
                        />
                      </div>
                    </div>

                    <DropdownMenuSeparator className="bg-border" />

                    {useMusicalMode ? (
                      // Musical Mode Controls
                      <div className="space-y-4">
                        <DropdownMenuLabel className="flex items-center gap-2 text-popover-foreground">
                          <Music className="h-4 w-4 text-purple-400" />
                          Musical Settings
                        </DropdownMenuLabel>

                        {/* Scale and Type */}
                        <div className="grid grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
                          <div className="space-y-2">
                            <Label className="text-sm text-popover-foreground">Scale Root</Label>
                            <Select
                              value={musicalParams.scaleRoot}
                              onValueChange={(value) => updateMusicalParams({ scaleRoot: value })}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent 
                                className="z-[9999] max-h-[200px] overflow-auto"
                                position="popper"
                                sideOffset={8}
                                avoidCollisions={true}
                                sticky="always"
                              >
                                {MUSICAL_SCALES.map(scale => (
                                  <SelectItem key={scale} value={scale}>
                                    {getScaleDisplayName(scale)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm text-popover-foreground">Scale Type</Label>
                            <Select
                              value={musicalParams.scaleType}
                              onValueChange={(value: any) => updateMusicalParams({ scaleType: value })}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent 
                                className="z-[9999] max-h-[200px] overflow-auto"
                                position="popper"
                                sideOffset={8}
                                avoidCollisions={true}
                                sticky="always"
                              >
                                {Object.entries(SCALE_TYPES).map(([key, config]) => (
                                  <SelectItem key={key} value={key}>
                                    <div>
                                      <div className="font-medium">{config.label}</div>
                                      <div className="text-xs text-muted-foreground">{config.description}</div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Creativity Level */}
                        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm text-popover-foreground flex items-center gap-2">
                              <TrendingUp className="h-3 w-3" />
                              Creativity
                            </Label>
                            <span className="text-xs text-muted-foreground">
                              {musicalParams.creativityLevel}%
                            </span>
                          </div>
                          <Slider
                            value={[musicalParams.creativityLevel]}
                            onValueChange={([value]) => updateMusicalParams({ creativityLevel: value })}
                            min={0}
                            max={100}
                            step={5}
                            className="w-full"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          />
                          <p className="text-xs text-muted-foreground">
                            Low = predictable melodies, High = experimental sounds
                          </p>
                        </div>

                        {/* Musical Style */}
                        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                          <Label className="text-sm text-popover-foreground flex items-center gap-2">
                            <Palette className="h-3 w-3" />
                            Musical Style
                          </Label>
                          <Select
                            value={musicalParams.musicalStyle}
                            onValueChange={(value: any) => updateMusicalParams({ musicalStyle: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent 
                              className="z-[9999] max-h-[200px] overflow-auto"
                              position="popper"
                              sideOffset={8}
                              avoidCollisions={true}
                              sticky="always"
                            >
                              {Object.entries(MUSICAL_STYLES).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  <div>
                                    <div className="font-medium">{config.label}</div>
                                    <div className="text-xs text-muted-foreground">{config.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Rhythm Pattern and Note Density */}
                        <div className="grid grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
                          <div className="space-y-2">
                            <Label className="text-sm text-popover-foreground flex items-center gap-2">
                              <BarChart3 className="h-3 w-3" />
                              Rhythm
                            </Label>
                            <Select
                              value={musicalParams.rhythmPattern}
                              onValueChange={(value: any) => updateMusicalParams({ rhythmPattern: value })}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent 
                                className="z-[9999] max-h-[200px] overflow-auto"
                                position="popper"
                                sideOffset={8}
                                avoidCollisions={true}
                                sticky="always"
                              >
                                {Object.entries(RHYTHM_PATTERNS).map(([key, config]) => (
                                  <SelectItem key={key} value={key}>
                                    <div>
                                      <div className="font-medium text-xs">{config.label}</div>
                                      <div className="text-xs text-muted-foreground">{config.description}</div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm text-popover-foreground flex items-center gap-2">
                              <Volume2 className="h-3 w-3" />
                              Density
                            </Label>
                            <Select
                              value={musicalParams.noteDensity}
                              onValueChange={(value: any) => updateMusicalParams({ noteDensity: value })}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent 
                                className="z-[9999] max-h-[200px] overflow-auto"
                                position="popper"
                                sideOffset={8}
                                avoidCollisions={true}
                                sticky="always"
                              >
                                {Object.entries(NOTE_DENSITY).map(([key, config]) => (
                                  <SelectItem key={key} value={key}>
                                    <div>
                                      <div className="font-medium text-xs">{config.label}</div>
                                      <div className="text-xs text-muted-foreground">{config.description}</div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Technical Mode Controls (existing)
                      <div className="space-y-4">
                        <DropdownMenuLabel className="flex items-center gap-2 text-popover-foreground">
                          <Target className="h-4 w-4 text-blue-400" />
                          Technical Parameters
                        </DropdownMenuLabel>

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
                        </div>

                        {/* Max Notes */}
                        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm text-popover-foreground">Max Notes</Label>
                            <span className="text-xs text-muted-foreground">
                              {generationParams.max_notes || 32}
                            </span>
                          </div>
                          <Slider
                            value={[generationParams.max_notes || 32]}
                            onValueChange={([value]) => updateGenerationParams({ max_notes: value })}
                            min={5}
                            max={200}
                            step={5}
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
                      </div>
                    )}

                    <DropdownMenuSeparator className="bg-border" />

                    {/* Include Existing Notes Toggle */}
                    <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-1">
                        <Label className="text-sm text-popover-foreground">Include Existing Notes</Label>
                        <p className="text-xs text-muted-foreground">
                          Use current notes as context ({currentNotes.length} notes)
                        </p>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={includeExistingNotes}
                          onCheckedChange={(checked) => {
                            console.log('Include existing notes changed to:', checked);
                            setIncludeExistingNotes(checked);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

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
        )}

      </div>
      
      {/* Force Select dropdowns to break out of containers */}
      <style>{`
        [data-radix-select-content] {
          z-index: 10000 !important;
          position: fixed !important;
        }
        
        [data-radix-popper-content-wrapper] {
          z-index: 10000 !important;
        }
        
        .radix-select-content {
          z-index: 10000 !important;
          position: fixed !important;
        }
      `}</style>
    </div>
  );
}
