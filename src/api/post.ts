import { apiClient } from './client';
import qs from 'qs';

import type {
    TokenDto,
    GetPostsDto,
    PostListDto,
    CreatePostDto, PostDto
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
        const response = await apiClient.get<TokenDto>(`/public/posts/${id}`)
        return response.data;
    },
    create: async (data: CreatePostDto): Promise<PostDto> => {
        const response = await apiClient.post<TokenDto>('/admin-access/posts', data);
        return response.data;
    },
    edit: async (id: number, data: CreatePostDto): Promise<PostDto> => {
        const response = await apiClient.put<TokenDto>(`/admin-access/posts/${id}`, data);
        return response.data;
    },
    delete: async (id: number): Promise<undefined> => {
        await apiClient.delete<TokenDto>(`/admin-access/posts/${id}`);
    },
};