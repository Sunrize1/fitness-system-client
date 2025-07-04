import { apiClient } from './client';
import type { 
  UserStatisticsDto,
  NewRegistrationsPeriodDto,
  TrainingSessionStatisticsDto,
  SubscriptionStatisticsDto,
  GymRoomStatisticsDto,
  EnrollmentStatisticsDto,
  StatisticsPeriodParams
} from '../types';

export const statisticsApi = {
  // User Statistics
  getUserOverviewStatistics: async (): Promise<UserStatisticsDto> => {
    const response = await apiClient.get('/statistics/users/overview');
    return response.data;
  },

  getNewRegistrations: async (params?: StatisticsPeriodParams): Promise<NewRegistrationsPeriodDto> => {
    const response = await apiClient.get('/statistics/users/new-registrations', { params });
    return response.data;
  },

  // Training Session Statistics
  getTrainingSessionStatistics: async (): Promise<TrainingSessionStatisticsDto> => {
    const response = await apiClient.get('/statistics/trainings/overview');
    return response.data;
  },

  // Subscription Statistics
  getSubscriptionStatistics: async (): Promise<SubscriptionStatisticsDto> => {
    const response = await apiClient.get('/statistics/subscriptions/overview');
    return response.data;
  },

  // Gym Room Statistics
  getGymRoomStatistics: async (): Promise<GymRoomStatisticsDto> => {
    const response = await apiClient.get('/statistics/gyms/overview');
    return response.data;
  },

  // Enrollment Statistics
  getEnrollmentStatistics: async (params?: StatisticsPeriodParams): Promise<EnrollmentStatisticsDto> => {
    const response = await apiClient.get('/statistics/enrollments/overview', { params });
    return response.data;
  },
}; 