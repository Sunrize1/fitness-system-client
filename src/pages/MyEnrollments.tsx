import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Stack,
  Card,
  Text,
  Group,
  Badge,
  Button,
  Loader,
  Center,
  Paper,
  ActionIcon,
  Modal,
  SimpleGrid,
  Divider
} from '@mantine/core';
import {
  IconCalendarEvent,
  IconClock,
  IconMapPin,
  IconUsers,
  IconTrash,
  IconEye,
  IconUserCheck,
  IconUserPlus,
  IconCheck,
  IconX, IconGymnastics, IconAddressBook
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { getMyEnrollments, cancelEnrollment, approveEnrollment } from '../api/enrollment';
import { getTrainingSession } from '../api/trainingSession';
import { useAuth } from '../contexts/AuthContext';
import {Layout, Map2GIS} from '../components';
import type { EnrollmentDto, TrainingSessionDto } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { parseBackendDate } from '../utils/dateUtils';
import { notifications } from '@mantine/notifications';
import {fetchAddress} from "../utils/fetchAddress.ts";

export const MyEnrollments: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<EnrollmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [approving, setApproving] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<TrainingSessionDto | null>(null);
  const [address, setAddress] = useState('')
  const [modalOpened, setModalOpened] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);

  useEffect(() => {
    fetchMyEnrollments();
  }, []);

  const fetchMyEnrollments = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await getMyEnrollments();
      setEnrollments(data.enrollments || []);
    } catch (error) {
      console.error('Ошибка загрузки записей:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEnrollment = async (enrollmentId: number) => {
    if (window.confirm('Вы уверены, что хотите отменить запись на тренировку?')) {
      setCancelling(enrollmentId);
      try {
        await cancelEnrollment(enrollmentId);
        notifications.show({
          title: 'Успешно',
          message: 'Запись отменена',
          color: 'green',
        });
        await fetchMyEnrollments();
      } catch (error) {
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось отменить запись',
          color: 'red',
        });
      } finally {
        setCancelling(null);
      }
    }
  };

  const handleApproveEnrollment = async (enrollmentId: number) => {
    setApproving(enrollmentId);
    try {
      await approveEnrollment(enrollmentId);
      notifications.show({
        title: 'Успешно',
        message: 'Заявка принята',
        color: 'green',
        icon: <IconCheck size={18} />,
      });
      await fetchMyEnrollments();
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось принять заявку',
        color: 'red',
      });
    } finally {
      setApproving(null);
    }
  };

  const handleRejectEnrollment = async (enrollmentId: number) => {
    if (window.confirm('Вы уверены, что хотите отклонить заявку от тренера?')) {
      setCancelling(enrollmentId);
      try {
        await cancelEnrollment(enrollmentId);
        notifications.show({
          title: 'Успешно',
          message: 'Заявка отклонена',
          color: 'orange',
          icon: <IconX size={18} />,
        });
        await fetchMyEnrollments();
      } catch (error) {
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось отклонить заявку',
          color: 'red',
        });
      } finally {
        setCancelling(null);
      }
    }
  };

  const handleViewSessionDetails = async (sessionId: number) => {
    setLoadingSession(true);
    try {
      const session = await getTrainingSession(sessionId);
      setSelectedSession(session);
      setAddress(await fetchAddress(session.gymRoom.latitude, session.gymRoom.longitude))
      setModalOpened(true);
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось загрузить детали тренировки',
        color: 'red',
      });
    } finally {
      setLoadingSession(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'green';
      case 'WAITLIST':
        return 'yellow';
      case 'CANCELLED':
        return 'red';
      case 'PENDING':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Подтверждено';
      case 'WAITLIST':
        return 'В очереди';
      case 'CANCELLED':
        return 'Отменено';
      case 'PENDING':
        return 'На рассмотрении';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'GROUP' ? 'Групповая' : 'Персональная';
  };

  if (!user || user.userRole === 'TRAINER') {
    return (
      <Layout>
        <Container size="md" py="xl">
          <Center>
            <Stack align="center" gap="md">
              <Title order={2}>Доступ запрещен</Title>
              <Text>Эта страница доступна только для пользователей</Text>
              <Button onClick={() => navigate('/profile')}>
                Вернуться к профилю
              </Button>
            </Stack>
          </Center>
        </Container>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <Container size="md" py="xl">
          <Center>
            <Loader size="lg" />
          </Center>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container size="lg" py="xl">
        <Stack gap="xl">
          <Group justify="space-between">
            <Title order={1}>Мои записи на тренировки</Title>
            <Button
              variant="light"
              leftSection={<IconCalendarEvent size={16} />}
              onClick={() => navigate('/available-training-sessions')}
            >
              Записаться на тренировку
            </Button>
          </Group>

          {enrollments.length === 0 ? (
            <Card shadow="sm" padding="xl" radius="md" withBorder>
              <Center>
                <Stack align="center" gap="md">
                  <IconCalendarEvent size={48} style={{ opacity: 0.5 }} />
                  <Text size="lg" c="dimmed">У вас пока нет записей на тренировки</Text>
                  <Button
                    variant="filled"
                    onClick={() => navigate('/available-training-sessions')}
                  >
                    Найти тренировки
                  </Button>
                </Stack>
              </Center>
            </Card>
          ) : (
            <SimpleGrid cols={2} spacing="xl">
              {/* Заявки от тренера */}
              <Stack gap="md">
                <Group gap="xs">
                  <IconUserCheck size={20} />
                  <Title order={3}>Заявки от тренера</Title>
                </Group>
                
                {enrollments.filter(e => e.enrollmentCallType === 'TRAINER').length === 0 ? (
                  <Card shadow="sm" padding="md" radius="md" withBorder>
                    <Center>
                      <Text size="sm" c="dimmed">Нет заявок от тренера</Text>
                    </Center>
                  </Card>
                ) : (
                  <Stack gap="md">
                    {enrollments.filter(e => e.enrollmentCallType === 'TRAINER').map((enrollment) => (
                      <Card key={enrollment.id} shadow="sm" padding="md" radius="md" withBorder>
                        <Stack gap="sm">
                          <Group justify="space-between">
                            <Title order={4} size="sm">{enrollment.trainingSessionName}</Title>
                            <Badge color={getStatusColor(enrollment.status)}>
                              {getStatusLabel(enrollment.status)}
                            </Badge>
                          </Group>
                          
                          <Group gap="xs">
                            <IconCalendarEvent size={14} />
                            <Text size="xs">
                              Записан: {format(parseBackendDate(enrollment.enrollmentTime), 'd MMMM yyyy, HH:mm', { locale: ru })}
                            </Text>
                          </Group>

                          <Group justify="space-between" wrap="nowrap">
                            <ActionIcon
                              variant="light"
                              size="sm"
                              loading={loadingSession}
                              onClick={() => handleViewSessionDetails(enrollment.trainingSessionId)}
                            >
                              <IconEye size={14} />
                            </ActionIcon>
                            
                            {enrollment.status === 'PENDING' && (
                              <Group gap="xs">
                                <Button
                                  variant="light"
                                  color="green"
                                  size="xs"
                                  loading={approving === enrollment.id}
                                  onClick={() => handleApproveEnrollment(enrollment.id)}
                                  leftSection={<IconCheck size={14} />}
                                >
                                  Принять
                                </Button>
                                <Button
                                  variant="light"
                                  color="red"
                                  size="xs"
                                  loading={cancelling === enrollment.id}
                                  onClick={() => handleRejectEnrollment(enrollment.id)}
                                  leftSection={<IconX size={14} />}
                                >
                                  Отклонить
                                </Button>
                              </Group>
                            )}
                            
                            {enrollment.status !== 'CANCELLED' && enrollment.status !== 'PENDING' && (
                              <ActionIcon
                                variant="light"
                                color="red"
                                size="sm"
                                loading={cancelling === enrollment.id}
                                onClick={() => handleCancelEnrollment(enrollment.id)}
                              >
                                <IconTrash size={14} />
                              </ActionIcon>
                            )}
                          </Group>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Stack>

              {/* Заявки от пользователя */}
              <Stack gap="md">
                <Group gap="xs">
                  <IconUserPlus size={20} />
                  <Title order={3}>Мои заявки</Title>
                </Group>
                
                {enrollments.filter(e => e.enrollmentCallType === 'CLIENT').length === 0 ? (
                  <Card shadow="sm" padding="md" radius="md" withBorder>
                    <Center>
                      <Text size="sm" c="dimmed">Нет моих заявок</Text>
                    </Center>
                  </Card>
                ) : (
                  <Stack gap="md">
                    {enrollments.filter(e => e.enrollmentCallType === 'CLIENT').map((enrollment) => (
                      <Card key={enrollment.id} shadow="sm" padding="md" radius="md" withBorder>
                        <Stack gap="sm">
                          <Group justify="space-between">
                            <Title order={4} size="sm">{enrollment.trainingSessionName}</Title>
                            <Badge color={getStatusColor(enrollment.status)}>
                              {getStatusLabel(enrollment.status)}
                            </Badge>
                          </Group>
                          
                          <Group gap="xs">
                            <IconCalendarEvent size={14} />
                            <Text size="xs">
                              Записан: {format(parseBackendDate(enrollment.enrollmentTime), 'd MMMM yyyy, HH:mm', { locale: ru })}
                            </Text>
                          </Group>

                          <Group gap="xs">
                            <ActionIcon
                              variant="light"
                              size="sm"
                              loading={loadingSession}
                              onClick={() => handleViewSessionDetails(enrollment.trainingSessionId)}
                            >
                              <IconEye size={14} />
                            </ActionIcon>
                            
                            {enrollment.status !== 'CANCELLED' && (
                              <ActionIcon
                                variant="light"
                                color="red"
                                size="sm"
                                loading={cancelling === enrollment.id}
                                onClick={() => handleCancelEnrollment(enrollment.id)}
                              >
                                <IconTrash size={14} />
                              </ActionIcon>
                            )}
                          </Group>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Stack>
            </SimpleGrid>
          )}
        </Stack>
      </Container>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Детали тренировки"
        size="lg"
      >
        {selectedSession && (
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>{selectedSession.name}</Title>
              <Badge color={selectedSession.type === 'GROUP' ? 'blue' : 'green'}>
                {getTypeLabel(selectedSession.type)}
              </Badge>
            </Group>
            
            {selectedSession.description && (
              <Paper p="md" radius="md" withBorder bg="var(--mantine-color-default)">
                <Text>{selectedSession.description}</Text>
              </Paper>
            )}
            
            <Stack gap="xs">
              <Group gap="xs">
                <IconCalendarEvent size={16} />
                <Text>
                  {format(parseBackendDate(selectedSession.startTime), 'd MMMM yyyy, HH:mm', { locale: ru })} - {format(parseBackendDate(selectedSession.endTime), 'HH:mm')}
                </Text>
              </Group>
              
              <Group gap="xs">
                <IconMapPin size={16} />
                <Text>{selectedSession.gymRoom.name}</Text>
              </Group>
              
              <Group gap="xs">
                <IconUsers size={16} />
                {selectedSession.type === 'PERSONAL'
                    ?
                      <Text>Тренировка персональная</Text>
                    :
                      <Text>
                        Участников: {selectedSession.currentParticipants}/{selectedSession.maxParticipants || '∞'}
                      </Text>
                }

              </Group>
              
              <Group gap="xs">
                <IconClock size={16} />
                <Text>Длительность: {selectedSession.durationMinutes} минут</Text>
              </Group>

              <Group gap="xs">
                <IconAddressBook size={16} />
                <Text>Адрес: {address}</Text>
              </Group>

              {selectedSession.trainer && (
                <Group gap="xs">
                  <Text fw={500}>Тренер:</Text>
                  <Text>
                    {selectedSession.trainer.firstname} {selectedSession.trainer.lastname}
                  </Text>
                </Group>
              )}

              <Map2GIS {...selectedSession.gymRoom} height={250} />
            </Stack>
            
            {selectedSession.fullExercises && selectedSession.fullExercises.length > 0 && (
              <Stack gap="xs">
                <Title order={4}>Упражнения:</Title>
                {selectedSession.fullExercises.map((fullExercise) => (
                  <Paper key={fullExercise.id} p="md" withBorder radius="md">
                    <Stack gap="xs">
                      <Text fw={500}>{fullExercise.exerciseDto.title}</Text>
                      {fullExercise.exerciseDto.description && (
                        <Text size="sm" c="dimmed">{fullExercise.exerciseDto.description}</Text>
                      )}
                      <Badge variant="light" color="blue" size="sm">
                        {fullExercise.approachDto.approachesCount} подходов × {fullExercise.approachDto.repetitionPerApproachCount} повторений
                      </Badge>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </Modal>
    </Layout>
  );
}; 