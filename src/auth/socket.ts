
import { io, Socket } from 'socket.io-client';

interface SocketOptions {
  userId?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  private constructor() {}

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  connect(options: SocketOptions = {}): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.isConnecting) {
      //console.warn('Bağlantı zaten kurulmaya çalışılıyor...');
      return this.socket!;
    }

    this.isConnecting = true;

    this.socket = io(import.meta.env.VITE_APP_SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      forceNew: false,
      timeout: 20000,
    });

    this.setupEventListeners(options);

    return this.socket;
  }

  private setupEventListeners(options: SocketOptions) {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket bağlantısı başarılı:', this.socket?.id);
      this.isConnecting = false;
      this.reconnectAttempts = 0;

      if (options.userId) {
        this.socket?.emit('joinRoom', options.userId);
      }

      options.onConnect?.();
    });

    this.socket.on('connectionSuccess', (data) => {
      //console.log('Oda bağlantısı başarılı:', data);
    });

    this.socket.on('connectionError', (error) => {
      //console.error('Oda bağlantı hatası:', error);
      options.onError?.(new Error(error.message));
    });

    this.socket.on('connect_error', (error) => {
      //console.error('Socket bağlantı hatası:', error.message);
      this.handleReconnect();
      options.onError?.(error);
    });

    this.socket.on('disconnect', (reason) => {
      //console.warn('Socket bağlantısı kesildi:', reason);
      this.isConnecting = false;
      options.onDisconnect?.();

      if (reason === 'io server disconnect') {
        // Sunucu bağlantıyı kapattı, manuel yeniden bağlanma gerekiyor
        this.handleReconnect();
      }
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      //console.error('Maksimum yeniden bağlanma denemesi aşıldı');
      this.cleanup();
      return;
    }

    if (this.isConnecting) return;

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    //console.log(`Bağlantı tekrar deneniyor ${delay / 1000} saniye içinde... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (!this.socket?.connected) {
        //console.log('Yeniden bağlanıyor...');
        this.socket?.connect();
      }
    }, delay);
  }

  cleanup() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }
}

// Export edilecek fonksiyonlar
export const getSocket = (options?: SocketOptions): Socket => {
  return SocketManager.getInstance().connect(options);
};

export const cleanupSocket = (): void => {
  SocketManager.getInstance().cleanup();
};