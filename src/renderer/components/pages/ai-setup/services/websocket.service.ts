// WebSocket service for real-time updates from MuseCraftEngine
import { useAISetupStore } from '../logic/ai-setup-state';

// Global callback for piano roll integration
let pianoRollNotesCallback: ((notes: any[]) => void) | null = null;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private isConnecting = false;
  private subscriptions = ['system_status', 'model_status', 'generation', 'all'];

  constructor(private wsUrl: string) {}

  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    if (this.isConnecting) {
      console.log('WebSocket connection already in progress');
      return;
    }

    this.isConnecting = true;
    console.log('Connecting to WebSocket:', this.wsUrl);

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Subscribe to updates
        this.subscribe();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.isConnecting = false;
        this.ws = null;

        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
    }
  }

  private subscribe(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const subscriptionMessage = {
        type: 'subscribe',
        subscriptions: this.subscriptions
      };
      
      this.ws.send(JSON.stringify(subscriptionMessage));
      console.log('📡 Subscribed to:', this.subscriptions);
    }
  }

  private handleMessage(data: any): void {
    console.log('📨 RAW WebSocket message:', JSON.stringify(data, null, 2));
    
    // FORCE handle ALL messages as potential generation events
    if (data.job_id || data.id || data.data?.job_id) {
      console.log('🔥 FORCING GENERATION HANDLER:', data);
      this.handleGenerationEvent(data);
    }

    const aiSetupStore = useAISetupStore.getState();

    // Handle different message types
    switch (data.type) {
      case 'model_status':
        // Model status changed - refresh the data
        if (data.event === 'loaded' || data.event === 'unloaded') {
          console.log('🔄 Model status changed via WebSocket, refreshing...');
          // Add delay to ensure backend is fully updated
          setTimeout(async () => {
            await aiSetupStore.fetchSystemStatus();
            await aiSetupStore.fetchModels();
            console.log('✅ WebSocket-triggered refresh completed');
          }, 500);
        }
        break;

      case 'system_status':
        // System status update
        if (data.event === 'status_update') {
          console.log('🔄 System status update received');
          aiSetupStore.fetchSystemStatus();
          aiSetupStore.fetchSystemInfo();
        }
        break;

      case 'generation':
        // Handle generation events for piano roll
        console.log('🎵 GENERATION EVENT INTERCEPTED:', data);
        this.handleGenerationEvent(data);
        break;

      case 'subscription_confirmed':
        console.log('✅ Subscription confirmed:', data.subscriptions);
        break;

      case 'pong':
        console.log('🏓 Pong received');
        break;

      default:
        console.log('📨 Unhandled message type:', data.type);
    }
  }

  private handleGenerationEvent(data: any): void {
    console.log('🎵 Generation WebSocket event:', data.event, data.data);

    switch (data.event) {
      case 'started':
        console.log('🎵 Generation started via WebSocket:', data.data);
        break;

      case 'progress': {
        const progressData = data.data;
        console.log('📊 Generation progress:', progressData.progress);
        // Update AI generation store if it exists
        if ((window as any).aiGenerationStore) {
          (window as any).aiGenerationStore.updateGenerationProgress(progressData.progress * 100);
        }
        break;
      }

      case 'completed': {
        const resultData = data.data;
        console.log('🎉 Generation completed via WebSocket:', resultData);
        
        // Update AI generation store to mark generation as complete
        if ((window as any).aiGenerationStore) {
          (window as any).aiGenerationStore.completeGeneration(resultData, pianoRollNotesCallback);
        }
        break;
      }

      case 'failed':
        console.error('❌ Generation failed via WebSocket:', data.data);
        // Update AI generation store to mark generation as failed
        if ((window as any).aiGenerationStore) {
          (window as any).aiGenerationStore.cancelGeneration();
        }
        break;

      case 'cancelled':
        console.log('🛑 Generation cancelled via WebSocket:', data.data);
        // Update AI generation store to mark generation as cancelled
        if ((window as any).aiGenerationStore) {
          (window as any).aiGenerationStore.cancelGeneration();
        }
        break;

      default:
        console.log('📨 Unhandled generation event:', data.event);
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    console.log(`⏳ Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectInterval}ms`);
    
    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect();
      }
    }, this.reconnectInterval);
  }

  updateUrl(newWsUrl: string): void {
    this.wsUrl = newWsUrl;
    this.disconnect();
    // Wait a moment before reconnecting to new URL
    setTimeout(() => this.connect(), 100);
  }

  disconnect(): void {
    if (this.ws) {
      console.log('Disconnecting WebSocket');
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
  }

  ping(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const pingMessage = { type: 'ping' };
      this.ws.send(JSON.stringify(pingMessage));
      console.log('🏓 Ping sent');
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Global WebSocket service instance
let wsService: WebSocketService | null = null;

export const getWebSocketService = (wsUrl?: string): WebSocketService => {
  if (!wsService || (wsUrl && (wsService as any).wsUrl !== wsUrl)) {
    if (wsService) {
      wsService.disconnect();
    }
    wsService = new WebSocketService(wsUrl || 'ws://localhost:8899/ws');
  }
  return wsService;
};

export const disconnectWebSocket = (): void => {
  if (wsService) {
    wsService.disconnect();
    wsService = null;
  }
};

// Piano roll integration functions
export const setPianoRollNotesCallback = (callback: ((notes: any[]) => void) | null) => {
  pianoRollNotesCallback = callback;
  console.log('🎹 Piano roll notes callback registered');
};

export const clearPianoRollNotesCallback = () => {
  pianoRollNotesCallback = null;
  console.log('🎹 Piano roll notes callback cleared');
};
