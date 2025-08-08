// types/firebase.ts - Firebase TypeScript type definitions

import { MessagePayload } from 'firebase/messaging';

// Firebase Configuration Types
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Notification Types
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, any>;
}

export interface CustomMessagePayload extends MessagePayload {
  notification?: NotificationPayload;
  data?: Record<string, string>;
}

// FCM Token Response
export interface FCMTokenResponse {
  token: string | null;
  error?: string;
}

// Component State Types
export interface NotificationState {
  title: string;
  body: string;
  icon?: string;
  timestamp?: number;
}

export interface NotificationComponentState {
  token: string;
  notification: NotificationState;
  isSupported: boolean;
  error: string;
  loading: boolean;
  permission: NotificationPermission;
}

// Service Worker Types
export interface ServiceWorkerMessage {
  type: 'NOTIFICATION_RECEIVED' | 'TOKEN_UPDATED';
  payload: NotificationPayload | string;
}

// API Response Types
export interface TokenSaveResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Error Types
export class FirebaseMessagingError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.name = 'FirebaseMessagingError';
    this.code = code;
  }
}

// Utility Types
export type PermissionStatus = 'granted' | 'denied' | 'default';

export interface BrowserSupport {
  serviceWorker: boolean;
  notification: boolean;
  pushManager: boolean;
  https: boolean;
}

// Hook Types
export interface UseNotificationReturn {
  token: string | null;
  loading: boolean;
  error: string | null;
  isSupported: boolean;
  requestPermission: () => Promise<void>;
  clearError: () => void;
}

// Environment Variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_FIREBASE_API_KEY: string;
      REACT_APP_FIREBASE_AUTH_DOMAIN: string;
      REACT_APP_FIREBASE_PROJECT_ID: string;
      REACT_APP_FIREBASE_STORAGE_BUCKET: string;
      REACT_APP_FIREBASE_MESSAGING_SENDER_ID: string;
      REACT_APP_FIREBASE_APP_ID: string;
      REACT_APP_VAPID_KEY: string;
    }
  }
}