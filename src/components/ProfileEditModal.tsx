import React, { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  Center,
  Avatar,
  Button,
  TextInput,
  Radio,
  Group,
  FileButton,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { userApi } from '../api/user';
import type { UserDto } from '../types';
import { formatDateForInput } from '../utils/dateUtils';

interface ProfileEditModalProps {
  opened: boolean;
  onClose: () => void;
  user: UserDto;
  onProfileUpdate: () => Promise<void>;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  opened,
  onClose,
  user,
  onProfileUpdate,
}) => {
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatarBase64);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      firstname: user?.firstname || '',
      lastname: user?.lastname || '',
      gender: user?.gender || 'MALE',
      birthday: user?.birthday ? formatDateForInput(user.birthday) : '',
      avatarBase64: user?.avatarBase64 || '',
    },
    validate: {
      firstname: (value) => (!value.trim() ? 'Имя обязательно' : 
        value.trim().length < 2 ? 'Имя должно содержать минимум 2 символа' : null),
      lastname: (value) => (!value.trim() ? 'Фамилия обязательна' : 
        value.trim().length < 2 ? 'Фамилия должна содержать минимум 2 символа' : null),
      birthday: (value) => {
        if (!value) return 'Дата рождения обязательна';
        const date = new Date(value);
        const today = new Date();
        const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
        const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
        
        if (date < minDate || date > maxDate) {
          return 'Возраст должен быть от 13 до 100 лет';
        }
        return null;
      },
    },
  });

  function formatDateForInput(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  useEffect(() => {
    if (user) {
      form.setValues({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        gender: user.gender || 'MALE',
        birthday: user.birthday ? formatDateForInput(user.birthday) : '',
        avatarBase64: user.avatarBase64 || '',
      });
      setAvatarPreview(user.avatarBase64);
    }
  }, [user]);

  const handleFileChange = async (file: File | null) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notifications.show({
          title: 'Ошибка',
          message: 'Размер файла не должен превышать 5MB',
          color: 'red',
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        notifications.show({
          title: 'Ошибка',
          message: 'Пожалуйста, выберите изображение',
          color: 'red',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        form.setFieldValue('avatarBase64', result);
        setAvatarPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    setAvatarPreview(user?.avatarBase64);
    form.reset();
    onClose();
  };

  const handleSubmit = async (values: typeof form.values) => {
    setIsSubmitting(true);
    try {
      const formattedValues = {
        ...values,
        birthday: values.birthday ? new Date(values.birthday).toISOString() : '',
        firstname: values.firstname.trim(),
        lastname: values.lastname.trim(),
      };

      await userApi.updateProfile(formattedValues);
      await onProfileUpdate();
      
      notifications.show({
        title: 'Профиль обновлен',
        message: 'Данные успешно сохранены',
        color: 'green',
      });
      
      onClose();
    } catch (error: any) {
      notifications.show({
        title: 'Ошибка',
        message: error?.response?.data?.message || 'Не удалось обновить профиль',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Редактировать профиль"
      centered
      size="md"
      closeOnClickOutside={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Center>
            <Avatar size={100} radius="xl" src={avatarPreview} />
          </Center>
          
          <FileButton onChange={handleFileChange} accept="image/*" disabled={isSubmitting}>
            {(props) => (
              <Button {...props} variant="light" fullWidth disabled={isSubmitting}>
                Загрузить аватар
              </Button>
            )}
          </FileButton>

          <TextInput
            label="Имя"
            placeholder="Введите ваше имя"
            {...form.getInputProps('firstname')}
            required
            disabled={isSubmitting}
          />

          <TextInput
            label="Фамилия"
            placeholder="Введите вашу фамилию"
            {...form.getInputProps('lastname')}
            required
            disabled={isSubmitting}
          />

          <Radio.Group
            label="Пол"
            {...form.getInputProps('gender')}
            required
          >
            <Group mt="xs">
              <Radio value="MALE" label="Мужской" disabled={isSubmitting} />
              <Radio value="FEMALE" label="Женский" disabled={isSubmitting} />
            </Group>
          </Radio.Group>

          <TextInput
            label="Дата рождения"
            type="date"
            {...form.getInputProps('birthday')}
            required
            disabled={isSubmitting}
          />

          <Group justify="flex-end" mt="md">
            <Button 
              variant="default" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              loading={isSubmitting}
              loaderProps={{ size: 'xs' }}
            >
              Сохранить
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}; 