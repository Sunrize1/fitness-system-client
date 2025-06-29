import { apiClient } from './client';
import { type UserRegistrationDto, type UserLoginDto, type TokenDto, type UserDto, type UpdateProfile, type ChangeUserRoleDto, type UserListDto, type SubscriptionDto, type SubscriptionExtensionRequest, type PersonalTrainingPurchaseRequest } from '../types';

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

  updateProfile: async (data: UpdateProfile): Promise<UserDto> => {
    const response = await apiClient.put<UserDto>('/user/my-profile', data);
    return response.data;
  },

  getAllUsers: async (): Promise<UserListDto> => {
    const response = await apiClient.get<UserListDto>('/user/get-all');
    return response.data;
  },

  changeUserRole: async (data: ChangeUserRoleDto): Promise<void> => {
    await apiClient.post('/admin-access/change-user-role', data);
  }
};

export const subscriptionApi = {
  getMySubscription: async (): Promise<SubscriptionDto> => {
    const response = await apiClient.get<SubscriptionDto>('/subscription/my');
    return response.data;
  },

  extendSubscription: async (data: SubscriptionExtensionRequest): Promise<void> => {
    await apiClient.post('/subscription/extend', data);
  },

  buyPersonalTrainings: async (data: PersonalTrainingPurchaseRequest): Promise<void> => {
    await apiClient.post('/subscription/buy-trainings', data);
  }
}; 