export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
  subscription?: {
    type: 'free' | 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'expired' | 'cancelled';
    expiresAt?: string;
  };
}

export interface UserProfile extends User {
  settings?: UserSettings;
}

export interface UserSettings {
  notifications: {
    email: boolean;
    browser: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
  };
  privacy: {
    sharePresence: boolean;
    allowDirectMessages: boolean;
  };
  language: string;
}
