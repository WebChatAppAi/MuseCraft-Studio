// AI Generation types for Piano Roll integration

export interface AIGenerationParams {
  model_id: string;
  
  // Prime Token System parameters
  mode?: 'prime_note' | 'continuation' | 'free_form'; // Generation mode
  prime_pitch?: number; // MIDI note number for prime token (0-127)
  prime_duration?: number; // Prime note duration for musical coherence
  
  // Core generation parameters
  temperature: number; // 0.1 - 2.0 (creativity level)
  max_notes: number; // Maximum notes to generate
  num_steps: number; // Generation steps
  note_duration: number; // Default note duration
  velocity: number; // Default velocity
  channel: number; // MIDI channel
  seed?: number; // Random seed for reproducibility
  
  // Musical parameters (user-friendly)
  scale_root?: string; // Root note (e.g., "A", "C", "F#")
  scale_type?: 'Major' | 'Minor' | 'Pentatonic' | 'Blues' | 'Dorian' | 'Mixolydian'; // Scale type
  creativity_level?: number; // 0-100% creativity (maps to temperature)
  musical_style?: 'Classical' | 'Jazz' | 'Pop' | 'Rock' | 'Electronic' | 'Ambient'; // Musical style hint
  rhythm_pattern?: 'Simple' | 'Complex' | 'Syncopated' | 'Straight'; // Rhythm complexity
  note_density?: 'Sparse' | 'Moderate' | 'Dense'; // Note frequency
  
  // Legacy parameters for backward compatibility
  scale?: string; // Musical scale (e.g., "C_major", "A_minor")
  key?: string; // Root key
  time_signature?: string; // Time signature
  genre?: string; // Musical genre hint
  complexity?: number; // Complexity factor (0.1 - 1.0)
  rhythm_density?: number; // Rhythm complexity (0.1 - 1.0)
}

export interface GenerationJob {
  job_id: string;
  model_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0.0 - 1.0
  started_at: string;
  completed_at?: string;
  execution_time?: number;
  notes_generated?: number;
  error_message?: string;
  parameters: AIGenerationParams;
}

export interface GenerationResult {
  job_id: string;
  notes: Array<{
    pitch: number;
    velocity: number;
    start: number;
    end: number;
    channel: number;
  }>;
  metadata: {
    model_id: string;
    execution_time: number;
    notes_generated: number;
    parameters_used: AIGenerationParams;
  };
}

export interface GenerationProgress {
  job_id: string;
  progress: number;
  status: string;
  notes_generated: number;
  eta_seconds?: number;
  current_step?: number;
  total_steps?: number;
}

// WebSocket events for real-time generation updates
export interface GenerationWebSocketEvent {
  type: 'generation';
  event: 'started' | 'progress' | 'completed' | 'failed' | 'cancelled';
  data: GenerationJob | GenerationProgress | GenerationResult;
  timestamp: string;
}

export interface AIModelInfo {
  model_id: string;
  name: string;
  description: string;
  status: 'available' | 'loading' | 'loaded' | 'error';
  is_loaded: boolean;
  vocab_size: number;
  seq_length: number;
  model_size_mb: number;
  memory_usage_mb?: number;
  architecture: string;
  device?: string;
  load_time_seconds?: number;
  last_used?: string;
  error_message?: string;
}

export interface GenerationHistory {
  id: string;
  job_id: string;
  model_id: string;
  parameters: AIGenerationParams;
  result: GenerationResult;
  created_at: string;
  notes_count: number;
  execution_time: number;
}

// Plugin system integration
export interface PluginExecutionParams {
  plugin_id: string;
  parameters: Record<string, any>;
  existing_notes: Array<{
    pitch: number;
    velocity: number;
    start: number;
    end: number;
    channel: number;
  }>;
}

export interface PluginExecutionResult {
  plugin_id: string;
  execution_id: string;
  success: boolean;
  execution_time: number;
  notes_generated: number;
  notes: Array<{
    pitch: number;
    velocity: number;
    start: number;
    end: number;
    channel: number;
  }>;
  error_message?: string;
}
