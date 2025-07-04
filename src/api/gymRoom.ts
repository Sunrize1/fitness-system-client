import { apiClient } from './client';
import type { 
  GymRoomDto, 
  GymRoomCreateDto, 
  GymRoomUpdateDto, 
  GymRoomListDto,
  TrainMachineDto,
  TrainMachineCreateDto,
  TrainMachineUpdateDto,
  TrainMachineListDto
} from '../types';

export const gymRoomApi = {
  // Gym Rooms
  getAllGymRooms: async (name?: string): Promise<GymRoomListDto> => {
    const params = name ? { name } : {};
    const response = await apiClient.get('/gym-rooms', { params });
    return response.data;
  },

  getGymRoomById: async (id: number): Promise<GymRoomDto> => {
    const response = await apiClient.get(`/gym-rooms/${id}`);
    return response.data;
  },

  createGymRoom: async (data: GymRoomCreateDto): Promise<GymRoomDto> => {
    const response = await apiClient.post('/gym-rooms', data);
    return response.data;
  },

  updateGymRoom: async (id: number, data: GymRoomUpdateDto): Promise<GymRoomDto> => {
    const response = await apiClient.put(`/gym-rooms/${id}`, data);
    return response.data;
  },

  deleteGymRoom: async (id: number): Promise<void> => {
    await apiClient.delete(`/gym-rooms/${id}`);
  },

  // Train Machines
  getAllTrainMachines: async (name?: string, gymRoomId?: number): Promise<TrainMachineListDto> => {
    const params: any = {};
    if (name) params.name = name;
    if (gymRoomId) params.gymRoomId = gymRoomId;
    
    const response = await apiClient.get('/train-machines', { params });
    return response.data;
  },

  getTrainMachineById: async (id: number): Promise<TrainMachineDto> => {
    const response = await apiClient.get(`/train-machines/${id}`);
    return response.data;
  },

  createTrainMachine: async (data: TrainMachineCreateDto): Promise<TrainMachineDto> => {
    const response = await apiClient.post('/train-machines', data);
    return response.data;
  },

  updateTrainMachine: async (id: number, data: TrainMachineUpdateDto): Promise<TrainMachineDto> => {
    const response = await apiClient.put(`/train-machines/${id}`, data);
    return response.data;
  },

  deleteTrainMachine: async (id: number): Promise<void> => {
    await apiClient.delete(`/train-machines/${id}`);
  },
}; 