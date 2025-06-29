import {
    ActionIcon,
    Box,
    Button,
    Divider,
    FileButton,
    Group,
    Image,
    Modal,
    Text,
    Textarea,
    Stack,
    Title
} from "@mantine/core";
import { IconReplace, IconUpload, IconX, IconPhoto } from "@tabler/icons-react";
import { createImageDataUrl, createFallbackImage } from "../utils/imageUtils";
import type { CreatePostDto } from "../types";
import { useForm } from "@mantine/form";
import { usePosts } from "../contexts/PostsContext.tsx";
import { useEffect } from "react";

export const CreatePostForm = () => {
    const { postEdit, formOpened, editPost, createPost, handleCloseForm, deletePost, toggleFormOpenness} = usePosts()
    const isEditing = postEdit?.title || postEdit?.description || postEdit?.imageBase64;

    const form = useForm({
        initialValues: {
            title: postEdit?.title || '',
            description: postEdit?.description || '',
            imageBase64: postEdit?.imageBase64 || '',
        },
        validate: {
            title: (value) => (!value ? 'Заголовок обязателен' : null),
            description: (value) => (!value ? 'Описание обязательно' : null),
        },
    });

    useEffect(() => {
        if (postEdit) {
            form.setValues({
                title: postEdit.title,
                description: postEdit.description,
                imageBase64: postEdit.imageBase64,
            });
        }
    }, [postEdit]);

    const handleFileChange = async (file: File | null) => {
        if (file) {
            const imageBase64 = await fileToBase64(file);
            form.setValues({ imageBase64 });
        } else {
            form.setValues({ imageBase64: '' });
        }
    };

    const clearImage = () => {
        form.setValues({ imageBase64: '' });
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async () => {
        const post: CreatePostDto = {
            title: form.values.title,
            description: form.values.description,
            imageBase64: form.values.imageBase64,
        };

        try {
            if (isEditing) {
                await editPost(postEdit?.id, post)
            } else {
                await createPost(post)
            }

            form.reset()
        } catch (_) {}
    };

    const handleDelete = async () => {
        try {
            if (postEdit?.id) {
                await deletePost(postEdit.id)
                form.reset()
                toggleFormOpenness();
            }
        } catch (_) {}
    }

    return (
        <Modal
            opened={formOpened}
            onClose={handleCloseForm}
            title={isEditing ? "Редактирование" : "Создание"}
            size="lg"
            centered
            radius="md"
            styles={{
                title: {
                    flex: 1,
                    textAlign: 'center',
                    fontSize: '24px',
                },
                header: {
                    display: 'flex',
                    alignItems: 'center',
                }
            }}
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Box>
                    <Text size="sm" fw={500} mb="xs">Изображение</Text>
                    {form.values.imageBase64 ? (
                        <Box mb="md">
                            <Box style={{ position: "relative", marginBottom: 10 }}>
                                <Image
                                    src={isEditing ? createImageDataUrl(form.values.imageBase64) : form.values.imageBase64}
                                    alt="Preview"
                                    radius="md"
                                    fit="cover"
                                    height={250}
                                    fallbackSrc={createFallbackImage(400, 250)}
                                />
                                <Group gap="xs" style={{ position: "absolute", top: 10, right: 10 }}>
                                    <FileButton onChange={handleFileChange} accept="image/*">
                                        {(props) => (
                                            <ActionIcon {...props} color="blue" variant="filled" size="lg">
                                                <IconReplace size={18} />
                                            </ActionIcon>
                                        )}
                                    </FileButton>
                                    <ActionIcon color="red" variant="filled" size="lg" onClick={clearImage}>
                                        <IconX size={18} />
                                    </ActionIcon>
                                </Group>
                            </Box>
                        </Box>
                    ) : (
                        <FileButton onChange={handleFileChange} accept="image/*">
                            {(props) => (
                                <Box
                                    {...props}
                                    style={{
                                        height: 200,
                                        border: '2px dashed var(--mantine-color-gray-4)',
                                        borderRadius: 'var(--mantine-radius-md)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        backgroundColor: 'var(--mantine-color-gray-0)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--mantine-color-blue-0)';
                                        e.currentTarget.style.borderColor = 'var(--mantine-color-blue-5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)';
                                        e.currentTarget.style.borderColor = 'var(--mantine-color-gray-4)';
                                    }}
                                >
                                    <IconPhoto size={48} style={{ color: 'var(--mantine-color-gray-5)', marginBottom: 8 }} />
                                    <Text size="lg" fw={500} c="dimmed">
                                        Загрузить изображение
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        Нажмите или перетащите файл сюда
                                    </Text>
                                </Box>
                            )}
                        </FileButton>
                    )}
                </Box>

                <Divider my="sm" />

                <Textarea
                    placeholder="Заголовок"
                    minRows={1}
                    maxRows={10}
                    autosize
                    {...form.getInputProps('title')}
                    mb="md"
                />
                <Textarea
                    placeholder="Напишите что-нибудь..."
                    minRows={3}
                    maxRows={10}
                    autosize
                    {...form.getInputProps('description')}
                    mb="md"
                />

                <Group justify="flex-end">
                    {isEditing &&
                      <Button
                        size="md"
                        color="red"
                        variant="outline"
                        onClick={handleDelete}
                      >
                          Удалить
                      </Button>
                    }
                    <Button size="md" type="submit">{isEditing ? 'Сохранить' : 'Создать'}</Button>
                </Group>
            </form>
        </Modal>
    );
};