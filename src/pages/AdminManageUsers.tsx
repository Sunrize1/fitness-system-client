import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Table,
  Select,
  Button,
  Stack,
  Group,
  Text,
  Badge,
  Avatar,
  ActionIcon,
  Modal,
  Alert,
  Loader,
  Center
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconAlertCircle, IconUser, IconShield, IconStar } from '@tabler/icons-react';
import { Layout } from '../components/Layout';
import { userApi } from '../api/user';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import type { UserDto } from '../types';

const roleColors = {
  'ADMIN': 'red',
  'TRAINER': 'blue',
  'DEFAULT_USER': 'gray'
} as const;

const roleLabels = {
  'ADMIN': 'Администратор',
  'TRAINER': 'Тренер',
  'DEFAULT_USER': 'Пользователь'
} as const;

const roleIcons = {
  'ADMIN': <IconShield size={14} />,
  'TRAINER': <IconStar size={14} />,
  'DEFAULT_USER': <IconUser size={14} />
} as const;

export const AdminManageUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [newRole, setNewRole] = useState<'ADMIN' | 'TRAINER' | 'DEFAULT_USER' | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (!currentUser || currentUser.userRole !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userApi.getAllUsers();
      setUsers(response.users);
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось загрузить список пользователей',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (user: UserDto) => {
    setSelectedUser(user);
    setNewRole(user.userRole);
    setModalOpened(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser || !newRole) return;

    setUpdating(true);
    try {
      await userApi.changeUserRole({
        userId: selectedUser.id,
        newRole: newRole
      });

      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, userRole: newRole }
          : u
      ));

      notifications.show({
        title: 'Успешно',
        message: `Роль пользователя ${selectedUser.username} изменена на ${roleLabels[newRole]}`,
        color: 'green',
      });

      setModalOpened(false);
      setSelectedUser(null);
      setNewRole(null);
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось изменить роль пользователя',
        color: 'red',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpened(false);
    setSelectedUser(null);
    setNewRole(null);
  };

  if (loading) {
    return (
      <Layout>
        <Container size="lg">
          <Center h={400}>
            <Loader size="lg" />
          </Center>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container size="lg">
        <Paper p="xl" shadow="sm">
          <Stack gap="lg">
            <Title order={2}>Управление пользователями</Title>
            
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Внимание"
              color="orange"
              variant="light"
            >
              Будьте осторожны при изменении ролей пользователей. Это может повлиять на их доступ к функциям системы.
            </Alert>

            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Пользователь</Table.Th>
                  <Table.Th>Имя</Table.Th>
                  <Table.Th>Роль</Table.Th>
                  <Table.Th>Действия</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {users.map((user) => (
                  <Table.Tr key={user.id}>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar
                          src={user.avatarBase64 ? `data:image/jpeg;base64,${user.avatarBase64}` : null}
                          size={40}
                          radius="xl"
                        />
                        <div>
                          <Text size="sm" fw={500}>
                            {user.username}
                          </Text>
                          <Text size="xs" c="dimmed">
                            ID: {user.id}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {user.firstname} {user.lastname}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={roleColors[user.userRole]}
                        variant="light"
                        leftSection={roleIcons[user.userRole]}
                      >
                        {roleLabels[user.userRole]}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon
                        variant="light"
                        size="sm"
                        onClick={() => handleEditRole(user)}
                        disabled={user.id === currentUser.id}
                      >
                        <IconEdit size={14} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {users.length === 0 && (
              <Center h={200}>
                <Text c="dimmed">Пользователи не найдены</Text>
              </Center>
            )}
          </Stack>
        </Paper>
      </Container>

      <Modal
        opened={modalOpened}
        onClose={handleCloseModal}
        title="Изменить роль пользователя"
        centered
      >
        {selectedUser && (
          <Stack gap="md">
            <Group>
              <Avatar
                src={selectedUser.avatarBase64 ? `data:image/jpeg;base64,${selectedUser.avatarBase64}` : null}
                size={60}
                radius="xl"
              />
              <div>
                <Text fw={500}>{selectedUser.username}</Text>
                <Text size="sm" c="dimmed">
                  {selectedUser.firstname} {selectedUser.lastname}
                </Text>
              </div>
            </Group>

            <Select
              label="Новая роль"
              value={newRole}
              onChange={(value) => setNewRole(value as 'ADMIN' | 'TRAINER' | 'DEFAULT_USER')}
              data={[
                { value: 'DEFAULT_USER', label: 'Пользователь' },
                { value: 'TRAINER', label: 'Тренер' },
                { value: 'ADMIN', label: 'Администратор' }
              ]}
            />

            <Group justify="flex-end">
              <Button variant="light" onClick={handleCloseModal}>
                Отмена
              </Button>
              <Button
                onClick={handleSaveRole}
                loading={updating}
                disabled={!newRole || newRole === selectedUser.userRole}
              >
                Сохранить
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Layout>
  );
}; 