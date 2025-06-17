import { useEffect, useState } from 'react';
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
  Loader,
  Center,
  ThemeIcon,
  ActionIcon,
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

export const Profile = () => {
  const { user, logout, isLoading } = useAuth();

  if (!user) {
    return (
      <Center style={{ height: '100vh' }}>
        <Text>Пользователь не найден</Text>
      </Center>
    );
  }

  const genderIcon = user.gender === 'MALE' ? <IconGenderMale size={20} /> : <IconGenderFemale size={20} />;
  const genderColor = user.gender === 'MALE' ? 'blue' : 'pink';
  const genderLabel = user.gender === 'MALE' ? 'Мужской' : 'Женский';

  //заюзать библу для форматирования
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не указана';
    const date = new Date(dateString);
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                   'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
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
          <Avatar size={120} radius="xl" color="white" variant="filled">
            <IconUserCircle size={80} />
          </Avatar>
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
            </Group>
          </div>
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

      <Button
        fullWidth
        mt="xl"
        size="lg"
        variant="gradient"
        gradient={{ from: 'red', to: 'orange' }}
        leftSection={<IconLogout size={20} />}
        onClick={logout}
      >
        Выйти из аккаунта
      </Button>
    </Container>
  );
}; 