import type { User } from '@supabase/supabase-js';

export type UserRole = 'CUSTOMER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';

export interface UserProfile {
  id: string;
  email: string;
  password: string | null;
  name: string | null;
  role: UserRole;
  status: UserStatus;
  phone: string | null;
  avatar: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  postalCode: string | null;
  emailVerified: string | null;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  twoFactorEnabled: boolean;
  notificationPrefs: {
    email?: boolean;
    push?: boolean;
    marketing?: boolean;
    unread?: number;
    lastChecked?: string;
    preferences?: Record<string, boolean>;
  } | null;
}

export interface UserSession {
  user: User;
  profile: UserProfile | null;
} 