import React, { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  TextInput,
  Textarea,
  Button,
  Stack,
  Group,
  FileInput,
  Image,
  Text,
  Alert
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPhoto, IconUpload, IconAlertCircle } from '@tabler/icons-react';
import { Layout } from '../components/Layout';
import { postApi } from '../api/post';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export const AdminCreatePost: React.FC = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  if (!user || user.userRole !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      notifications.show({
        title: 'Ошибка',
        message: 'Заполните все обязательные поля',
        color: 'red',
      });
      return;
    }

    setIsCreating(true);
    
    try {
      let imageBase64: string | undefined;
      
      if (imageFile) {
        imageBase64 = await convertToBase64(imageFile);
      }

      await postApi.create({
        title: title.trim(),
        description: description.trim(),
        imageBase64
      });

      notifications.show({
        title: 'Успешно',
        message: 'Пост создан успешно',
        color: 'green',
      });

      setTitle('');
      setDescription('');
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось создать пост',
        color: 'red',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Layout>
      <Container size="md">
        <Paper p="xl" shadow="sm">
          <Stack gap="lg">
            <Title order={2}>Создать новость</Title>
            
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Информация"
              color="blue"
              variant="light"
            >
              Вы создаете новость как администратор. Она будет доступна всем пользователям.
            </Alert>

            <TextInput
              label="Заголовок"
              placeholder="Введите заголовок новости"
              value={title}
              onChange={(event) => setTitle(event.currentTarget.value)}
              required
              maxLength={255}
            />

            <Textarea
              label="Описание"
              placeholder="Введите текст новости..."
              value={description}
              onChange={(event) => setDescription(event.currentTarget.value)}
              required
              minRows={6}
              autosize
            />

            <Stack gap="sm">
              <Text size="sm" fw={500}>
                Изображение (необязательно)
              </Text>
              
              <FileInput
                leftSection={<IconPhoto size={16} />}
                placeholder="Выберите изображение"
                accept="image/*"
                value={imageFile}
                onChange={handleImageChange}
                clearable
              />

              {imagePreview && (
                <Image
                  src={imagePreview}
                  alt="Предварительный просмотр"
                  fit="contain"
                  h={200}
                  radius="md"
                />
              )}
            </Stack>

            <Group justify="flex-end">
              <Button
                leftSection={<IconUpload size={16} />}
                onClick={handleSubmit}
                loading={isCreating}
                disabled={!title.trim() || !description.trim()}
              >
                Создать пост
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Container>
    </Layout>
  );
}; 