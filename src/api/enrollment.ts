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

export const isEnrolledToSession = async (trainingSessionId: number): Promise<boolean> => {
  const response = await apiClient.get(`/enrollments/is-exists-by-training-session-for-user/${trainingSessionId}`);
  return response.data;
};

export const hasEnrollments = async (sessionId: number): Promise<boolean> => {
  try {
    const enrollments = await getSessionEnrollments(sessionId);
    return enrollments.enrollments.length > 0;
  } catch (error) {
    console.error('Error checking enrollments:', error);
    return false;
  }
};

export const assignEnrollmentToUser = async (sessionId: number, userToAssignId: number): Promise<void> => {
  await apiClient.post(`/enrollments/make-enrollment-for-session-for-user/${sessionId}/${userToAssignId}`);
};

export const approveEnrollment = async (enrollmentId: number): Promise<void> => {
  await apiClient.post(`/enrollments/approve-enrollment/${enrollmentId}`);
};

export const getTrainerEnrollmentRequests = async (): Promise<EnrollmentListDto> => {
  const response = await apiClient.get('/enrollments/trainer/my-enrollments');
  return response.data;
}; 