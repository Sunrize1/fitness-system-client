import type { ReactNode } from 'react';
import React, { createContext, RefObject, useContext, useEffect, useRef, useState } from 'react';
import type { CreatePostDto, PostDto } from '../types';

import { useAuth } from "./AuthContext.tsx";
import { postApi } from "../api/post.ts";
import { notifications } from "@mantine/notifications";
import { useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface PostsContextType {
    posts: PostDto[];
    setPosts: (posts: PostDto[]) => void;
    isLoadingPosts: boolean;
    formOpened: boolean;
    postEdit: PostDto | undefined;
    loaderRef: RefObject<HTMLDivElement>;
    isAdmin: boolean;
    toggleFormOpenness: () => void;
    editPost: (id: number, data: CreatePostDto) => Promise<void>;
    createPost: (data: CreatePostDto) => Promise<void>;
    handleCloseForm: () => void;
    deletePost: (id: number) => void;
    setPostEdit: (post: PostDto) => void;
    postOpened: boolean;
    getOnePost: () => Promise<PostDto>;
    setPostOpened: (postOpened: boolean) => void;
    formatDate: (dateString: Date) => string;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const PostsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<PostDto[]>([]);
    const [page, setPage] = useState(0);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [formOpened, setFormOpened] = useState(false);
    const [postEdit, setPostEdit] = useState<PostDto | undefined>()
    const loaderRef = useRef<HTMLDivElement>(null);
    const { id } = useParams<{ id: string }>();
    const [postOpened, setPostOpened] = useState(!!id)
    const isAdmin = user?.userRole === "ADMIN";

    console.log(123, postEdit)

    const loadMorePosts = async () => {
        if (isLoadingPosts || !hasMore || postOpened) return;

        setIsLoadingPosts(true);
        try {
            const response = await postApi.get({ page, size: 5 });
            const resolvedPosts = await Promise.all(response.posts);

            if (response.posts.length === 0) {
                setHasMore(false);
                return;
            }

            setPosts((prev) => [...prev, ...resolvedPosts]);
            setPage((prev) => prev + 1);
            setHasMore(!response.isLast);
        } finally {
            setIsLoadingPosts(false);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoadingPosts && hasMore && !postOpened) {
                    loadMorePosts();
                }
            },
            { threshold: 0.1 }
        );

        const currentLoader = loaderRef.current;
        if (currentLoader) {
            observer.observe(currentLoader);
        }

        return () => {
            if (currentLoader) {
                observer.unobserve(currentLoader);
            }
        };
    }, [isLoadingPosts, hasMore, postOpened]);

    const getOnePost = async () => {
        try {
            return await postApi.getOne(id);
        } catch (error) {
            notifications.show({
                title: 'Ошибка получения поста',
                color: 'red',
            });

            setPostOpened(false);
            throw error;
        } finally {
            setIsLoadingPosts(false);
        }
    }

    const toggleFormOpenness = () => setFormOpened(prevOpened => !prevOpened)

    const editPost = async (id: number, data: CreatePostDto) => {
        try {
            const response = await postApi.edit(id, data);

            setPosts(prevState => prevState.map((post) => post.id !== id ? post : response))
            setFormOpened(false);

            notifications.show({
                title: 'Пост успешно отредактирован',
                color: 'green'
            });
        } catch (error) {
            notifications.show({
                title: 'Ошибка редактирования',
                color: 'red',
            });
            throw error;
        }
    }

    const createPost = async (data: CreatePostDto) => {
        try {
            const response = await postApi.create(data);

            setPosts(prevState => [response, ...prevState])
            setFormOpened(false)

            notifications.show({
                title: 'Пост успешно создан',
                color: 'green'
            });
        } catch (error) {
            notifications.show({
                title: 'Ошибка создания',
                color: 'red',
            });
            throw error;
        }
    }

    const deletePost = async (id: number) => {
        try {
            await postApi.delete(id);

            setPosts(prevState => prevState.filter(post => post.id !== id));
            if (postOpened) {
                setPostOpened(false)
            }

            notifications.show({
                title: 'Пост успешно удален',
                color: 'green'
            });
        } catch (error) {
            notifications.show({
                title: 'Ошибка удаления',
                color: 'red',
            });
            throw error;
        }
    };

    const handleCloseForm = () => {
        toggleFormOpenness()
        setPostEdit({
            title: '',
            description: '',
            imageBase64: '',
        })
    }

    const formatDate = (dateString: Date) => {
        const date = new Date(dateString);
        const timezoneOffset = new Date().getTimezoneOffset();
        const correctedDate = new Date(date.getTime() - timezoneOffset * 60 * 1000);
        return formatDistanceToNow(correctedDate, { addSuffix: true, locale: ru });
    };

    return (
        <PostsContext.Provider value={{ posts, setPosts, isLoadingPosts, formOpened, postEdit, loaderRef, isAdmin, toggleFormOpenness, editPost, createPost, handleCloseForm, deletePost, setPostEdit, postOpened, getOnePost, formatDate, setPostOpened, setFormOpened }}>
            {children}
        </PostsContext.Provider>
    );
};

export const usePosts = () => {
    const context = useContext(PostsContext);
    if (context === undefined) {
        throw new Error('usePosts must be used within an PostsProvider');
    }
    return context;
};