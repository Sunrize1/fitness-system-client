import {
  Container,
  Title,
  Button,
  Group,
  Card,
  Text,
  Stack,
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  ActionIcon,
  Badge,
  Alert,
  Center,
  Loader,
  SimpleGrid,
  List,
  Box,
  Divider
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconBarbell,
  IconCalendarPlus,
  IconInfoCircle,
  IconCheck,
  IconAlertTriangle
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { subscriptionSpecificApi } from '../api/user';
import { notifications } from '@mantine/notifications';
import { Layout } from '../components';
import type { SubscriptionSpecificDto, SubscriptionSpecificCreateDto } from '../types';

export const AdminManageSubscriptions = () => {
  const [subscriptionTypes, setSubscriptionTypes] = useState<SubscriptionSpecificDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingItem, setEditingItem] = useState<SubscriptionSpecificDto | null>(null);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SubscriptionSpecificDto | null>(null);

  const [formData, setFormData] = useState<SubscriptionSpecificCreateDto>({
    name: '',
    description: '',
    personalTrainingCount: 0,
    subscriptionDaysCount: 30
  });

  const loadSubscriptionTypes = async () => {
    try {
      setLoading(true);
      const data = await subscriptionSpecificApi.getAll();
      setSubscriptionTypes(data.subscriptions);
    } catch (error) {
      console.error('Ошибка загрузки типов подписок:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось загрузить типы подписок',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!formData.name.trim()) {
      notifications.show({
        title: 'Ошибка',
        message: 'Пожалуйста, заполните название',
        color: 'red',
      });
      return;
    }

    if (formData.personalTrainingCount < 0) {
      notifications.show({
        title: 'Ошибка',
        message: 'Количество персональных тренировок не может быть отрицательным',
        color: 'red',
      });
      return;
    }

    if (formData.subscriptionDaysCount <= 0) {
      notifications.show({
        title: 'Ошибка',
        message: 'Количество дней должно быть больше 0',
        color: 'red',
      });
      return;
    }

    try {
      setProcessing(true);
      
      if (editingItem) {
        // Обновление (если API поддерживает)
        notifications.show({
          title: 'Информация',
          message: 'Функция редактирования пока не поддерживается API',
          color: 'blue',
        });
      } else {
        // Создание
        await subscriptionSpecificApi.create(formData);
        notifications.show({
          title: 'Успешно!',
          message: 'Тип абонемента успешно создан',
          color: 'green',
          icon: <IconCheck size={18} />,
        });
      }
      
      setModalOpened(false);
      resetForm();
      await loadSubscriptionTypes();
    } catch (error) {
      console.error('Ошибка создания/обновления типа абонемента:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось создать/обновить тип абонемента',
        color: 'red',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      setProcessing(true);
      await subscriptionSpecificApi.delete(itemToDelete.id);
      notifications.show({
        title: 'Успешно!',
        message: 'Тип абонемента успешно удален',
        color: 'green',
        icon: <IconCheck size={18} />,
      });
      setDeleteModalOpened(false);
      setItemToDelete(null);
      await loadSubscriptionTypes();
    } catch (error) {
      console.error('Ошибка удаления типа абонемента:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось удалить тип абонемента',
        color: 'red',
      });
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      personalTrainingCount: 0,
      subscriptionDaysCount: 30
    });
    setEditingItem(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpened(true);
  };

  const openEditModal = (item: SubscriptionSpecificDto) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      personalTrainingCount: item.personalTrainingCount,
      subscriptionDaysCount: item.subscriptionDaysCount
    });
    setEditingItem(item);
    setModalOpened(true);
  };

  const openDeleteModal = (item: SubscriptionSpecificDto) => {
    setItemToDelete(item);
    setDeleteModalOpened(true);
  };

  useEffect(() => {
    loadSubscriptionTypes();
  }, []);

  return (
    <Layout>
      <Container size="xl" py={40}>
        <Group justify="space-between" mb="xl">
          <Title order={2}>Управление типами абонементов</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={openCreateModal}
            size="md"
          >
            Создать тип абонемента
          </Button>
        </Group>

        {loading ? (
          <Center py="xl">
            <Loader size="lg" />
          </Center>
        ) : subscriptionTypes.length === 0 ? (
          <Alert icon={<IconInfoCircle size={16} />} color="blue">
            Типы абонементов не найдены. Создайте первый тип абонемента.
          </Alert>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {subscriptionTypes.map((type) => (
              <Card key={type.id} shadow="sm" p="lg" radius="md" withBorder>
                <Group justify="space-between" mb="sm">
                  <Title order={4}>{type.name}</Title>
                  <Group gap="xs">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      size="sm"
                      onClick={() => openEditModal(type)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      size="sm"
                      onClick={() => openDeleteModal(type)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>

                <Badge variant="light" color="blue" size="lg" mb="md">
                  {type.subscriptionDaysCount} дней
                </Badge>

                {type.description && (
                  <Text size="sm" c="dimmed" mb="md">
                    {type.description}
                  </Text>
                )}

                <Divider mb="md" />

                <List size="sm" spacing="xs">
                  <List.Item icon={<IconBarbell size={16} />}>
                    <Text size="sm">
                      <strong>{type.personalTrainingCount}</strong> персональных тренировок
                    </Text>
                  </List.Item>
                  <List.Item icon={<IconCalendarPlus size={16} />}>
                    <Text size="sm">
                      Действует <strong>{type.subscriptionDaysCount}</strong> дней
                    </Text>
                  </List.Item>
                </List>

                <Text size="xs" c="dimmed" mt="md">
                  ID: {type.id}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        )}

        {/* Модальное окно создания/редактирования */}
        <Modal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          title={editingItem ? 'Редактировать тип абонемента' : 'Создать тип абонемента'}
          size="md"
          centered
        >
          <Stack gap="lg">
            <TextInput
              label="Название"
              placeholder="Введите название типа абонемента"
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.currentTarget.value })}
              required
            />

            <Textarea
              label="Описание"
              placeholder="Введите описание (необязательно)"
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.currentTarget.value })}
              minRows={3}
            />

            <NumberInput
              label="Количество персональных тренировок"
              placeholder="Введите количество тренировок"
              value={formData.personalTrainingCount}
              onChange={(value) => setFormData({ ...formData, personalTrainingCount: Number(value) })}
              min={0}
              max={100}
              required
            />

            <NumberInput
              label="Количество дней действия"
              placeholder="Введите количество дней"
              value={formData.subscriptionDaysCount}
              onChange={(value) => setFormData({ ...formData, subscriptionDaysCount: Number(value) })}
              min={1}
              max={365}
              required
            />

            <Group justify="flex-end" gap="sm">
              <Button
                variant="subtle"
                onClick={() => setModalOpened(false)}
                disabled={processing}
              >
                Отмена
              </Button>
              <Button
                onClick={handleCreateOrUpdate}
                loading={processing}
                leftSection={editingItem ? <IconEdit size={18} /> : <IconPlus size={18} />}
              >
                {editingItem ? 'Обновить' : 'Создать'}
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Модальное окно удаления */}
        <Modal
          opened={deleteModalOpened}
          onClose={() => setDeleteModalOpened(false)}
          title="Удаление типа абонемента"
          size="md"
          centered
        >
          <Stack gap="lg">
            <Alert icon={<IconAlertTriangle size={16} />} color="red">
              Вы уверены, что хотите удалить тип абонемента "{itemToDelete?.name}"?
              Это действие нельзя отменить.
            </Alert>

            <Group justify="flex-end" gap="sm">
              <Button
                variant="subtle"
                onClick={() => setDeleteModalOpened(false)}
                disabled={processing}
              >
                Отмена
              </Button>
              <Button
                color="red"
                onClick={handleDelete}
                loading={processing}
                leftSection={<IconTrash size={18} />}
              >
                Удалить
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Container>
    </Layout>
  );
}; 