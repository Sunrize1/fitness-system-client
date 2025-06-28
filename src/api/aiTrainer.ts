import { apiClient } from './client';
import type { CoachAIRequestDto, CoachAIResponseDto } from '../types';

export const aiTrainerApi = {
  async getAdvice(request: CoachAIRequestDto): Promise<CoachAIResponseDto> {
    const response = await apiClient.post<CoachAIResponseDto>('/ai-trainer/advice', request);
    return response.data;
  },
}; 