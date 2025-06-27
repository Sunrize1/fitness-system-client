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
  Box,
  Flex,
  Progress,
} from '@mantine/core';
import {
  IconUser,
  IconCalendar,
  IconGenderMale,
  IconGenderFemale,
  IconLogout,
  IconEdit,
  IconCake,
  IconMail,
  IconShield,
} from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import { Layout, ProfileEditModal } from '../components';
import { useState } from 'react';
import { formatDate} from '../utils/dateUtils';

export const Profile = () => {
  const { user, logout, refreshProfile } = useAuth();
  const [modalOpened, setModalOpened] = useState(false);

  if (!user) {
    return (
      <Layout>
        <Center style={{ height: '60vh' }}>
          <Stack align="center" gap="md">
            <ThemeIcon size={80} radius="xl" variant="light" color="gray">
              <IconUser size={40} />
            </ThemeIcon>
            <Text size="lg" c="dimmed">Пользователь не найден</Text>
          </Stack>
        </Center>
      </Layout>
    );
  }

  const genderIcon = user.gender === 'MALE' ? <IconGenderMale size={20} /> : <IconGenderFemale size={20} />;
  const genderColor = user.gender === 'MALE' ? 'blue' : 'pink';
  const roleColor = user.userRole === "ADMIN" ? 'red' : user.userRole === "TRAINER" ? 'yellow' : 'blue';
  const genderLabel = user.gender === 'MALE' ? 'Мужской' : 'Женский';

  const getUserRoleText = (role: string): string => {
    switch (role) {
      case "ADMIN":
        return "Администратор"
      case "TRAINER":
        return "Тренер"
      case "DEFAULT_USER":
        return "Пользователь"
      default:
        return "Пользователь"
    }
  }

  const profileCompleteness = calculateProfileCompleteness();

  function calculateProfileCompleteness(): number {
    if (!user) return 0;
    
    let score = 0;
    const maxScore = 5;
    
    if (user.firstname && user.firstname.trim()) score++;
    if (user.lastname && user.lastname.trim()) score++;
    if (user.birthday) score++;
    if (user.avatarBase64) score++;
    if (user.gender) score++;
    
    return Math.round((score / maxScore) * 100);
  }

  return (
    <Layout>
      <Container size="lg" py={40}>
        <Stack gap="xl">
          <Paper
            radius="xl"
            withBorder
            p="xl"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              minHeight: 200,
            }}
          >
            <Flex justify="space-between" align="flex-start" wrap="wrap" gap="lg">
              <Group gap="xl" style={{ flex: 1 }}>
                <Avatar 
                  size={140} 
                  radius="xl" 
                  variant="outline" 
                  style={{ border: '3px solid rgba(255,255,255,0.3)' }} 
                  src={user.avatarBase64}
                />
                <Box style={{ flex: 1 }}>
                  <Title order={1} style={{ color: 'white', marginBottom: 8 }}>
                    {user.firstname} {user.lastname}
                  </Title>
                  <Text size="xl" fw={500} style={{ opacity: 0.9, marginBottom: 16 }}>
                    @{user.username}
                  </Text>
                  <Group gap="sm" mb="md">
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
                      variant="outline"
                      color={roleColor}
                      leftSection={<IconShield size={16} />}
                      style={{ borderColor: 'rgba(255, 255, 255, 0.5)', color: 'white' }}
                    >
                      {getUserRoleText(user.userRole)}
                    </Badge>
                  </Group>
                  
                  <Box>
                    <Text size="sm" style={{ opacity: 0.8, marginBottom: 8 }}>
                      Заполненность профиля: {profileCompleteness}%
                    </Text>
                    <Progress 
                      value={profileCompleteness} 
                      size="md" 
                      radius="xl"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                    />
                  </Box>
                </Box>
              </Group>
              
              <Group gap="sm" style={{ alignSelf: 'flex-start' }}>
                <ActionIcon
                  variant="subtle"
                  color="white"
                  size="xl"
                  radius="xl"
                  onClick={() => setModalOpened(true)}
                  style={{ color: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <IconEdit size={24} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="white"
                  size="xl"
                  radius="xl"
                  onClick={logout}
                  style={{ color: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <IconLogout size={24} />
                </ActionIcon>
              </Group>
            </Flex>
          </Paper>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <ThemeIcon size="xl" radius="md" variant="light" color="blue" mb="md">
                <IconUser size={28} />
              </ThemeIcon>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>
                Имя пользователя
              </Text>
              <Text size="lg" fw={600}>
                {user.username}
              </Text>
            </Card>

            <Card shadow="sm" p="lg" radius="md" withBorder>
              <ThemeIcon size="xl" radius="md" variant="light" color="teal" mb="md">
                <IconCalendar size={28} />
              </ThemeIcon>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>
                Дата рождения
              </Text>
              <Text size="lg" fw={600}>
                {formatDate(user.birthday)}
              </Text>
            </Card>

            <Card shadow="sm" p="lg" radius="md" withBorder>
              <ThemeIcon size="xl" radius="md" variant="light" color={genderColor} mb="md">
                {genderIcon}
              </ThemeIcon>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>
                Пол
              </Text>
              <Text size="lg" fw={600}>
                {genderLabel}
              </Text>
            </Card>

            <Card shadow="sm" p="lg" radius="md" withBorder>
              <ThemeIcon size="xl" radius="md" variant="light" color={roleColor} mb="md">
                <IconShield size={28} />
              </ThemeIcon>
              <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={4}>
                Роль
              </Text>
              <Text size="lg" fw={600}>
                {getUserRoleText(user.userRole)}
              </Text>
            </Card>
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <Card shadow="sm" p="xl" radius="lg" withBorder>
              <Title order={3} mb="lg" c="blue">
                <Group>
                  <IconUser size={24} />
                  Персональная информация
                </Group>
              </Title>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={500} c="dimmed">Полное имя:</Text>
                  <Text fw={600}>{user.firstname} {user.lastname}</Text>
                </Group>
                <Divider />
                <Group justify="space-between">
                  <Text fw={500} c="dimmed">Username:</Text>
                  <Text fw={600}>@{user.username}</Text>
                </Group>
                <Divider />
                <Group justify="space-between">
                  <Text fw={500} c="dimmed">Пол:</Text>
                  <Group gap={4}>
                    {genderIcon}
                    <Text fw={600}>{genderLabel}</Text>
                  </Group>
                </Group>
              </Stack>
            </Card>

            <Card shadow="sm" p="xl" radius="lg" withBorder>
              <Title order={3} mb="lg" c="teal">
                <Group>
                  <IconShield size={24} />
                  Системная информация
                </Group>
              </Title>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={500} c="dimmed">Роль в системе:</Text>
                  <Badge size="md" color={roleColor} variant="light">
                    {getUserRoleText(user.userRole)}
                  </Badge>
                </Group>
                <Divider />
                <Group justify="space-between">
                  <Text fw={500} c="dimmed">ID пользователя:</Text>
                  <Text fw={600}>#{user.id}</Text>
                </Group>
                <Divider />
                <Group justify="space-between">
                  <Text fw={500} c="dimmed">Заполненность профиля:</Text>
                  <Group gap="xs">
                    <Progress value={profileCompleteness} size="sm" w={80} />
                    <Text fw={600} size="sm">{profileCompleteness}%</Text>
                  </Group>
                </Group>
              </Stack>
            </Card>
          </SimpleGrid>


        </Stack>

        <ProfileEditModal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          user={user}
          onProfileUpdate={refreshProfile}
        />
      </Container>
    </Layout>
  );
}; 