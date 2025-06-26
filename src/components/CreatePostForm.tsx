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
} from "@mantine/core";
import { IconReplace, IconUpload, IconX } from "@tabler/icons-react";
import type { CreatePostDto } from "../types";
import { useForm } from "@mantine/form";
import { usePosts } from "../contexts/PostsContext.tsx";
import { useEffect } from "react";

export const CreatePostForm = () => {
    const { postEdit, formOpened, editPost, createPost, handleCloseForm, deletePost, toggleFormOpenness} = usePosts()
    const isEditing = !!postEdit;

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
            await deletePost(postEdit?.id)
            form.reset()
            toggleFormOpenness();
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
                                    src={form.values.imageBase64}
                                    alt="Preview"
                                    radius="sm"
                                    fit="cover"
                                />
                                <Group spacing="xs" style={{ position: "absolute", top: 10, right: 10 }}>
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
                        <FileButton onChange={handleFileChange} accept="image/*,video/*">
                            {(props) => (
                                <Button
                                    {...props}
                                    size="lg"
                                    leftIcon={<IconUpload size={20} />}
                                    variant="light"
                                    fullWidth
                                    style={{ height: 80 }}
                                >
                                    Загрузить с устройства
                                </Button>
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
                        onClick={() => handleDelete(postEdit.id)}
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