import { apiClient } from './client';
import type { TrainMachineDto, TrainMachineListDto } from '../types';

export const getTrainMachines = async (name?: string, gymRoomId?: number) => {
  const params = new URLSearchParams();
  if (name) params.append('name', name);
  if (gymRoomId) params.append('gymRoomId', gymRoomId.toString());
  
  const res = await apiClient.get(`/train-machines${params.toString() ? `?${params}` : ''}`);
  return res.data.trainMachines || [];
};

export const getTrainMachineById = async (id: number): Promise<TrainMachineDto> => {
  const res = await apiClient.get(`/train-machines/${id}`);
  return res.data;
};

export const createTrainMachine = async (data: {
  name: string;
  description?: string;
  base64Image?: string;
  count: number;
  gymRoomId: number;
}) => {
  const res = await apiClient.post('/train-machines', data);
  return res.data;
};

export const updateTrainMachine = async (id: number, data: {
  name?: string;
  description?: string;
  base64Image?: string;
  count?: number;
}) => {
  const res = await apiClient.put(`/train-machines/${id}`, data);
  return res.data;
};

export const deleteTrainMachine = async (id: number) => {
  await apiClient.delete(`/train-machines/${id}`);
}; 