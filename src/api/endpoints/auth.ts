import api from '../axios';
import type { User } from '@/stores';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SessionDTO {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  lastActiveAt: string;
  createdAt: string;
  current: boolean;
}

export interface SessionLimitResponse {
  message: string;
  activeSessions: SessionDTO[];
  maxSessions: number;
}

export interface RevokeSessionRequest {
  email: string;
  password: string;
  sessionId: string;
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials, { skipAuthRedirect: true }),

  register: (userData: RegisterData) =>
    api.post<AuthResponse>('/auth/register', userData, { skipAuthRedirect: true }),

  guest: () =>
    api.post<AuthResponse>('/auth/guest', null, { skipAuthRedirect: true }),

  refreshToken: (refreshToken: string) =>
    api.post<TokenResponse>('/auth/refresh', { refreshToken }, { skipAuthRedirect: true }),

  logout: () =>
    api.post('/auth/logout'),

  revokeSessionPublic: (data: RevokeSessionRequest) =>
    api.post('/auth/revoke-session', data, { skipAuthRedirect: true }),

  getSessions: () =>
    api.get<SessionDTO[]>('/sessions'),

  revokeSession: (sessionId: string) =>
    api.delete(`/sessions/${sessionId}`),

  revokeAllOtherSessions: () =>
    api.delete('/sessions'),

  me: () =>
    api.get<User>('/auth/me'),
};
