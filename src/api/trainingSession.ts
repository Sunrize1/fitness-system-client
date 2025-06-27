import { apiClient } from './client';
import { formatDateForBackend } from '../utils/dateUtils';
import type { 
  CreateTrainingSessionDto, 
  TrainingSessionDto, 
  TrainingSessionListDto,
  UpdateTrainingSessionDto 
} from '../types';

export const createTrainingSession = async (data: CreateTrainingSessionDto): Promise<TrainingSessionDto> => {
  const response = await apiClient.post('/training-sessions', data);
  return response.data;
};

export const getTrainingSessions = async (params?: {
  page?: number;
  size?: number;
  sort?: string[];
  startDate?: string | Date;
  endDate?: string | Date;
  trainerId?: number;
}): Promise<TrainingSessionListDto> => {
  const formattedParams = { ...params };
  if (params?.startDate && params.startDate instanceof Date) {
    formattedParams.startDate = formatDateForBackend(params.startDate);
  }
  if (params?.endDate && params.endDate instanceof Date) {
    formattedParams.endDate = formatDateForBackend(params.endDate);
  }
  
  const response = await apiClient.get('/training-sessions', { params: formattedParams });
  return response.data;
};

export const getTrainingSession = async (id: number): Promise<TrainingSessionDto> => {
  const response = await apiClient.get(`/training-sessions/${id}`);
  return response.data;
};

export const updateTrainingSession = async (id: number, data: UpdateTrainingSessionDto): Promise<TrainingSessionDto> => {
  const response = await apiClient.put(`/training-sessions/${id}`, data);
  return response.data;
};

export const deleteTrainingSession = async (id: number): Promise<void> => {
  await apiClient.delete(`/training-sessions/${id}`);
};

export const attachFullExercise = async (id: number, exerciseIds: number[]): Promise<void> => {
  await apiClient.post(`/training-sessions/${id}/attach-full-exercise`, { exerciseIds });
};

export const detachFullExercise = async (id: number, fullExerciseId: number): Promise<void> => {
  await apiClient.post(`/training-sessions/${id}/detach-full-exercise`, { fullExerciseId });
}; 