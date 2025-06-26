import { CreatePostForm, Layout, PostEntity, PostViewModal } from "../components";
import {
    Container,
    Box,
    Loader,
    Center,
    Button,
    Text, Card,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import type { PostDto } from "../types";
import { PostsProvider, usePosts } from "../contexts/PostsContext.tsx";

const PostsContent = () => {
    const { posts, isLoadingPosts, isAdmin, loaderRef, toggleFormOpenness} = usePosts();

    return (
        <Layout>
            <Box sx={{ minHeight: "100vh" }}>
                <PostViewModal />
                <CreatePostForm />

                <Container size={550} >
                    {isAdmin && (
                        <Card p={0} mb={'md'}>
                            <Button
                                onClick={toggleFormOpenness}
                                variant="outline"
                                color="gray"
                                styles={{
                                    root: {
                                        fontWeight: 500,
                                        fontSize: '14px',
                                        padding: '6px 12px',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                        },
                                    },
                                }}
                            >
                                <Box
                                    display="flex"
                                    alignItems="center"
                                >
                                    <IconPlus size={18} />
                                    <Text span ml={6} style={{ lineHeight: 1.05 }}>
                                        Создать пост
                                    </Text>
                                </Box>
                            </Button>
                        </Card>
                    )}

                    <Box>
                        <>
                            {posts.map((post: PostDto, index) => (
                                <PostEntity key={`${post.id}_${post.title}_${index}`} {...post} />
                            ))}
                        </>
                        <div ref={loaderRef} style={{ padding: "20px 0" }}>
                            <Center>{isLoadingPosts && <Loader />}</Center>
                        </div>
                    </Box>
                </Container>
            </Box>
        </Layout>
    );
};

export const Posts = () => {
    return (
        <PostsProvider>
            <PostsContent />
        </PostsProvider>
    );
};
