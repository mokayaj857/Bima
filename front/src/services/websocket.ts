import io from 'socket.io-client';

interface WebSocketCallbacks {
  [key: string]: Array<(data: any) => void>;
}

interface WebSocketOptions {
  authToken?: string;
  userId?: string | number;
}

class WebSocketService {
  private socket: ReturnType<typeof io> | null = null;
  private static instance: WebSocketService;
  private callbacks: WebSocketCallbacks = {};
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000; // Start with 1 second
  private authToken: string | null = null;
  private userId: string | number | null = null;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private initialize(options: WebSocketOptions = {}) {
    if (this.socket?.connected || this.isConnecting) return;
    
    this.isConnecting = true;
    
    // Store auth token and user ID if provided
    if (options.authToken) {
      this.authToken = options.authToken;
    }
    if (options.userId) {
      this.userId = options.userId;
    }
    
    // Get the base URL from environment variables or use the current host
    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || window.location.origin;
    
    console.log('Initializing WebSocket connection to:', baseUrl);
    
    // Create a new socket connection
    this.socket = io(baseUrl, {
      path: '/socket.io',
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectTimeout,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      
      // Authenticate if we have a token
      if (this.authToken) {
        this.authenticate(this.authToken);
      }
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnecting = false;

      if (reason === 'io server disconnect') {
        // The disconnection was initiated by the server, we need to reconnect manually
        this.socket?.connect();
      } else {
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('WebSocket connection error:', error.message);
      this.isConnecting = false;
      this.attemptReconnect();
    });

    // Handle authentication success/failure
    this.socket.on('authenticated', () => {
      console.log('WebSocket authenticated successfully');
      // Join user's room if user ID is available
      if (this.userId) {
        this.joinRoom(`user:${this.userId}`);
      }
    });

    this.socket.on('unauthorized', (error: { message: string }) => {
      console.error('WebSocket authentication failed:', error.message);
      // Clear invalid token
      this.authToken = null;
    });

    // Handle progress update events
    this.socket.on('progress:updated', (data: any) => {
      console.log('Received progress update:', data);
      this.triggerCallbacks('progress:updated', data);
    });
    
    // Handle acknowledgment of progress updates
    this.socket.on('progress:ack', (data: any) => {
      console.log('Progress update acknowledged by server:', data);
    });
  }

  // Subscribe to an event
  public subscribe(event: string, callback: (data: any) => void): () => void {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    
    this.callbacks[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    };
  }

  // Trigger all callbacks for an event
  private triggerCallbacks(event: string, data: any) {
    const callbacks = this.callbacks[event] || [];
    callbacks.forEach(callback => callback(data));
  }

  // Join a room (for user-specific or course-specific updates)
  public joinRoom(room: string) {
    if (!this.socket?.connected) {
      console.warn('Cannot join room: WebSocket not connected');
      return;
    }
    
    console.log(`Joining room: ${room}`);
    this.socket.emit('subscribe:course', room.replace('course:', ''));
  }

  // Leave a room
  public leaveRoom(room: string) {
    this.socket?.emit('leave', { room });
  }

  // Get the socket instance (use with caution)
  public getSocket(): ReturnType<typeof io> | null {
    return this.socket;
  }
  
  // Authenticate with the WebSocket server
  public authenticate(token: string) {
    if (!this.socket) {
      console.error('Cannot authenticate: WebSocket not initialized');
      return;
    }
    
    this.authToken = token;
    console.log('Authenticating WebSocket connection...');
    this.socket.emit('authenticate', { token });
  }
  
  // Manually connect to the WebSocket server
  public connect(options: WebSocketOptions = {}) {
    if (options.authToken) {
      this.authToken = options.authToken;
    }
    if (options.userId) {
      this.userId = options.userId;
    }
    
    if (!this.socket) {
      this.initialize(options);
    } else if (!this.socket.connected) {
      this.socket.connect();
    }
  }
  
  // Disconnect from the WebSocket server
  public disconnect() {
    if (this.socket) {
      console.log('Disconnecting WebSocket...');
      this.socket.disconnect();
    }
  }
  
  // Attempt to reconnect with exponential backoff
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnection attempts (${this.maxReconnectAttempts}) reached`);
      return;
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectTimeout * Math.pow(2, this.reconnectAttempts), 30000); // Max 30s delay
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);
    
    setTimeout(() => {
      if (this.socket && !this.socket.connected) {
        this.socket.connect();
      }
    }, delay);
  }
}

export const webSocketService = WebSocketService.getInstance();
