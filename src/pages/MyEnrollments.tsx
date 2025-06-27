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
  Modal
} from '@mantine/core';
import { 
  IconCalendarEvent,
  IconClock,
  IconMapPin,
  IconUsers,
  IconTrash,
  IconEye
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { getMyEnrollments, cancelEnrollment } from '../api/enrollment';
import { getTrainingSession } from '../api/trainingSession';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components';
import type { EnrollmentDto, TrainingSessionDto } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { parseBackendDate } from '../utils/dateUtils';
import { notifications } from '@mantine/notifications';

export const MyEnrollments: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<EnrollmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<TrainingSessionDto | null>(null);
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

  const handleViewSessionDetails = async (sessionId: number) => {
    setLoadingSession(true);
    try {
      const session = await getTrainingSession(sessionId);
      setSelectedSession(session);
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
            <Stack gap="md">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between" align="flex-start">
                    <Stack gap="sm" style={{ flex: 1 }}>
                      <Group justify="space-between">
                        <Title order={3}>{enrollment.trainingSessionName}</Title>
                        <Badge color={getStatusColor(enrollment.status)}>
                          {getStatusLabel(enrollment.status)}
                        </Badge>
                      </Group>
                      
                      <Group gap="md">
                        <Group gap="xs">
                          <IconCalendarEvent size={16} />
                          <Text size="sm">
                            Записан: {format(parseBackendDate(enrollment.enrollmentTime), 'd MMMM yyyy, HH:mm', { locale: ru })}
                          </Text>
                        </Group>
                      </Group>
                    </Stack>

                    <Group gap="xs">
                      <ActionIcon
                        variant="light"
                        loading={loadingSession}
                        onClick={() => handleViewSessionDetails(enrollment.trainingSessionId)}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      
                      {enrollment.status !== 'CANCELLED' && (
                        <ActionIcon
                          variant="light"
                          color="red"
                          loading={cancelling === enrollment.id}
                          onClick={() => handleCancelEnrollment(enrollment.id)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
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
              
              {selectedSession.location && (
                <Group gap="xs">
                  <IconMapPin size={16} />
                  <Text>{selectedSession.location}</Text>
                </Group>
              )}
              
              <Group gap="xs">
                <IconUsers size={16} />
                <Text>
                  Участников: {selectedSession.currentParticipants}/{selectedSession.maxParticipants || '∞'}
                </Text>
              </Group>
              
              <Group gap="xs">
                <IconClock size={16} />
                <Text>Длительность: {selectedSession.durationMinutes} минут</Text>
              </Group>

              {selectedSession.trainer && (
                <Group gap="xs">
                  <Text fw={500}>Тренер:</Text>
                  <Text>
                    {selectedSession.trainer.firstname} {selectedSession.trainer.lastname}
                  </Text>
                </Group>
              )}
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