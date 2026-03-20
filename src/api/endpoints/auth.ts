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
  token: string;
  accessToken?: string;
}

export const authApi = {
  login: (credentials: LoginCredentials) => 
    api.post<AuthResponse>('/auth/login', credentials, { skipAuthRedirect: true }),
  
  register: (userData: RegisterData) => 
    api.post<{ message: string }>('/auth/register', userData, { skipAuthRedirect: true }),
  
  guest: () => 
    api.post<AuthResponse>('/auth/guest', null, { skipAuthRedirect: true }),
  
  refreshToken: () => 
    api.post<AuthResponse>('/auth/refresh', null, { skipAuthRedirect: true }),
  
  me: () => 
    api.get<User>('/auth/me'),
};
