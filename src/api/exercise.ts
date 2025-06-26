import { apiClient } from './client';
import type { FullExerciseDto } from '../types';

export const getExercises = async () => {
  const res = await apiClient.get('/exercises');
  return res.data.exercises || [];
};

export const getApproaches = async () => {
  const res = await apiClient.get('/exercises/approaches');
  return res.data.approachDtos || [];
};

export const getFullExercises = async (): Promise<FullExerciseDto[]> => {
  const res = await apiClient.get('/exercises/full');
  return res.data.fullExercises || [];
};

export const createExercise = async (title: string, description: string) => {
  await apiClient.post('/exercises', { title, description });
};

export const createApproach = async (approachesCount: number, repetitionPerApproachCount: number) => {
  await apiClient.post('/exercises/approaches', { approachesCount, repetitionPerApproachCount });
};

export const createFullExercise = async (exerciseId: number, approachId: number) => {
  await apiClient.post('/exercises/full', { exerciseId, approachId });
}; 