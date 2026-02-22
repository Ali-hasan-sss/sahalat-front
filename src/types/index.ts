/**
 * أنواع مشتركة للتطبيق وإدارة الحالة
 */

export type Language = 'ar' | 'en';
export type ThemeMode = 'light' | 'dark';

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  role: 'USER' | 'ADMIN';
  isVerified: boolean;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ThemeState {
  mode: ThemeMode;
}

export interface LanguageState {
  locale: Language;
}

export type RequestStatus = 'idle' | 'pending' | 'success' | 'error';

export interface RequestState {
  /** مفتاح: اسم الطلب (مثل 'trips_list', 'login')، القيمة: الحالة */
  byKey: Record<string, { status: RequestStatus; error: string | null }>;
}

export interface RootState {
  auth: AuthState;
  theme: ThemeState;
  language: LanguageState;
  requests: RequestState;
}
