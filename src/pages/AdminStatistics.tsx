import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Stack,
  Group,
  Text,
  Loader,
  Center,
  Tabs,
  Card,
  SimpleGrid,
  Box,
  Progress,
  RingProgress,
  Select,
  Badge,
  Alert,
  Flex,
  ThemeIcon
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { 
  IconUsers, 
  IconBarbell, 
  IconCalendar, 
  IconTrendingUp, 
  IconCreditCard,
  IconBuilding,
  IconListCheck,
  IconChartBar,
  IconInfoCircle,
  IconUserPlus,
  IconCalendarStats,
  IconClipboardCheck
} from '@tabler/icons-react';
import { Layout } from '../components/Layout';
import { statisticsApi } from '../api/statistics';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import type { 
  UserStatisticsDto,
  NewRegistrationsPeriodDto,
  TrainingSessionStatisticsDto,
  SubscriptionStatisticsDto,
  GymRoomStatisticsDto,
  EnrollmentStatisticsDto
} from '../types';

export const AdminStatistics: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>('overview');
  
  // Statistics data
  const [userStats, setUserStats] = useState<UserStatisticsDto | null>(null);
  const [newRegistrations, setNewRegistrations] = useState<NewRegistrationsPeriodDto | null>(null);
  const [trainingStats, setTrainingStats] = useState<TrainingSessionStatisticsDto | null>(null);
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStatisticsDto | null>(null);
  const [gymStats, setGymStats] = useState<GymRoomStatisticsDto | null>(null);
  const [enrollmentStats, setEnrollmentStats] = useState<EnrollmentStatisticsDto | null>(null);
  
  // Filters
  const [registrationPeriod, setRegistrationPeriod] = useState('LAST_WEEK');
  const [enrollmentPeriod, setEnrollmentPeriod] = useState('LAST_WEEK');

  if (!currentUser || currentUser.userRole !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchAllStatistics();
  }, []);

  useEffect(() => {
    fetchNewRegistrations();
  }, [registrationPeriod]);

  useEffect(() => {
    fetchEnrollmentStatistics();
  }, [enrollmentPeriod]);

  const fetchAllStatistics = async () => {
    setLoading(true);
    try {
      const [
        userStatsData,
        trainingStatsData,
        subscriptionStatsData,
        gymStatsData
      ] = await Promise.all([
        statisticsApi.getUserOverviewStatistics(),
        statisticsApi.getTrainingSessionStatistics(),
        statisticsApi.getSubscriptionStatistics(),
        statisticsApi.getGymRoomStatistics()
      ]);

      setUserStats(userStatsData);
      setTrainingStats(trainingStatsData);
      setSubscriptionStats(subscriptionStatsData);
      setGymStats(gymStatsData);
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось загрузить статистику',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNewRegistrations = async () => {
    try {
      const data = await statisticsApi.getNewRegistrations({ period: registrationPeriod as any });
      setNewRegistrations(data);
    } catch (error) {
      console.error('Ошибка загрузки статистики регистраций:', error);
    }
  };

  const fetchEnrollmentStatistics = async () => {
    try {
      const data = await statisticsApi.getEnrollmentStatistics({ period: enrollmentPeriod as any });
      setEnrollmentStats(data);
    } catch (error) {
      console.error('Ошибка загрузки статистики записей:', error);
    }
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  const getPercentage = (value: number, total: number): number => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  if (loading) {
    return (
      <Layout>
        <Container size="xl">
          <Center h={400}>
            <Loader size="lg" />
          </Center>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container size="xl">
        <Paper p="xl" shadow="sm">
          <Stack gap="lg">
            <Group justify="space-between">
              <Title order={2}>Статистика и аналитика</Title>
              <Badge size="lg" variant="light" color="blue">
                Панель администратора
              </Badge>
            </Group>
            
            <Alert
              icon={<IconInfoCircle size={16} />}
              title="Актуальные данные"
              color="blue"
              variant="light"
            >
              Статистика обновляется в реальном времени и отражает текущее состояние системы.
            </Alert>

            <Tabs value={activeTab} onChange={setActiveTab}>
              <Tabs.List>
                <Tabs.Tab value="overview" leftSection={<IconChartBar size={16} />}>
                  Обзор
                </Tabs.Tab>
                <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>
                  Пользователи
                </Tabs.Tab>
                <Tabs.Tab value="trainings" leftSection={<IconBarbell size={16} />}>
                  Тренировки
                </Tabs.Tab>
                <Tabs.Tab value="subscriptions" leftSection={<IconCreditCard size={16} />}>
                  Подписки
                </Tabs.Tab>
                <Tabs.Tab value="gyms" leftSection={<IconBuilding size={16} />}>
                  Залы
                </Tabs.Tab>
                <Tabs.Tab value="enrollments" leftSection={<IconListCheck size={16} />}>
                  Записи
                </Tabs.Tab>
              </Tabs.List>

              {/* Overview Tab */}
              <Tabs.Panel value="overview" pt="lg">
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
                  {/* Users Card */}
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between">
                      <Stack gap="xs">
                        <Text size="sm" c="dimmed">Всего пользователей</Text>
                        <Text size="xl" fw={700}>{formatNumber(userStats?.totalRegisteredUsers || 0)}</Text>
                        <Text size="xs" c="green">
                          Активных: {formatNumber(userStats?.totalActiveUsers || 0)}
                        </Text>
                      </Stack>
                      <ThemeIcon size={60} radius="md" color="blue" variant="light">
                        <IconUsers size={30} />
                      </ThemeIcon>
                    </Group>
                  </Card>

                  {/* Trainings Card */}
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between">
                      <Stack gap="xs">
                        <Text size="sm" c="dimmed">Тренировок запланировано</Text>
                        <Text size="xl" fw={700}>{formatNumber(trainingStats?.totalScheduledTrainingSessions || 0)}</Text>
                        <Text size="xs" c="blue">
                          Активных: {formatNumber(trainingStats?.activeTrainingSessions || 0)}
                        </Text>
                      </Stack>
                      <ThemeIcon size={60} radius="md" color="green" variant="light">
                        <IconBarbell size={30} />
                      </ThemeIcon>
                    </Group>
                  </Card>

                  {/* Subscriptions Card */}
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between">
                      <Stack gap="xs">
                        <Text size="sm" c="dimmed">Активных подписок</Text>
                        <Text size="xl" fw={700}>{formatNumber(subscriptionStats?.totalActiveSubscriptions || 0)}</Text>
                        <Text size="xs" c="orange">
                          Истекают: {formatNumber(subscriptionStats?.expiringSubscriptionsNextMonth || 0)}
                        </Text>
                      </Stack>
                      <ThemeIcon size={60} radius="md" color="yellow" variant="light">
                        <IconCreditCard size={30} />
                      </ThemeIcon>
                    </Group>
                  </Card>

                  {/* Gym Machines Card */}
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between">
                      <Stack gap="xs">
                        <Text size="sm" c="dimmed">Всего тренажеров</Text>
                        <Text size="xl" fw={700}>{formatNumber(gymStats?.totalMachinesOverall || 0)}</Text>
                        <Text size="xs" c="purple">
                          В {Object.keys(gymStats?.totalMachinesByGymRoom || {}).length} залах
                        </Text>
                      </Stack>
                      <ThemeIcon size={60} radius="md" color="purple" variant="light">
                        <IconBarbell size={30} />
                      </ThemeIcon>
                    </Group>
                  </Card>
                </SimpleGrid>

                {/* Detailed Stats */}
                <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mt="lg">
                  {/* User Roles Distribution */}
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="md">
                      <Text fw={500} size="lg">Распределение ролей пользователей</Text>
                      {userStats?.usersCountByRole && Object.entries(userStats.usersCountByRole).map(([role, count]) => {
                        const total = userStats.totalRegisteredUsers;
                        const percentage = getPercentage(count, total);
                        const roleText = role === 'ADMIN' ? 'Администраторы' : 
                                        role === 'TRAINER' ? 'Тренеры' : 'Пользователи';
                        const color = role === 'ADMIN' ? 'red' : 
                                     role === 'TRAINER' ? 'blue' : 'gray';
                        
                        return (
                          <Box key={role}>
                            <Group justify="space-between" mb="xs">
                              <Text size="sm">{roleText}</Text>
                              <Text size="sm" fw={500}>{count} ({percentage}%)</Text>
                            </Group>
                            <Progress value={percentage} color={color} size="sm" />
                          </Box>
                        );
                      })}
                    </Stack>
                  </Card>

                  {/* Training Status Ring */}
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="md">
                      <Text fw={500} size="lg">Статус тренировок</Text>
                      {trainingStats && (
                        <Center>
                          <RingProgress
                            size={200}
                            sections={[
                              { 
                                value: getPercentage(trainingStats.completedTrainingSessions, trainingStats.totalScheduledTrainingSessions), 
                                color: 'green', 
                                tooltip: `Завершено: ${trainingStats.completedTrainingSessions}` 
                              },
                              { 
                                value: getPercentage(trainingStats.activeTrainingSessions, trainingStats.totalScheduledTrainingSessions), 
                                color: 'blue', 
                                tooltip: `Активно: ${trainingStats.activeTrainingSessions}` 
                              },
                              { 
                                value: getPercentage(trainingStats.upcomingTrainingSessions, trainingStats.totalScheduledTrainingSessions), 
                                color: 'orange', 
                                tooltip: `Предстоящие: ${trainingStats.upcomingTrainingSessions}` 
                              }
                            ]}
                            label={
                              <Text c="dimmed" fw={700} ta="center" size="xl">
                                {formatNumber(trainingStats.totalScheduledTrainingSessions)}
                              </Text>
                            }
                          />
                        </Center>
                      )}
                      <Group justify="center">
                        <Flex direction="column" gap="xs">
                          <Group gap="xs">
                            <Box w={12} h={12} bg="green" style={{ borderRadius: '50%' }} />
                            <Text size="sm">Завершено</Text>
                          </Group>
                          <Group gap="xs">
                            <Box w={12} h={12} bg="blue" style={{ borderRadius: '50%' }} />
                            <Text size="sm">Активно</Text>
                          </Group>
                          <Group gap="xs">
                            <Box w={12} h={12} bg="orange" style={{ borderRadius: '50%' }} />
                            <Text size="sm">Предстоящие</Text>
                          </Group>
                        </Flex>
                      </Group>
                    </Stack>
                  </Card>
                </SimpleGrid>
              </Tabs.Panel>

              {/* Users Tab */}
              <Tabs.Panel value="users" pt="lg">
                <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="md">
                      <Group justify="space-between">
                        <Text fw={500} size="lg">Новые регистрации</Text>
                        <Select
                          value={registrationPeriod}
                          onChange={(value) => setRegistrationPeriod(value || 'LAST_WEEK')}
                          data={[
                            { value: 'LAST_DAY', label: 'За день' },
                            { value: 'LAST_WEEK', label: 'За неделю' },
                            { value: 'LAST_MONTH', label: 'За месяц' }
                          ]}
                          size="sm"
                        />
                      </Group>
                      <Center>
                        <Stack align="center" gap="xs">
                          <Text size="3rem" fw={700} c="blue">
                            {formatNumber(newRegistrations?.count || 0)}
                          </Text>
                          <Text size="sm" c="dimmed">
                            новых пользователей за {
                              registrationPeriod === 'LAST_DAY' ? 'день' : 
                              registrationPeriod === 'LAST_WEEK' ? 'неделю' : 'месяц'
                            }
                          </Text>
                        </Stack>
                      </Center>
                    </Stack>
                  </Card>

                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="md">
                      <Text fw={500} size="lg">Общая статистика пользователей</Text>
                      <Group grow>
                        <Stack align="center" gap="xs">
                          <ThemeIcon size={40} color="blue" variant="light">
                            <IconUsers size={20} />
                          </ThemeIcon>
                          <Text size="lg" fw={600}>{formatNumber(userStats?.totalRegisteredUsers || 0)}</Text>
                          <Text size="sm" c="dimmed">Всего зарегистрировано</Text>
                        </Stack>
                        <Stack align="center" gap="xs">
                          <ThemeIcon size={40} color="green" variant="light">
                            <IconUserPlus size={20} />
                          </ThemeIcon>
                          <Text size="lg" fw={600}>{formatNumber(userStats?.totalActiveUsers || 0)}</Text>
                          <Text size="sm" c="dimmed">Активных пользователей</Text>
                        </Stack>
                      </Group>
                    </Stack>
                  </Card>
                </SimpleGrid>
              </Tabs.Panel>

              {/* Other tabs will be simplified for now */}
              <Tabs.Panel value="trainings" pt="lg">
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="md">
                    <Text fw={500} size="lg">Статистика тренировок</Text>
                    <SimpleGrid cols={{ base: 2, lg: 4 }} spacing="md">
                      <Stack align="center" gap="xs">
                        <ThemeIcon size={40} color="blue" variant="light">
                          <IconCalendarStats size={20} />
                        </ThemeIcon>
                        <Text size="lg" fw={600}>{formatNumber(trainingStats?.totalScheduledTrainingSessions || 0)}</Text>
                        <Text size="sm" c="dimmed">Запланировано</Text>
                      </Stack>
                      <Stack align="center" gap="xs">
                        <ThemeIcon size={40} color="green" variant="light">
                          <IconClipboardCheck size={20} />
                        </ThemeIcon>
                        <Text size="lg" fw={600}>{formatNumber(trainingStats?.completedTrainingSessions || 0)}</Text>
                        <Text size="sm" c="dimmed">Завершено</Text>
                      </Stack>
                      <Stack align="center" gap="xs">
                        <ThemeIcon size={40} color="orange" variant="light">
                          <IconTrendingUp size={20} />
                        </ThemeIcon>
                        <Text size="lg" fw={600}>{trainingStats?.averageParticipantsPerSession.toFixed(1) || '0'}</Text>
                        <Text size="sm" c="dimmed">Среднее участников</Text>
                      </Stack>
                      <Stack align="center" gap="xs">
                        <ThemeIcon size={40} color="purple" variant="light">
                          <IconUsers size={20} />
                        </ThemeIcon>
                        <Text size="lg" fw={600}>{formatNumber(trainingStats?.maxParticipantsPerSession || 0)}</Text>
                        <Text size="sm" c="dimmed">Максимум участников</Text>
                      </Stack>
                    </SimpleGrid>
                  </Stack>
                </Card>
              </Tabs.Panel>

              <Tabs.Panel value="subscriptions" pt="lg">
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="md">
                    <Text fw={500} size="lg">Статистика подписок</Text>
                    <Group grow>
                      <Stack align="center" gap="xs">
                        <ThemeIcon size={40} color="green" variant="light">
                          <IconCreditCard size={20} />
                        </ThemeIcon>
                        <Text size="lg" fw={600}>{formatNumber(subscriptionStats?.totalActiveSubscriptions || 0)}</Text>
                        <Text size="sm" c="dimmed">Активных подписок</Text>
                      </Stack>
                      <Stack align="center" gap="xs">
                        <ThemeIcon size={40} color="orange" variant="light">
                          <IconCalendar size={20} />
                        </ThemeIcon>
                        <Text size="lg" fw={600}>{formatNumber(subscriptionStats?.expiringSubscriptionsNextMonth || 0)}</Text>
                        <Text size="sm" c="dimmed">Истекают в этом месяце</Text>
                      </Stack>
                    </Group>
                  </Stack>
                </Card>
              </Tabs.Panel>

              <Tabs.Panel value="gyms" pt="lg">
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="md">
                    <Text fw={500} size="lg">Статистика залов</Text>
                    <Group grow>
                      <Stack align="center" gap="xs">
                        <ThemeIcon size={40} color="purple" variant="light">
                          <IconBarbell size={20} />
                        </ThemeIcon>
                        <Text size="lg" fw={600}>{formatNumber(gymStats?.totalMachinesOverall || 0)}</Text>
                        <Text size="sm" c="dimmed">Всего тренажеров</Text>
                      </Stack>
                      <Stack align="center" gap="xs">
                        <ThemeIcon size={40} color="blue" variant="light">
                          <IconBuilding size={20} />
                        </ThemeIcon>
                        <Text size="lg" fw={600}>{Object.keys(gymStats?.totalMachinesByGymRoom || {}).length}</Text>
                        <Text size="sm" c="dimmed">Залов</Text>
                      </Stack>
                    </Group>
                    
                    {gymStats?.totalMachinesByGymRoom && Object.keys(gymStats.totalMachinesByGymRoom).length > 0 && (
                      <Stack gap="md" mt="lg">
                        <Text fw={500}>Тренажеры по залам:</Text>
                        {Object.entries(gymStats.totalMachinesByGymRoom).map(([gymName, count]) => (
                          <Group key={gymName} justify="space-between">
                            <Text size="sm">{gymName}</Text>
                            <Badge variant="light" color="blue">{count} тренажеров</Badge>
                          </Group>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Card>
              </Tabs.Panel>

              <Tabs.Panel value="enrollments" pt="lg">
                <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="md">
                      <Group justify="space-between">
                        <Text fw={500} size="lg">Записи на тренировки</Text>
                        <Select
                          value={enrollmentPeriod}
                          onChange={(value) => setEnrollmentPeriod(value || 'LAST_WEEK')}
                          data={[
                            { value: 'LAST_DAY', label: 'За день' },
                            { value: 'LAST_WEEK', label: 'За неделю' },
                            { value: 'LAST_MONTH', label: 'За месяц' },
                            { value: 'ALL_TIME', label: 'За все время' }
                          ]}
                          size="sm"
                        />
                      </Group>
                      <Center>
                        <Stack align="center" gap="xs">
                          <Text size="3rem" fw={700} c="green">
                            {formatNumber(enrollmentStats?.enrollmentsCountInPeriod || 0)}
                          </Text>
                          <Text size="sm" c="dimmed">записей за выбранный период</Text>
                        </Stack>
                      </Center>
                    </Stack>
                  </Card>

                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="md">
                      <Text fw={500} size="lg">Статус записей</Text>
                      {enrollmentStats?.enrollmentsCountByStatus && Object.entries(enrollmentStats.enrollmentsCountByStatus).map(([status, count]) => {
                        const total = Object.values(enrollmentStats.enrollmentsCountByStatus).reduce((sum, val) => sum + val, 0);
                        const percentage = getPercentage(count, total);
                        const statusText = status === 'CONFIRMED' ? 'Подтверждено' : 
                                          status === 'PENDING' ? 'Ожидание' : 'Отменено';
                        const color = status === 'CONFIRMED' ? 'green' : 
                                     status === 'PENDING' ? 'yellow' : 'red';
                        
                        return (
                          <Box key={status}>
                            <Group justify="space-between" mb="xs">
                              <Text size="sm">{statusText}</Text>
                              <Text size="sm" fw={500}>{count} ({percentage}%)</Text>
                            </Group>
                            <Progress value={percentage} color={color} size="sm" />
                          </Box>
                        );
                      })}
                    </Stack>
                  </Card>
                </SimpleGrid>
              </Tabs.Panel>
            </Tabs>
          </Stack>
        </Paper>
      </Container>
    </Layout>
  );
}; 