import React, { useEffect, useState } from "react";
import { Modal, Image, Text, Card, Group, Button } from "@mantine/core";
import { usePosts } from "../contexts/PostsContext";
import type { PostDto } from "../types";

export const PostViewModal = () => {
    const { postOpened, getOnePost, isAdmin, deletePost, setPostEdit, toggleFormOpenness, formatDate, setPostOpened, formOpened } = usePosts();
    const [post, setPost] = useState<PostDto>();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const post = await getOnePost();

                setPost(post)
            } catch (error) {
                throw error
            }
        }

        if (postOpened) {
            fetchPost()
        }
    }, []);

    const handleEdit = () => {
        setPostEdit(post);
        toggleFormOpenness();
    };

    const handleClose = () => {
        setPostOpened(false)
        if (formOpened) {
            toggleFormOpenness();
        }
    }

    if (!post) {
        return null;
    }

    return (
        <Modal
            opened={postOpened}
            onClose={handleClose}
            size="lg"
            centered
            radius="md"
            styles={{
                content: {
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    border: 'none',
                },
                body: {
                    padding: 0,
                },
                header: {
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    border: 'none',
                }
            }}
        >
            <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
                <Card.Section>{post?.imageBase64 && <Image src={post.imageBase64} alt={post.title} />}</Card.Section>

                <Group position="apart" mt={post.imageBase64 ? "xs" : "md"} mb="xs">
                    <Text weight={500} style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                        {post.title}
                    </Text>
                </Group>

                <Text size="sm" color="dimmed" mb="xs">
                    {post.description}
                </Text>


                <Group spacing="xs" justify="space-between" align="end">
                    {isAdmin ? (
                        <Group spacing="xs">
                            <Button size="xs" variant="outline" onClick={handleEdit}>
                                Редактировать
                            </Button>
                            <Button size="xs" color="red" variant="outline" onClick={() => deletePost(post.id)}>
                                Удалить
                            </Button>
                        </Group>
                    ) : (
                        <div />
                    )}
                    <Text size="xs" color="dimmed">
                        {formatDate(post.updatedAt || post.createdAt)}
                        {post.updatedAt && <span style={{ marginLeft: 4 }}>(изменено)</span>}
                    </Text>
                </Group>
            </Card>
        </Modal>
    );
};