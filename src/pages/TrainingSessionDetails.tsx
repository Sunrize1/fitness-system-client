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
  ActionIcon,
  Paper
} from '@mantine/core';
import { 
  IconArrowLeft, 
  IconUsers, 
  IconClock, 
  IconMapPin, 
  IconCalendarEvent,
  IconEdit,
  IconTrash
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTrainingSession, deleteTrainingSession } from '../api/trainingSession';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components';
import type { TrainingSessionDto } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { parseBackendDate } from '../utils/dateUtils';
import { notifications } from '@mantine/notifications';

export const TrainingSessionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState<TrainingSessionDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSession(parseInt(id));
    }
  }, [id]);

  const fetchSession = async (sessionId: number) => {
    try {
      setLoading(true);
      const data = await getTrainingSession(sessionId);
      setSession(data);
    } catch (error) {
      console.error('Ошибка загрузки тренировки:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось загрузить данные тренировки',
        color: 'red',
      });
      navigate('/my-training-sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!session || !id) return;

    if (window.confirm('Вы уверены, что хотите удалить эту тренировку?')) {
      try {
        await deleteTrainingSession(session.id);
        notifications.show({
          title: 'Успешно',
          message: 'Тренировка удалена',
          color: 'green',
        });
        navigate('/my-training-sessions');
      } catch (error) {
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось удалить тренировку',
          color: 'red',
        });
      }
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'GROUP' ? 'blue' : 'green';
  };

  const getTypeLabel = (type: string) => {
    return type === 'GROUP' ? 'Групповая' : 'Персональная';
  };

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

  if (!session) {
    return (
      <Layout>
        <Container size="md" py="xl">
          <Center>
            <Text>Тренировка не найдена</Text>
          </Center>
        </Container>
      </Layout>
    );
  }

  const isOwner = user?.id === session.trainer.id;

  return (
    <Layout>
      <Container size="md" py="xl">
        <Stack gap="xl">
          <Group>
            <ActionIcon
              variant="light"
              onClick={() => navigate('/my-training-sessions')}
            >
              <IconArrowLeft size={16} />
            </ActionIcon>
            <Title order={1}>Детали тренировки</Title>
          </Group>

          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Stack gap="lg">
              <Group justify="space-between">
                <div>
                  <Title order={2}>{session.name}</Title>
                  <Badge color={getTypeColor(session.type)} mt="xs">
                    {getTypeLabel(session.type)}
                  </Badge>
                </div>
                {isOwner && (
                  <Group>
                    <Button
                      variant="light"
                      leftSection={<IconEdit size={16} />}
                      onClick={() => navigate(`/edit-training-session/${session.id}`)}
                    >
                      Редактировать
                    </Button>
                    <Button
                      variant="light"
                      color="red"
                      leftSection={<IconTrash size={16} />}
                      onClick={handleDelete}
                    >
                      Удалить
                    </Button>
                  </Group>
                )}
              </Group>

              {session.description && (
                <Paper p="md"  radius="md">
                  <Text>{session.description}</Text>
                </Paper>
              )}

              <Stack gap="md">
                <Title order={3}>Информация о тренировке</Title>
                
                <Group gap="md">
                  <Group gap="xs">
                    <IconCalendarEvent size={20} />
                    <Text fw={500}>Дата и время:</Text>
                  </Group>
                  <Text>
                    {format(parseBackendDate(session.startTime), 'd MMMM yyyy, HH:mm', { locale: ru })} - 
                    {format(parseBackendDate(session.endTime), ' HH:mm')}
                  </Text>
                </Group>

                <Group gap="md">
                  <Group gap="xs">
                    <IconClock size={20} />
                    <Text fw={500}>Длительность:</Text>
                  </Group>
                  <Text>{session.durationMinutes} минут</Text>
                </Group>

                {session.location && (
                  <Group gap="md">
                    <Group gap="xs">
                      <IconMapPin size={20} />
                      <Text fw={500}>Место проведения:</Text>
                    </Group>
                    <Text>{session.location}</Text>
                  </Group>
                )}

                <Group gap="md">
                  <Group gap="xs">
                    <IconUsers size={20} />
                    <Text fw={500}>Участники:</Text>
                  </Group>
                  <Text>
                    {session.currentParticipants} из {session.maxParticipants || '∞'}
                    {session.isFull && (
                      <Badge color="red" ml="xs" size="sm">
                        Мест нет
                      </Badge>
                    )}
                  </Text>
                </Group>

                <Group gap="md">
                  <Text fw={500}>Тренер:</Text>
                  <Text>
                    {session.trainer.firstname} {session.trainer.lastname}
                  </Text>
                </Group>
              </Stack>

              {session.fullExercises && session.fullExercises.length > 0 && (
                <Stack gap="md">
                  <Title order={3}>Программа тренировки</Title>
                  <Stack gap="sm">
                    {session.fullExercises.map((fullExercise, index) => (
                      <Card key={fullExercise.id} shadow="xs" padding="md" radius="md" withBorder>
                        <Stack gap="xs">
                          <Group justify="space-between">
                            <Text fw={500}>
                              {index + 1}. {fullExercise.exerciseDto.title}
                            </Text>
                            <Badge variant="light">
                              {fullExercise.approachDto.approachesCount} × {fullExercise.approachDto.repetitionPerApproachCount}
                            </Badge>
                          </Group>
                          {fullExercise.exerciseDto.description && (
                            <Text size="sm" c="dimmed">
                              {fullExercise.exerciseDto.description}
                            </Text>
                          )}
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </Stack>
              )}

              <Paper p="md" radius="md">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Создано: {format(parseBackendDate(session.createdAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Обновлено: {format(parseBackendDate(session.updatedAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
                  </Text>
                </Group>
              </Paper>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Layout>
  );
}; 