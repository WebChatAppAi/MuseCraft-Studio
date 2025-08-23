// AI Model related types for MuseCraft backend integration

export interface AIModelConfig {
  dim: number;
  depth?: number;
  heads?: number;
  seq_len: number;
  vocab_size: number;
  pad_idx?: number;
}

export interface AIModel {
  id: string;
  model_id: string;
  name: string;
  description: string;
  model_type: 'local' | 'remote';
  architecture: string;
  status: 'available' | 'loading' | 'loaded' | 'error';
  last_used?: string;
  file_size?: string;
  parameters?: string;
  config?: AIModelConfig; // Make config optional since backend might not always provide it
}

export interface AISystemStatus {
  device: string;
  cuda_available: boolean;
  loaded_models: string[];
  loaded_count: number;
  max_models: number;
  estimated_memory_gb: number;
  gpu_memory?: {
    allocated_gb: number;
    reserved_gb: number;
    total_gb?: number;
    device_name: string;
  };
  active_jobs: number;
  models_directory: string;
}

export interface SystemInfo {
  python_version: string;
  platform: string;
  os_version: string;
  cpu_name: string;
  cpu_count: number;
  cpu_usage_percent: number;
  memory_total_gb: number;
  memory_available_gb: number;
  memory_used_gb: number;
  memory_usage_percent: number;
  disk_total_gb: number;
  disk_available_gb: number;
  disk_used_gb: number;
  gpu: {
    available: boolean;
    device_name: string;
    memory_total_gb: number;
    memory_used_gb: number;
  };
  models_loaded: number;
  plugins_loaded: number;
  timestamp: string;
}

export interface ModelLoadResponse {
  success: boolean;
  message?: string;
  model_id?: string;
}

export interface BackendSettings {
  url: string;
  websocket_url: string;
  connection_timeout: number;
  retry_attempts: number;
}
