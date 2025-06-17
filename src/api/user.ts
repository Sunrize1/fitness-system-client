import { apiClient } from './client';
import type { UserRegistrationDto, UserLoginDto, TokenDto, UserDto } from '../types';

export const userApi = {
  register: async (data: UserRegistrationDto): Promise<TokenDto> => {
    const response = await apiClient.post<TokenDto>('/user/register', data);
    return response.data;
  },

  login: async (data: UserLoginDto): Promise<TokenDto> => {
    const response = await apiClient.post<TokenDto>('/user/login', data);
    return response.data;
  },

  getProfile: async (id: number): Promise<UserDto> => {
    const response = await apiClient.get<UserDto>(`/user/${id}/profile`);
    return response.data;
  },

  getMyProfile: async (): Promise<UserDto> => {
    const response = await apiClient.get<UserDto>('/user/my-profile');
    return response.data;
  },
}; 