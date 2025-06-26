import {
  Container,
  Paper,
  Avatar,
  Text,
  Group,
  Title,
  Badge,
  Stack,
  Divider,
  Button,
  SimpleGrid,
  Card,
  Center,
  ThemeIcon,
  ActionIcon,
  Modal,
  TextInput,
  Radio,
  FileButton,
} from '@mantine/core';
import {
  IconUser,
  IconCalendar,
  IconGenderMale,
  IconGenderFemale,
  IconLogout,
  IconUserCircle,
} from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components';
import { useState } from 'react';
import { userApi } from '../api/user';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { DateInput } from '@mantine/dates';

export const Profile = () => {
  const { user, logout, refreshProfile } = useAuth();
  const [modalOpened, setModalOpened] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatarBase64);

  const form = useForm({
    initialValues: {
      firstname: user?.firstname || '',
      lastname: user?.lastname || '',
      gender: user?.gender || 'MALE',
      birthday: user?.birthday || '',
      avatarBase64: user?.avatarBase64 || '',
    },
    validate: {
      firstname: (value) => (!value ? 'Имя обязательно' : null),
      lastname: (value) => (!value ? 'Фамилия обязательна' : null),
      birthday: (value) => (!value ? 'Дата рождения обязательна' : null),
    },
  });

  const handleAvatarClick = () => setModalOpened(true);

  const handleFileChange = async (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        form.setFieldValue('avatarBase64', reader.result as string);
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModalClose = () => {
    setModalOpened(false);
    setAvatarPreview(user?.avatarBase64);
    form.setValues({
      firstname: user?.firstname || '',
      lastname: user?.lastname || '',
      gender: user?.gender || 'MALE',
      birthday: user?.birthday || '',
      avatarBase64: user?.avatarBase64 || '',
    });
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await userApi.updateProfile(values);
      await refreshProfile();
      notifications.show({ title: 'Профиль обновлен', message: 'Данные успешно сохранены', color: 'green' });
      setModalOpened(false);
    } catch (e) {
      notifications.show({ title: 'Ошибка', message: 'Не удалось обновить профиль', color: 'red' });
    }
  };

  if (!user) {
    return (
      <Center style={{ height: '100vh' }}>
        <Text>Пользователь не найден</Text>
      </Center>
    );
  }

  const genderIcon = user.gender === 'MALE' ? <IconGenderMale size={20} /> : <IconGenderFemale size={20} />;
  const genderColor = user.gender === 'MALE' ? 'blue' : 'pink';
  const roleColor = user.userRole === "TRAINER" ? 'yellow' : 'red';
  const genderLabel = user.gender === 'MALE' ? 'Мужской' : 'Женский';

  

  const getUserRoleText = (role: string ) => {
    switch (role) {
      case "ADMIN":
        return "Админ"
      case "TRAINER":
        return "Тренер"
      case "DEFAULT_USER":
        return "Пользователь"
      default:
        return "Пользователь"
    }
  }

  //заюзать библу для форматирования
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не указана';
    const date = new Date(dateString);
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                   'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <Layout>
      <Container size="sm" my={40}>
      <Paper
        radius="md"
        withBorder
        p="lg"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Group gap="xl">
          <Avatar size={120} radius="xl" variant="outline" style={{cursor: 'pointer'}} src={user.avatarBase64} onClick={handleAvatarClick} />
          <div style={{ flex: 1 }}>
            <Title order={2} style={{ color: 'white' }}>
              {user.firstname} {user.lastname}
            </Title>
            <Text size="lg" fw={500} mt="xs" style={{ opacity: 0.9 }}>
              @{user.username}
            </Text>
            <Group mt="md" gap="xs">
              <Badge
                size="lg"
                variant="filled"
                color={genderColor}
                leftSection={genderIcon}
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                {genderLabel}
              </Badge>
              <Badge
                size="lg"
                variant='outline'
                color={roleColor}
                leftSection={<IconUser/>}>
                  {getUserRoleText(user.userRole)}
              </Badge>
            </Group>
          </div>
          <Group gap="sm">
            <ActionIcon
              variant="subtle"
              color="white"
              size="lg"
              radius="md"
              onClick={logout}
              style={{ color: 'white' }}
            >
              <IconLogout size={20} />
            </ActionIcon>
          </Group>
        </Group>
      </Paper>

      <SimpleGrid cols={2} spacing="md" mt="xl">
        <Card shadow="sm" p="lg" radius="md" withBorder>
          <ThemeIcon size="xl" radius="md" variant="light" color="blue" mb="md">
            <IconUser size={28} />
          </ThemeIcon>
          <Text size="xs" c="dimmed" fw={500}>
            ИМЯ ПОЛЬЗОВАТЕЛЯ
          </Text>
          <Text size="lg" fw={500}>
            {user.username}
          </Text>
        </Card>

        <Card shadow="sm" p="lg" radius="md" withBorder>
          <ThemeIcon size="xl" radius="md" variant="light" color="teal" mb="md">
            <IconCalendar size={28} />
          </ThemeIcon>
          <Text size="xs" c="dimmed" fw={500}>
            ДАТА РОЖДЕНИЯ
          </Text>
          <Text size="lg" fw={500}>
            {formatDate(user.birthday)}
          </Text>
        </Card>
      </SimpleGrid>

      <Card shadow="sm" p="lg" radius="md" withBorder mt="md">
        <Title order={4} mb="md">
          Информация о профиле
        </Title>
        <Stack gap="sm">
          <Group>
            <Text fw={500} style={{ minWidth: 120 }}>
              Полное имя:
            </Text>
            <Text>{user.firstname} {user.lastname}</Text>
          </Group>
          <Divider />
          <Group>
            <Text fw={500} style={{ minWidth: 120 }}>
              Username:
            </Text>
            <Text>@{user.username}</Text>
          </Group>
          <Divider />
          <Group>
            <Text fw={500} style={{ minWidth: 120 }}>
              Пол:
            </Text>
            <Group gap={5}>
              {genderIcon}
              <Text>{genderLabel}</Text>
            </Group>
          </Group>
        </Stack>
      </Card>

      <Modal
        opened={modalOpened}
        onClose={handleModalClose}
        title="Редактировать профиль"
        centered
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <Center>
              <Avatar size={80} radius="xl" src={avatarPreview} mb="sm" />
            </Center>
            <FileButton onChange={handleFileChange} accept="image/*">
              {(props) => <Button {...props} variant="light">Загрузить аватар</Button>}
            </FileButton>
            <TextInput label="Имя" {...form.getInputProps('firstname')} required />
            <TextInput label="Фамилия" {...form.getInputProps('lastname')} required />
            <Radio.Group label="Пол" {...form.getInputProps('gender')} required>
              <Group mt="xs">
                <Radio value="MALE" label="Мужской" />
                <Radio value="FEMALE" label="Женский" />
              </Group>
            </Radio.Group>
            <DateInput
              label="Дата рождения"
              onChange={(value) => form.setFieldValue('birthday', value || '')}
              size="xs"
              required
              
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={handleModalClose}>Отмена</Button>
              <Button type="submit">Сохранить</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
    </Layout>
  );
}; 