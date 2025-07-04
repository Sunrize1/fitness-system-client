import {
  Card,
  Title,
  Text,
  Group,
  Badge,
  Stack,
  Button,
  NumberInput,
  Modal,
  SimpleGrid,
  ThemeIcon,
  Divider,
  Progress,
  Box,
  Alert,
  Center,
  Loader
} from '@mantine/core';
import {
  IconCalendarPlus,
  IconBarbell,
  IconInfoCircle,
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconStar,
  IconShoppingCart
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { subscriptionApi, subscriptionSpecificApi } from '../api/user';
import { notifications } from '@mantine/notifications';
import type { SubscriptionDto } from '../types';
import { isAfter } from "date-fns";

interface SubscriptionManagerProps {
  onSubscriptionUpdate?: () => void;
}

export const SubscriptionManager = ({ onSubscriptionUpdate }: SubscriptionManagerProps) => {
  const [subscription, setSubscription] = useState<SubscriptionDto | null>(null);
  const [subscriptionTypes, setSubscriptionTypes] = useState<SubscriptionSpecificDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [typesLoading, setTypesLoading] = useState(true);
  const [extendModalOpened, setExtendModalOpened] = useState(false);
  const [buyModalOpened, setBuyModalOpened] = useState(false);
  const [typesModalOpened, setTypesModalOpened] = useState(false);
  const [daysToExtend, setDaysToExtend] = useState<number>(30);
  const [trainingsToBuy, setTrainingsToBuy] = useState<number>(5);
  const [processing, setProcessing] = useState(false);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const data = await subscriptionApi.getMySubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Ошибка загрузки подписки:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось загрузить информацию о подписке',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptionTypes = async () => {
    try {
      setTypesLoading(true);
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
      setTypesLoading(false);
    }
  };

  const handleExtendSubscription = async () => {
    if (!daysToExtend || daysToExtend <= 0) {
      notifications.show({
        title: 'Ошибка',
        message: 'Пожалуйста, укажите корректное количество дней',
        color: 'red',
      });
      return;
    }

    try {
      setProcessing(true);
      await subscriptionApi.extendSubscription({ days: daysToExtend });
      notifications.show({
        title: 'Успешно!',
        message: `Подписка продлена на ${daysToExtend} дней`,
        color: 'green',
        icon: <IconCheck size={18} />,
      });
      setExtendModalOpened(false);
      await loadSubscription();
      onSubscriptionUpdate?.();
    } catch (error) {
      console.error('Ошибка продления подписки:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось продлить подписку',
        color: 'red',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleBuyTrainings = async () => {
    if (!trainingsToBuy || trainingsToBuy <= 0) {
      notifications.show({
        title: 'Ошибка',
        message: 'Пожалуйста, укажите корректное количество тренировок',
        color: 'red',
      });
      return;
    }

    try {
      setProcessing(true);
      await subscriptionApi.buyPersonalTrainings({ count: trainingsToBuy });
      notifications.show({
        title: 'Успешно!',
        message: `Куплено ${trainingsToBuy} персональных тренировок`,
        color: 'green',
        icon: <IconCheck size={18} />,
      });
      setBuyModalOpened(false);
      await loadSubscription();
      onSubscriptionUpdate?.();
    } catch (error) {
      console.error('Ошибка покупки тренировок:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось купить тренировки',
        color: 'red',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleAssignSubscriptionType = async (subscriptionTypeId: number) => {
    try {
      setProcessing(true);
      await subscriptionApi.assignSpecificSubscription(subscriptionTypeId);
      notifications.show({
        title: 'Успешно!',
        message: 'Тип абонемента успешно куплен',
        color: 'green',
        icon: <IconCheck size={18} />,
      });
      setTypesModalOpened(false);
      await loadSubscription();
      onSubscriptionUpdate?.();
    } catch (error) {
      console.error('Ошибка назначения типа абонемента:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось купить тип абонемента',
        color: 'red',
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = () => {
    if (!subscription?.endDate) return 0;
    const endDate = new Date(subscription.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getSubscriptionStatus = () => {
    const daysRemaining = getDaysRemaining();
    if (!subscription?.isActive) return { color: 'red', text: 'Неактивна', icon: IconAlertTriangle };
    if (daysRemaining <= 7) return { color: 'orange', text: 'Заканчивается', icon: IconClock };
    return { color: 'green', text: 'Активна', icon: IconCheck };
  };

  useEffect(() => {
    loadSubscription();
    loadSubscriptionTypes();
  }, []);

  if (loading) {
    return (
      <Card shadow="sm" p="xl" radius="lg" withBorder>
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card shadow="sm" p="xl" radius="lg" withBorder>
        <Title order={3} mb="lg" c="grape">
          <Group>
            <IconBarbell size={24} />
            Управление подпиской
          </Group>
        </Title>
        <Alert icon={<IconInfoCircle size={16} />} color="blue" mb="lg">
          У вас нет активной подписки
        </Alert>
        <Button
          size="lg"
          leftSection={<IconStar size={18} />}
          onClick={() => setTypesModalOpened(true)}
          fullWidth
        >
          Выбрать тип абонемента
        </Button>
      </Card>
    );
  }

  const status = getSubscriptionStatus();
  const daysRemaining = getDaysRemaining();

  return (
    <>
      <Card shadow="sm" p="xl" radius="lg" withBorder>
        <Title order={3} mb="lg" c="grape">
          <Group>
            <IconBarbell size={24} />
            Управление подпиской
          </Group>
        </Title>

        <Tabs defaultValue="current" mb="xl">
          <Tabs.List>
            <Tabs.Tab value="current">Текущая подписка</Tabs.Tab>
            <Tabs.Tab value="types">Типы абонементов</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="current">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mb="xl">
              <Box>
                <Text size="sm" c="dimmed" fw={600} tt="uppercase" mb={4}>
                  Статус подписки
                </Text>
                <Badge
                  size="lg"
                  variant="light"
                  color={status.color}
                  leftSection={<status.icon size={16} />}
                >
                  {status.text}
                </Badge>
              </Box>

              <Box>
                <Text size="sm" c="dimmed" fw={600} tt="uppercase" mb={4}>
                  Персональные тренировки
                </Text>
                <Text size="lg" fw={600}>
                  {subscription.personalTrainingCount} доступно
                </Text>
              </Box>
            </SimpleGrid>

              {isAfter(new Date(subscription.startDate), new Date(2000, 0, 1)) &&
                  <Stack gap="md" mb="xl">
              <Group justify="space-between">
                <Text fw={500} c="dimmed">Дата начала:</Text>
                <Text fw={600}>{formatDate(subscription.startDate)}</Text>
              </Group>
              <Divider />
              <Group justify="space-between">
                <Text fw={500} c="dimmed">Дата окончания:</Text>
                <Text fw={600}>{formatDate(subscription.endDate)}</Text>
              </Group>
              <Divider />
              <Group justify="space-between">
                <Text fw={500} c="dimmed">Дней осталось:</Text>
                <Group gap="xs">
                  <Text fw={600} c={daysRemaining <= 7 ? 'orange' : 'blue'}>
                    {daysRemaining}
                  </Text>
                  {daysRemaining <= 30 && (
                    <Progress
                      value={(daysRemaining / 30) * 100}
                      size="sm"
                      w={60}
                      color={daysRemaining <= 7 ? 'orange' : 'blue'}
                    />
                  )}
                </Group>
              </Group>
            </Stack>
              }

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Button
                variant="light"
                color="blue"
                size="md"
                leftSection={<IconCalendarPlus size={18} />}
                onClick={() => setExtendModalOpened(true)}
                fullWidth
              >
                Продлить подписку
              </Button>
              <Button
                variant="light"
                color="grape"
                size="md"
                leftSection={<IconBarbell size={18} />}
                onClick={() => setBuyModalOpened(true)}
                fullWidth
              >
                Купить тренировки
              </Button>
            </SimpleGrid>
          </Tabs.Panel>

          <Tabs.Panel value="types">
            <Text size="sm" c="dimmed" mb="lg">
              Доступные типы абонементов для покупки
            </Text>

            {typesLoading ? (
              <Center>
                <Loader size="md" />
              </Center>
            ) : (
              <ScrollArea.Autosize mah={400}>
                <Stack gap="md">
                  {subscriptionTypes.map((type) => (
                    <Card key={type.id} shadow="sm" p="md" radius="md" withBorder>
                      <Group justify="space-between" mb="sm">
                        <Title order={4}>{type.name}</Title>
                        <Badge variant="light" color="blue">
                          {type.subscriptionDaysCount} дней
                        </Badge>
                      </Group>

                      {type.description && (
                        <Text size="sm" c="dimmed" mb="sm">
                          {type.description}
                        </Text>
                      )}

                      <List size="sm" mb="md">
                        <List.Item>
                          <Text size="sm">
                            <strong>{type.personalTrainingCount}</strong> персональных тренировок
                          </Text>
                        </List.Item>
                        <List.Item>
                          <Text size="sm">
                            Действует <strong>{type.subscriptionDaysCount}</strong> дней
                          </Text>
                        </List.Item>
                      </List>

                      <Button
                        size="sm"
                        variant="light"
                        leftSection={<IconShoppingCart size={16} />}
                        onClick={() => handleAssignSubscriptionType(type.id)}
                        loading={processing}
                        fullWidth
                      >
                        Купит абонемент
                      </Button>
                    </Card>
                  ))}
                </Stack>
              </ScrollArea.Autosize>
            )}
          </Tabs.Panel>
        </Tabs>
      </Card>

      <Modal
        opened={extendModalOpened}
        onClose={() => setExtendModalOpened(false)}
        title="Продление подписки"
        size="md"
        centered
      >
        <Stack gap="lg">
          <Text size="sm" c="dimmed">
            Выберите на сколько дней вы хотите продлить подписку
          </Text>
          
          <NumberInput
            label="Количество дней"
            placeholder="Введите количество дней"
            value={daysToExtend}
            onChange={(value) => setDaysToExtend(Number(value))}
            min={1}
            max={365}
            size="md"
          />

          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              onClick={() => setExtendModalOpened(false)}
              disabled={processing}
            >
              Отмена
            </Button>
            <Button
              onClick={handleExtendSubscription}
              loading={processing}
              leftSection={<IconCalendarPlus size={18} />}
            >
              Продлить на {daysToExtend} дней
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={buyModalOpened}
        onClose={() => setBuyModalOpened(false)}
        title="Покупка персональных тренировок"
        size="md"
        centered
      >
        <Stack gap="lg">
          <Text size="sm" c="dimmed">
            Выберите количество персональных тренировок для покупки
          </Text>
          
          <NumberInput
            label="Количество тренировок"
            placeholder="Введите количество тренировок"
            value={trainingsToBuy}
            onChange={(value) => setTrainingsToBuy(Number(value))}
            min={1}
            max={50}
            size="md"
          />

          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              onClick={() => setBuyModalOpened(false)}
              disabled={processing}
            >
              Отмена
            </Button>
            <Button
              onClick={handleBuyTrainings}
              loading={processing}
              leftSection={<IconBarbell size={18} />}
            >
              Купить {trainingsToBuy} тренировок
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={typesModalOpened}
        onClose={() => setTypesModalOpened(false)}
        title="Выбор типа абонемента"
        size="lg"
        centered
      >
        <Stack gap="lg">
          <Text size="sm" c="dimmed">
            Выберите подходящий тип абонемента
          </Text>

          {typesLoading ? (
            <Center>
              <Loader size="md" />
            </Center>
          ) : (
            <ScrollArea.Autosize mah={500}>
              <Stack gap="md">
                {subscriptionTypes.map((type) => (
                  <Card key={type.id} shadow="sm" p="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="sm">
                      <Title order={4}>{type.name}</Title>
                      <Badge variant="gradient" gradient={{ from: 'blue', to: 'grape' }} size="lg">
                        {type.subscriptionDaysCount} дней
                      </Badge>
                    </Group>

                    {type.description && (
                      <Text size="sm" c="dimmed" mb="md">
                        {type.description}
                      </Text>
                    )}

                    <List size="sm" mb="lg" spacing="xs">
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

                    <Button
                      size="md"
                      variant="light"
                      leftSection={<IconShoppingCart size={18} />}
                      onClick={() => handleAssignSubscriptionType(type.id)}
                      loading={processing}
                      fullWidth
                    >
                      Выбрать этот абонемент
                    </Button>
                  </Card>
                ))}
              </Stack>
            </ScrollArea.Autosize>
          )}
        </Stack>
      </Modal>
    </>
  );
}; 