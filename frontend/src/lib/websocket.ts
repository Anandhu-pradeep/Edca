import { useAuthStore } from '@/store/useAuthStore';

type EventCallback = (payload: any) => void;

interface WebSocketEvent {
  type: string;
  payload: any;
  timestamp: number;
}

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private pingIntervalMs = 30000;
  private isIntentionalClose = false;

  private listeners: Map<string, Set<EventCallback>> = new Map();

  constructor() {
    // Native WebSocket config (NO STOMP/SockJS)
    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NEXT_PUBLIC_WS_HOST || 'localhost:8080';
    this.url = `${protocol}//${host}/ws/v1/events`;
  }

  public connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const token = useAuthStore.getState().accessToken;
    if (!token) {
      console.warn("WebSocket connection aborted: No access token available");
      return;
    }

    this.isIntentionalClose = false;
    
    // Pass JWT via query parameter since native WS in browser doesn't allow custom headers
    this.ws = new WebSocket(`${this.url}?token=${token}`);

    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
    this.ws.onerror = this.handleError.bind(this);
  }

  public disconnect() {
    this.isIntentionalClose = true;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public subscribe(eventType: string, callback: EventCallback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
    
    return () => this.unsubscribe(eventType, callback);
  }

  public unsubscribe(eventType: string, callback: EventCallback) {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  private handleOpen() {
    console.log('[WebSocket] Connected');
    this.reconnectAttempts = 0;
    this.startHeartbeat();
  }

  private handleMessage(event: MessageEvent) {
    if (event.data === 'PONG') {
      return; // Heartbeat response
    }

    try {
      const wsEvent: WebSocketEvent = JSON.parse(event.data);
      console.log(`[WebSocket] Received Event: ${wsEvent.type}`, wsEvent);

      // Global security event handling
      if (wsEvent.type === 'FORCE_LOGOUT') {
        this.disconnect();
        useAuthStore.getState().logout();
        return;
      }

      // Dispatch to subscribed listeners
      const callbacks = this.listeners.get(wsEvent.type);
      if (callbacks) {
        callbacks.forEach(cb => cb(wsEvent.payload));
      }
    } catch (e) {
      console.error('[WebSocket] Failed to parse message', e);
    }
  }

  private handleClose(event: CloseEvent) {
    console.log(`[WebSocket] Disconnected. Code: ${event.code}`);
    this.stopHeartbeat();
    this.ws = null;

    if (!this.isIntentionalClose) {
      this.attemptReconnect();
    }
  }

  private handleError(error: Event) {
    console.error('[WebSocket] Error occurred', error);
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * this.reconnectAttempts;
    console.log(`[WebSocket] Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send('PING');
      }
    }, this.pingIntervalMs);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Singleton instance
export const wsClient = new WebSocketClient();
