// HTTP service for backend communication
import { BackendSettings } from '../../../shared/types/ai-models';

class HttpService {
  private baseUrl: string = 'http://localhost:8899';
  private timeout: number = 10000;

  setBackendSettings(settings: BackendSettings) {
    this.baseUrl = settings.url;
    this.timeout = settings.connection_timeout;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const defaultHeaders = options.headers || {};
      const hasContentType = Object.keys(defaultHeaders).some(key => 
        key.toLowerCase() === 'content-type'
      );
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...(hasContentType ? {} : { 'Content-Type': 'application/json' }),
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw new Error(`Network error: ${error.message}`);
      }
      throw new Error('Unknown network error');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const isFormData = data instanceof FormData;
    
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      ...options,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const httpService = new HttpService();
