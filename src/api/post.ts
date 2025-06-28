import { apiClient } from './client';
import qs from 'qs';

import type {
    TokenDto,
    GetPostsDto,
    PostListDto,
    CreatePostDto,
    PostDto,
    UpdatePostDto
} from '../types';

export const postApi = {
    get: async (data: GetPostsDto): Promise<PostListDto> => {
        const response = await apiClient.get<PostListDto>('/public/posts', {
            params: data,
            paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' })
        });
        return response.data;
    },
    getOne: async (id: number): Promise<PostDto> => {
        const response = await apiClient.get<PostDto>(`/public/posts/${id}`)
        return response.data;
    },
    create: async (data: CreatePostDto): Promise<PostDto> => {
        const response = await apiClient.post<PostDto>('/admin-access/posts', data);
        return response.data;
    },
    edit: async (id: number, data: UpdatePostDto): Promise<PostDto> => {
        const response = await apiClient.put<PostDto>(`/admin-access/posts/${id}`, data);
        return response.data;
    },
    delete: async (id: number): Promise<undefined> => {
        await apiClient.delete(`/admin-access/posts/${id}`);
    },
};

export const getPublicPosts = async (params?: {
  page?: number;
  size?: number;
  sort?: string[];
}): Promise<PostListDto> => {
  const response = await apiClient.get('/public/posts', {
    params,
    paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' })
  });
  return response.data;
};

export const getPublicPost = async (id: number): Promise<PostDto> => {
  const response = await apiClient.get(`/public/posts/${id}`);
  return response.data;
};

export const createPost = async (data: CreatePostDto): Promise<PostDto> => {
  const response = await apiClient.post('/admin-access/posts', data);
  return response.data;
};

export const updatePost = async (id: number, data: UpdatePostDto): Promise<PostDto> => {
  const response = await apiClient.put(`/admin-access/posts/${id}`, data);
  return response.data;
};

export const deletePost = async (id: number): Promise<void> => {
  await apiClient.delete(`/admin-access/posts/${id}`);
};