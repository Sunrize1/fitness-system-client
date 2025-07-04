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
  ThemeIcon,
  Button,
  Tooltip,
  Timeline,
  Divider,
  NumberFormatter,
  ActionIcon
} from '@mantine/core';
import { LineChart, BarChart, PieChart, AreaChart, DonutChart } from '@mantine/charts';
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
  IconClipboardCheck,
  IconDownload,
  IconRefresh,
  IconChartLine,
  IconChartPie,
  IconChartDots,
  IconActivity,
  IconTarget,
  IconTrendingDown,
  IconClock,
  IconPercentage,
  IconFilter,
  IconEye,
  IconArrowUp,
  IconArrowDown
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
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [showTrends, setShowTrends] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartsReady, setChartsReady] = useState(false);

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

  useEffect(() => {
    // Отключаем графики по умолчанию из-за проблем с размерами
    // Пользователь может включить их вручную
    setChartsReady(false);
  }, []);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAllStatistics();
      await fetchNewRegistrations();
      await fetchEnrollmentStatistics();
      notifications.show({
        title: 'Успешно',
        message: 'Статистика обновлена',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось обновить статистику',
        color: 'red',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = () => {
    const data = {
      userStats,
      trainingStats,
      subscriptionStats,
      gymStats,
      enrollmentStats,
      newRegistrations,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-statistics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getGrowthTrend = (current: number, previous: number): 'up' | 'down' | 'stable' => {
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'stable';
  };

  const formatPercentageChange = (current: number, previous: number): string => {
    if (previous === 0) return '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
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
              <div>
                <Title order={2}>Статистика и аналитика</Title>
                <Text c="dimmed" size="sm">
                  Комплексная аналитика системы фитнес-центра
                </Text>
              </div>
                              <Group gap="sm">
                <Tooltip label="Переключить режим отображения">
                  <ActionIcon
                    size="lg"
                    variant="light"
                    color="purple"
                    onClick={() => {
                      setChartsReady(!chartsReady);
                      notifications.show({
                        title: 'Режим отображения изменен',
                        message: !chartsReady ? 
                          'Включены интерактивные графики' : 
                          'Переключено на табличный режим (стабильный)',
                        color: !chartsReady ? 'green' : 'blue',
                        icon: !chartsReady ? <IconChartBar size={16} /> : <IconEye size={16} />
                      });
                    }}
                  >
                    {chartsReady ? <IconChartBar size={20} /> : <IconEye size={20} />}
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Обновить данные">
                  <ActionIcon
                    size="lg"
                    variant="light"
                    color="blue"
                    onClick={handleRefresh}
                    loading={refreshing}
                  >
                    <IconRefresh size={20} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Экспортировать данные">
                  <ActionIcon
                    size="lg"
                    variant="light"
                    color="green"
                    onClick={handleExport}
                  >
                    <IconDownload size={20} />
                  </ActionIcon>
                </Tooltip>
                <Group gap="xs">
                  <Badge size="lg" variant="light" color="blue">
                    Панель администратора
                  </Badge>
                  <Badge size="sm" variant="light" color={chartsReady ? 'green' : 'orange'}>
                    {chartsReady ? 'Графики' : 'Таблицы'}
                  </Badge>
                </Group>
              </Group>
            </Group>
            
              
              <Alert
                icon={<IconInfoCircle size={16} />}
                title="Режимы отображения"
                color={chartsReady ? 'green' : 'blue'}
                variant="light"
                mb="lg"
              >
                {chartsReady ? 
                  'Активен режим интерактивных графиков. Если графики не отображаются корректно, переключитесь на табличный режим.' : 
                  'Активен стабильный табличный режим отображения данных. Вы можете переключиться на графики через кнопку в заголовке.'
                }
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
                <Tabs.Tab value="analytics" leftSection={<IconChartLine size={16} />}>
                  Аналитика
                </Tabs.Tab>
              </Tabs.List>

              {/* Overview Tab */}
              <Tabs.Panel value="overview" pt="lg">
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
                  {/* Users Card */}
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between">
                      <Stack gap="xs">
                        <Group gap="xs">
                          <Text size="sm" c="dimmed">Всего пользователей</Text>
                          <Badge variant="light" color="blue" size="xs">
                            <IconTrendingUp size={10} />
                          </Badge>
                        </Group>
                        <NumberFormatter 
                          value={userStats?.totalRegisteredUsers || 0} 
                          thousandSeparator=" " 
                          suffix=""
                          style={{ fontSize: '2rem', fontWeight: 700 }}
                        />
                        <Group gap="sm">
                          <div style={{ fontSize: 'var(--mantine-font-size-xs)', color: 'var(--mantine-color-green-6)' }}>
                            <Group gap={4}>
                              <IconUsers size={12} />
                              Активных: {formatNumber(userStats?.totalActiveUsers || 0)}
                            </Group>
                          </div>
                          <div style={{ fontSize: 'var(--mantine-font-size-xs)', color: 'var(--mantine-color-orange-6)' }}>
                            <Group gap={4}>
                              <IconPercentage size={12} />
                              {getPercentage(userStats?.totalActiveUsers || 0, userStats?.totalRegisteredUsers || 0)}%
                            </Group>
                          </div>
                        </Group>
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
                        <Group gap="xs">
                          <Text size="sm" c="dimmed">Тренировок запланировано</Text>
                          <Badge variant="light" color="green" size="xs">
                            <IconActivity size={10} />
                          </Badge>
                        </Group>
                        <NumberFormatter 
                          value={trainingStats?.totalScheduledTrainingSessions || 0} 
                          thousandSeparator=" " 
                          suffix=""
                          style={{ fontSize: '2rem', fontWeight: 700 }}
                        />
                        <Group gap="sm">
                          <div style={{ fontSize: 'var(--mantine-font-size-xs)', color: 'var(--mantine-color-blue-6)' }}>
                            <Group gap={4}>
                              <IconClock size={12} />
                              Активных: {formatNumber(trainingStats?.activeTrainingSessions || 0)}
                            </Group>
                          </div>
                          <div style={{ fontSize: 'var(--mantine-font-size-xs)', color: 'var(--mantine-color-green-6)' }}>
                            <Group gap={4}>
                              <IconTarget size={12} />
                              Завершено: {formatNumber(trainingStats?.completedTrainingSessions || 0)}
                            </Group>
                          </div>
                        </Group>
                        <Progress 
                          value={getPercentage(trainingStats?.completedTrainingSessions || 0, trainingStats?.totalScheduledTrainingSessions || 0)} 
                          size="xs" 
                          color="green"
                        />
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
                        <Group gap="xs">
                          <Text size="sm" c="dimmed">Активных подписок</Text>
                          <Badge variant="light" color="yellow" size="xs">
                            <IconCreditCard size={10} />
                          </Badge>
                        </Group>
                        <NumberFormatter 
                          value={subscriptionStats?.totalActiveSubscriptions || 0} 
                          thousandSeparator=" " 
                          suffix=""
                          style={{ fontSize: '2rem', fontWeight: 700 }}
                        />
                        <Group gap="sm">
                          <div style={{ fontSize: 'var(--mantine-font-size-xs)', color: 'var(--mantine-color-orange-6)' }}>
                            <Group gap={4}>
                              <IconClock size={12} />
                              Истекают: {formatNumber(subscriptionStats?.expiringSubscriptionsNextMonth || 0)}
                            </Group>
                          </div>
                          <div style={{ fontSize: 'var(--mantine-font-size-xs)', color: 'var(--mantine-color-red-6)' }}>
                            <Group gap={4}>
                              <IconPercentage size={12} />
                              {getPercentage(subscriptionStats?.expiringSubscriptionsNextMonth || 0, subscriptionStats?.totalActiveSubscriptions || 0)}%
                            </Group>
                          </div>
                        </Group>
                        <Progress 
                          value={100 - getPercentage(subscriptionStats?.expiringSubscriptionsNextMonth || 0, subscriptionStats?.totalActiveSubscriptions || 0)} 
                          size="xs" 
                          color="yellow"
                        />
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
                        <Group gap="xs">
                          <Text size="sm" c="dimmed">Всего тренажеров</Text>
                          <Badge variant="light" color="purple" size="xs">
                            <IconBarbell size={10} />
                          </Badge>
                        </Group>
                        <NumberFormatter 
                          value={gymStats?.totalMachinesOverall || 0} 
                          thousandSeparator=" " 
                          suffix=""
                          style={{ fontSize: '2rem', fontWeight: 700 }}
                        />
                        <Group gap="sm">
                          <div style={{ fontSize: 'var(--mantine-font-size-xs)', color: 'var(--mantine-color-purple-6)' }}>
                            <Group gap={4}>
                              <IconBuilding size={12} />
                              В {Object.keys(gymStats?.totalMachinesByGymRoom || {}).length} залах
                            </Group>
                          </div>
                          <div style={{ fontSize: 'var(--mantine-font-size-xs)', color: 'var(--mantine-color-blue-6)' }}>
                            <Group gap={4}>
                              <IconChartBar size={12} />
                              Среднее: {Math.round((gymStats?.totalMachinesOverall || 0) / Math.max(Object.keys(gymStats?.totalMachinesByGymRoom || {}).length, 1))} на зал
                            </Group>
                          </div>
                        </Group>
                      </Stack>
                      <ThemeIcon size={60} radius="md" color="purple" variant="light">
                        <IconBarbell size={30} />
                      </ThemeIcon>
                    </Group>
                  </Card>
                </SimpleGrid>

                {/* Charts Section */}
                <Card shadow="sm" padding="lg" radius="md" withBorder mt="lg" style={{ minWidth: 400 }}>
                  <Group justify="space-between" mb="md">
                    <Text fw={500} size="lg">Популярные типы тренировок</Text>
                    <Badge variant="light" color="blue">
                      <IconChartPie size={12} />
                    </Badge>
                  </Group>
                                     {trainingStats?.popularTrainingTypes && Object.keys(trainingStats.popularTrainingTypes).length > 0 ? (
                     <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
                       {chartsReady ? (
                         <Center>
                           <div style={{ width: 250, height: 250 }}>
                             <PieChart
                               data={Object.entries(trainingStats.popularTrainingTypes).map(([type, count]) => ({
                                 name: type === 'GROUP' ? 'Групповые' : 'Персональные',
                                 value: count,
                                 color: type === 'GROUP' ? '#339af0' : '#51cf66'
                               }))}
                               withTooltip
                               tooltipDataSource="segment"
                               size={200}
                             />
                           </div>
                         </Center>
                       ) : (
                         <Center>
                           <Stack gap="md" align="center">
                             <Text fw={500} size="sm">Типы тренировок</Text>
                             <Stack gap="sm">
                               {Object.entries(trainingStats.popularTrainingTypes).map(([type, count]) => (
                                 <Group key={type} gap="sm">
                                   <Box 
                                     w={20} 
                                     h={20} 
                                     bg={type === 'GROUP' ? 'blue' : 'green'} 
                                     style={{ borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                   >
                                     <Text size="xs" c="white" fw={700}>{count}</Text>
                                   </Box>
                                   <Text size="sm">{type === 'GROUP' ? 'Групповые' : 'Персональные'}</Text>
                                 </Group>
                               ))}
                             </Stack>
                           </Stack>
                         </Center>
                       )}
                       <Stack gap="md">
                         {Object.entries(trainingStats.popularTrainingTypes).map(([type, count]) => (
                           <Group key={type} justify="space-between">
                             <Group gap="sm">
                               <Box 
                                 w={12} 
                                 h={12} 
                                 bg={type === 'GROUP' ? 'blue' : 'green'} 
                                 style={{ borderRadius: '50%' }} 
                               />
                               <Text size="sm">{type === 'GROUP' ? 'Групповые тренировки' : 'Персональные тренировки'}</Text>
                             </Group>
                             <Text size="sm" fw={500}>{count}</Text>
                           </Group>
                         ))}
                       </Stack>
                     </SimpleGrid>
                   ) : (
                     <Text c="dimmed" ta="center" p="xl">
                       Нет данных о типах тренировок
                     </Text>
                   )}
                </Card>

                {/* Trainers Chart */}
                <Card shadow="sm" padding="lg" radius="md" withBorder mt="lg" style={{ minWidth: 400 }}>
                  <Group justify="space-between" mb="md">
                    <Text fw={500} size="lg">Топ тренеров по количеству тренировок</Text>
                    <Badge variant="light" color="orange">
                      <IconChartBar size={12} />
                    </Badge>
                  </Group>
                                     {trainingStats?.busiestTrainersBySessionsCount && Object.keys(trainingStats.busiestTrainersBySessionsCount).length > 0 ? (
                     chartsReady ? (
                       <div style={{ width: '100%', height: 300 }}>
                         <BarChart
                           h={300}
                           data={Object.entries(trainingStats.busiestTrainersBySessionsCount)
                             .sort(([,a], [,b]) => b - a)
                             .slice(0, 10)
                             .map(([trainer, count]) => ({
                               trainer: trainer.length > 15 ? trainer.substring(0, 15) + '...' : trainer,
                               sessions: count,
                             }))}
                           dataKey="trainer"
                           series={[
                             { name: 'sessions', color: 'orange.6' },
                           ]}
                           withXAxis
                           withYAxis
                           withTooltip
                         />
                       </div>
                     ) : (
                       <Stack gap="md" p="md">
                         <Text fw={500} size="sm">Топ тренеров:</Text>
                         {Object.entries(trainingStats.busiestTrainersBySessionsCount)
                           .sort(([,a], [,b]) => b - a)
                           .slice(0, 10)
                           .map(([trainer, count], index) => (
                             <Group key={trainer} justify="space-between">
                               <Group gap="sm">
                                 <Badge variant="light" color="orange" size="sm">
                                   {index + 1}
                                 </Badge>
                                 <Text size="sm">{trainer}</Text>
                               </Group>
                               <Text size="sm" fw={500}>{count} тренировок</Text>
                             </Group>
                           ))}
                       </Stack>
                     )
                   ) : (
                     <Text c="dimmed" ta="center" p="xl">
                       Нет данных о тренерах
                     </Text>
                   )}
                </Card>

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

              {/* Analytics Tab */}
              <Tabs.Panel value="analytics" pt="lg">
                <Stack gap="lg">
                  {/* Performance Metrics */}
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <Text fw={500} size="lg">Показатели эффективности</Text>
                      <Badge variant="light" color="blue">
                        <IconActivity size={12} />
                      </Badge>
                    </Group>
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                      <Stack align="center" gap="xs">
                        <RingProgress
                          size={80}
                          thickness={8}
                          sections={[
                            { 
                              value: getPercentage(trainingStats?.completedTrainingSessions || 0, trainingStats?.totalScheduledTrainingSessions || 0), 
                              color: 'green' 
                            }
                          ]}
                          label={
                            <Text c="green" fw={700} ta="center" size="sm">
                              {getPercentage(trainingStats?.completedTrainingSessions || 0, trainingStats?.totalScheduledTrainingSessions || 0)}%
                            </Text>
                          }
                        />
                        <Text size="sm" c="dimmed" ta="center">Завершенность тренировок</Text>
                      </Stack>
                      <Stack align="center" gap="xs">
                        <RingProgress
                          size={80}
                          thickness={8}
                          sections={[
                            { 
                              value: getPercentage(userStats?.totalActiveUsers || 0, userStats?.totalRegisteredUsers || 0), 
                              color: 'blue' 
                            }
                          ]}
                          label={
                            <Text c="blue" fw={700} ta="center" size="sm">
                              {getPercentage(userStats?.totalActiveUsers || 0, userStats?.totalRegisteredUsers || 0)}%
                            </Text>
                          }
                        />
                        <Text size="sm" c="dimmed" ta="center">Активность пользователей</Text>
                      </Stack>
                      <Stack align="center" gap="xs">
                        <RingProgress
                          size={80}
                          thickness={8}
                          sections={[
                            { 
                              value: 100 - getPercentage(subscriptionStats?.expiringSubscriptionsNextMonth || 0, subscriptionStats?.totalActiveSubscriptions || 0), 
                              color: 'yellow' 
                            }
                          ]}
                          label={
                            <Text c="yellow" fw={700} ta="center" size="sm">
                              {100 - getPercentage(subscriptionStats?.expiringSubscriptionsNextMonth || 0, subscriptionStats?.totalActiveSubscriptions || 0)}%
                            </Text>
                          }
                        />
                        <Text size="sm" c="dimmed" ta="center">Стабильность подписок</Text>
                      </Stack>
                      <Stack align="center" gap="xs">
                        <RingProgress
                          size={80}
                          thickness={8}
                          sections={[
                            { 
                              value: Math.min(100, (trainingStats?.averageParticipantsPerSession || 0) * 10), 
                              color: 'purple' 
                            }
                          ]}
                          label={
                            <Text c="purple" fw={700} ta="center" size="sm">
                              {(trainingStats?.averageParticipantsPerSession || 0).toFixed(1)}
                            </Text>
                          }
                        />
                        <Text size="sm" c="dimmed" ta="center">Среднее участников</Text>
                      </Stack>
                    </SimpleGrid>
                  </Card>

                  {/* Gym Room Usage */}
                  <Card shadow="sm" padding="lg" radius="md" withBorder style={{ minWidth: 400 }}>
                    <Group justify="space-between" mb="md">
                      <Text fw={500} size="lg">Использование залов</Text>
                      <Badge variant="light" color="purple">
                        <IconBuilding size={12} />
                      </Badge>
                    </Group>
                                        {gymStats?.popularGymRoomsByTrainingCount && Object.keys(gymStats.popularGymRoomsByTrainingCount).length > 0 ? (
                       chartsReady ? (
                         <div style={{ width: '100%', height: 300 }}>
                           <BarChart
                             h={300}
                             data={Object.entries(gymStats.popularGymRoomsByTrainingCount)
                               .sort(([,a], [,b]) => b - a)
                               .map(([room, count]) => ({
                                 room: room.length > 20 ? room.substring(0, 20) + '...' : room,
                                 trainings: count,
                               }))}
                             dataKey="room"
                             series={[
                               { name: 'trainings', color: 'purple.6' },
                             ]}
                             withXAxis
                             withYAxis
                             withTooltip
                           />
                         </div>
                       ) : (
                         <Stack gap="md" p="md">
                           <Text fw={500} size="sm">Популярные залы:</Text>
                           {Object.entries(gymStats.popularGymRoomsByTrainingCount)
                             .sort(([,a], [,b]) => b - a)
                             .map(([room, count], index) => (
                               <Group key={room} justify="space-between">
                                 <Group gap="sm">
                                   <Badge variant="light" color="purple" size="sm">
                                     {index + 1}
                                   </Badge>
                                   <Text size="sm">{room}</Text>
                                 </Group>
                                 <Text size="sm" fw={500}>{count} тренировок</Text>
                               </Group>
                             ))}
                         </Stack>
                       )
                     ) : (
                       <Stack gap="md">
                         <Text c="dimmed" ta="center">
                           Нет данных об использовании залов
                         </Text>
                         {/* Fallback: показываем данные в текстовом виде */}
                         {gymStats?.totalMachinesByGymRoom && Object.keys(gymStats.totalMachinesByGymRoom).length > 0 && (
                           <Stack gap="sm">
                             <Text size="sm" fw={500}>Тренажеры по залам:</Text>
                             {Object.entries(gymStats.totalMachinesByGymRoom).map(([room, count]) => (
                               <Group key={room} justify="space-between">
                                 <Text size="sm">{room}</Text>
                                 <Badge variant="light" color="purple">{count} тренажеров</Badge>
                               </Group>
                             ))}
                           </Stack>
                         )}
                       </Stack>
                     )}
                  </Card>

                  {/* Timeline */}
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <Text fw={500} size="lg">Временная шкала активности</Text>
                      <Badge variant="light" color="teal">
                        <IconClock size={12} />
                      </Badge>
                    </Group>
                    <Timeline active={-1} bulletSize={24} lineWidth={2}>
                      <Timeline.Item
                        bullet={<IconUsers size={14} />}
                        title="Пользователи"
                        color="blue"
                      >
                        <Text c="dimmed" size="sm">
                          Всего зарегистрировано: {formatNumber(userStats?.totalRegisteredUsers || 0)}
                        </Text>
                        <Text c="dimmed" size="sm">
                          Активных: {formatNumber(userStats?.totalActiveUsers || 0)}
                        </Text>
                      </Timeline.Item>
                      <Timeline.Item
                        bullet={<IconBarbell size={14} />}
                        title="Тренировки"
                        color="green"
                      >
                        <Text c="dimmed" size="sm">
                          Запланировано: {formatNumber(trainingStats?.totalScheduledTrainingSessions || 0)}
                        </Text>
                        <Text c="dimmed" size="sm">
                          Завершено: {formatNumber(trainingStats?.completedTrainingSessions || 0)}
                        </Text>
                      </Timeline.Item>
                      <Timeline.Item
                        bullet={<IconCreditCard size={14} />}
                        title="Подписки"
                        color="yellow"
                      >
                        <Text c="dimmed" size="sm">
                          Активных: {formatNumber(subscriptionStats?.totalActiveSubscriptions || 0)}
                        </Text>
                        <Text c="dimmed" size="sm">
                          Истекают: {formatNumber(subscriptionStats?.expiringSubscriptionsNextMonth || 0)}
                        </Text>
                      </Timeline.Item>
                      <Timeline.Item
                        bullet={<IconListCheck size={14} />}
                        title="Записи"
                        color="orange"
                      >
                        <Text c="dimmed" size="sm">
                          За период: {formatNumber(enrollmentStats?.enrollmentsCountInPeriod || 0)}
                        </Text>
                        {enrollmentStats?.enrollmentsCountByStatus && (
                          <Text c="dimmed" size="sm">
                            Подтверждено: {formatNumber(enrollmentStats.enrollmentsCountByStatus.CONFIRMED || 0)}
                          </Text>
                        )}
                      </Timeline.Item>
                    </Timeline>
                  </Card>
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </Stack>
        </Paper>
      </Container>
    </Layout>
  );
}; 