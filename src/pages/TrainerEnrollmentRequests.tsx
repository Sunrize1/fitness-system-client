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
  Divider
} from '@mantine/core';
import { 
  IconCalendarEvent,
  IconClock,
  IconMapPin,
  IconUsers,
  IconEye,
  IconCheck,
  IconX,
  IconUserPlus
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { getTrainerEnrollmentRequests, approveEnrollment, cancelEnrollment } from '../api/enrollment';
import { getTrainingSession } from '../api/trainingSession';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components';
import type { EnrollmentDto, TrainingSessionDto } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { parseBackendDate } from '../utils/dateUtils';
import { notifications } from '@mantine/notifications';

export const TrainerEnrollmentRequests: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<EnrollmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<TrainingSessionDto | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);

  useEffect(() => {
    fetchEnrollmentRequests();
  }, []);

  const fetchEnrollmentRequests = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await getTrainerEnrollmentRequests();
      // Фильтруем только заявки от клиентов со статусом PENDING
      const clientRequests = data.enrollments?.filter(
        (enrollment: EnrollmentDto) => enrollment.enrollmentCallType === 'CLIENT' && enrollment.status === 'PENDING'
      ) || [];
      setEnrollments(clientRequests);
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEnrollment = async (enrollmentId: number) => {
    setProcessing(enrollmentId);
    try {
      await approveEnrollment(enrollmentId);
      notifications.show({
        title: 'Успешно',
        message: 'Заявка одобрена',
        color: 'green',
      });
      await fetchEnrollmentRequests();
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось одобрить заявку',
        color: 'red',
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectEnrollment = async (enrollmentId: number) => {
    if (window.confirm('Вы уверены, что хотите отклонить заявку?')) {
      setProcessing(enrollmentId);
      try {
        await cancelEnrollment(enrollmentId);
        notifications.show({
          title: 'Успешно',
          message: 'Заявка отклонена',
          color: 'green',
        });
        await fetchEnrollmentRequests();
      } catch (error) {
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось отклонить заявку',
          color: 'red',
        });
      } finally {
        setProcessing(null);
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

  const getTypeLabel = (type: string) => {
    return type === 'GROUP' ? 'Групповая' : 'Персональная';
  };

  if (!user || user.userRole !== 'TRAINER') {
    return (
      <Layout>
        <Container size="md" py="xl">
          <Center>
            <Stack align="center" gap="md">
              <Title order={2}>Доступ запрещен</Title>
              <Text>Эта страница доступна только для тренеров</Text>
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
            <Group gap="xs">
              <IconUserPlus size={24} />
              <Title order={1}>Заявки от пользователей</Title>
            </Group>
            <Button
              variant="light"
              leftSection={<IconCalendarEvent size={16} />}
              onClick={() => navigate('/my-training-sessions')}
            >
              Мои тренировки
            </Button>
          </Group>

          {enrollments.length === 0 ? (
            <Card shadow="sm" padding="xl" radius="md" withBorder>
              <Center>
                <Stack align="center" gap="md">
                  <IconUserPlus size={48} style={{ opacity: 0.5 }} />
                  <Text size="lg" c="dimmed">Нет ожидающих заявок</Text>
                  <Text size="sm" c="dimmed">
                    Здесь будут отображаться заявки от пользователей на ваши тренировки
                  </Text>
                </Stack>
              </Center>
            </Card>
          ) : (
            <Stack gap="md">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="md">
                    <Group justify="space-between" align="flex-start">
                      <Stack gap="sm" style={{ flex: 1 }}>
                        <Group justify="space-between">
                          <Title order={3}>{enrollment.trainingSessionName}</Title>
                          <Badge color="yellow">
                            На рассмотрении
                          </Badge>
                        </Group>
                        
                        <Group gap="md">
                          <Group gap="xs">
                            <IconCalendarEvent size={16} />
                            <Text size="sm">
                              Заявка от: {format(parseBackendDate(enrollment.enrollmentTime), 'd MMMM yyyy, HH:mm', { locale: ru })}
                            </Text>
                          </Group>
                          <Group gap="xs">
                            <IconUsers size={16} />
                            <Text size="sm">
                              Пользователь: {enrollment.username}
                            </Text>
                          </Group>
                        </Group>
                      </Stack>
                    </Group>

                    <Divider />

                    <Group justify="space-between">
                      <ActionIcon
                        variant="light"
                        loading={loadingSession}
                        onClick={() => handleViewSessionDetails(enrollment.trainingSessionId)}
                      >
                        <IconEye size={16} />
                      </ActionIcon>

                      <Group gap="xs">
                        <Button
                          variant="light"
                          color="red"
                          leftSection={<IconX size={16} />}
                          loading={processing === enrollment.id}
                          onClick={() => handleRejectEnrollment(enrollment.id)}
                        >
                          Отклонить
                        </Button>
                        <Button
                          variant="light"
                          color="green"
                          leftSection={<IconCheck size={16} />}
                          loading={processing === enrollment.id}
                          onClick={() => handleApproveEnrollment(enrollment.id)}
                        >
                          Одобрить
                        </Button>
                      </Group>
                    </Group>
                  </Stack>
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
              
              <Group gap="xs">
                <IconMapPin size={16} />
                <Text>{selectedSession.gymRoom.name}</Text>
              </Group>
              
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
                      <Group gap="xs">
                        <Badge variant="light" color="blue" size="sm">
                          {fullExercise.approachDto.approachesCount} подходов × {fullExercise.approachDto.repetitionPerApproachCount} повторений
                        </Badge>
                        {fullExercise.trainMachineDto && (
                          <Badge variant="light" color="pink" size="sm">
                            {fullExercise.trainMachineDto.name}
                          </Badge>
                        )}
                      </Group>
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