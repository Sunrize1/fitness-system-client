import { apiClient } from './client';
import type { EnrollmentDto, EnrollmentListDto } from '../types';

export const enrollToSession = async (sessionId: number): Promise<EnrollmentDto> => {
  const response = await apiClient.post(`/enrollments/${sessionId}`);
  return response.data;
};

export const getMyEnrollments = async (): Promise<EnrollmentListDto> => {
  const response = await apiClient.get('/enrollments/my');
  return response.data;
};

export const getSessionEnrollments = async (sessionId: number): Promise<EnrollmentListDto> => {
  const response = await apiClient.get(`/enrollments/session/${sessionId}`);
  return response.data;
};

export const cancelEnrollment = async (enrollmentId: number): Promise<void> => {
  await apiClient.delete(`/enrollments/${enrollmentId}`);
}; 