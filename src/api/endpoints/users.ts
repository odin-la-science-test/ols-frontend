import api from '../axios';

export interface UserSearchResult {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UserDTO {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarId: string | null;
}

export const usersApi = {
  search: (query: string) =>
    api.get<UserSearchResult[]>('/users/search', { params: { query } }),

  updateAvatar: (avatarId: string | null) =>
    api.put<UserDTO>('/users/me/avatar', { avatarId }),
};
