import {useEffect, useRef, useState} from "react";
import {useAuth} from "../contexts/AuthContext.tsx";
import type { PostDto} from "../types";
import {postApi} from "../api/post.ts";

export const usePostsPage = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<PostDto[]>([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [opened, setOpened] = useState(false);
    const loaderRef = useRef<HTMLDivElement>(null);
    const isAdmin = user?.userRole === "ADMIN";

    const loadMorePosts = async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const response = await postApi.get({ page, size: 5 })

            const resolvedPosts = await Promise.all(response.posts);
            setPosts((prev) => [...prev, ...resolvedPosts]);
            setPage((prev) => prev + 1);
            setHasMore(!response.isLast);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && hasMore) {
                    loadMorePosts();
                }
            },
            { threshold: 0.1 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [loading, hasMore]);

    const toggleFormOpenness = () => setOpened(prevOpened => !prevOpened)

    const handleCreatePost = (post: PostDto) => {
        setPosts(prevPosts => [post, ...prevPosts])
    }

    const handleEditPost = (post: PostDto) => {
        setPosts(prevPosts => [post, ...prevPosts])
    }

    const handleDeletePost = (id: number) => {
        setPosts
    }


    return { posts, loaderRef, isAdmin, opened, toggleFormOpenness, loading, handleCreatePost }
}