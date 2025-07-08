import React from 'react';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface WebSocketOptions {
  url: string;
  protocols?: string | string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  debug?: boolean;
}

type MessageHandler = (message: WebSocketMessage) => void;
type ConnectionHandler = () => void;
type ErrorHandler = (error: Event) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private options: Required<WebSocketOptions>;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private connectionHandlers: ConnectionHandler[] = [];
  private disconnectionHandlers: ConnectionHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];
  
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private shouldReconnect = true;
  private connectionId: string = '';

  constructor(options: WebSocketOptions) {
    this.options = {
      protocols: [],
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      debug: false,
      ...options
    };
    
    this.connectionId = this.generateConnectionId();
  }

  private generateConnectionId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private log(message: string, ...args: any[]) {
    if (this.options.debug) {
      console.log(`[WebSocket:${this.connectionId}]`, message, ...args);
    }
  }

  private logError(message: string, ...args: any[]) {
    console.error(`[WebSocket:${this.connectionId}]`, message, ...args);
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // Wait for current connection attempt
        const checkConnection = () => {
          if (!this.isConnecting) {
            if (this.ws?.readyState === WebSocket.OPEN) {
              resolve();
            } else {
              reject(new Error('Connection failed'));
            }
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
        return;
      }

      this.isConnecting = true;
      this.log('Attempting to connect to', this.options.url);

      try {
        this.ws = new WebSocket(this.options.url, this.options.protocols);
        
        const connectTimeout = setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            this.ws?.close();
            this.isConnecting = false;
            reject(new Error('Connection timeout'));
          }
        }, 10000);

        this.ws.onopen = () => {
          clearTimeout(connectTimeout);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.log('Connected successfully');
          
          this.startHeartbeat();
          this.connectionHandlers.forEach(handler => handler());
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectTimeout);
          this.isConnecting = false;
          this.stopHeartbeat();
          
          this.log('Connection closed', event.code, event.reason);
          this.disconnectionHandlers.forEach(handler => handler());
          
          if (this.shouldReconnect && !event.wasClean) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectTimeout);
          this.isConnecting = false;
          this.logError('WebSocket error:', error);
          this.errorHandlers.forEach(handler => handler(error));
          
          if (this.ws?.readyState !== WebSocket.OPEN) {
            reject(error);
          }
        };

      } catch (error) {
        this.isConnecting = false;
        this.logError('Failed to create WebSocket:', error);
        reject(error);
      }
    });
  }

  private handleMessage(event: MessageEvent) {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      // Add timestamp if not present
      if (!message.timestamp) {
        message.timestamp = Date.now();
      }

      this.log('Received message:', message.type);
      
      // Handle heartbeat responses
      if (message.type === 'pong') {
        return;
      }

      // Call registered handlers for this message type
      const handlers = this.messageHandlers.get(message.type) || [];
      const allHandlers = this.messageHandlers.get('*') || [];
      
      [...handlers, ...allHandlers].forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          this.logError('Error in message handler:', error);
        }
      });

    } catch (error) {
      this.logError('Failed to parse message:', event.data, error);
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.logError('Max reconnection attempts reached');
      return;
    }

    const delay = this.options.reconnectInterval * Math.pow(1.5, this.reconnectAttempts);
    this.reconnectAttempts++;
    
    this.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        this.logError('Reconnection failed:', error);
      });
    }, delay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', { timestamp: Date.now() });
      }
    }, this.options.heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  send(type: string, data: any = {}): boolean {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      this.logError('Cannot send message: WebSocket not connected');
      return false;
    }

    try {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: Date.now()
      };

      this.ws.send(JSON.stringify(message));
      this.log('Sent message:', type);
      return true;
    } catch (error) {
      this.logError('Failed to send message:', error);
      return false;
    }
  }

  subscribe(messageType: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    
    this.messageHandlers.get(messageType)!.push(handler);
    this.log('Subscribed to message type:', messageType);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(messageType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
          this.log('Unsubscribed from message type:', messageType);
        }
      }
    };
  }

  onConnect(handler: ConnectionHandler): () => void {
    this.connectionHandlers.push(handler);
    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.disconnectionHandlers.push(handler);
    return () => {
      const index = this.disconnectionHandlers.indexOf(handler);
      if (index > -1) {
        this.disconnectionHandlers.splice(index, 1);
      }
    };
  }

  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.push(handler);
    return () => {
      const index = this.errorHandlers.indexOf(handler);
      if (index > -1) {
        this.errorHandlers.splice(index, 1);
      }
    };
  }

  disconnect() {
    this.shouldReconnect = false;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.log('Disconnected manually');
  }

  getConnectionState(): string {
    if (!this.ws) return 'DISCONNECTED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'CONNECTED';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'DISCONNECTED';
      default: return 'UNKNOWN';
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  getConnectionId(): string {
    return this.connectionId;
  }
}

// React hook for using WebSocket service
export const useWebSocket = (options: WebSocketOptions) => {
  const [ws] = React.useState(() => new WebSocketService(options));
  const [connectionState, setConnectionState] = React.useState<string>('DISCONNECTED');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const updateConnectionState = () => {
      setConnectionState(ws.getConnectionState());
    };

    const unsubscribeConnect = ws.onConnect(() => {
      updateConnectionState();
      setError(null);
    });

    const unsubscribeDisconnect = ws.onDisconnect(() => {
      updateConnectionState();
    });

    const unsubscribeError = ws.onError((error: any) => {
      setError(error.message || 'WebSocket error');
      updateConnectionState();
    });

    // Initial connection
    ws.connect().catch(error => {
      setError(error.message);
    });

    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeError();
      ws.disconnect();
    };
  }, [ws]);

  return {
    ws,
    connectionState,
    error,
    isConnected: connectionState === 'CONNECTED',
    reconnectAttempts: ws.getReconnectAttempts()
  };
};

export default WebSocketService; 