import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Title,
  Stack,
  Card,
  Text,
  Group,
  Badge,
  ActionIcon,
  Button,
  Modal,
  Box,
  Paper,
  Grid,
  ScrollArea,
  Center
} from '@mantine/core';
import { 
  IconChevronLeft, 
  IconChevronRight, 
  IconCalendarEvent,
  IconClock,
  IconMapPin,
  IconUsers,
  IconUserPlus
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { getTrainingSessions } from '../api/trainingSession';
import { enrollToSession } from '../api/enrollment';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components';
import type { TrainingSessionDto } from '../types';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  addWeeks, 
  subWeeks, 
  eachDayOfInterval,
  isSameDay,
  getHours,
  getMinutes
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { parseBackendDate } from '../utils/dateUtils';
import { notifications } from '@mantine/notifications';

interface CalendarEvent {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
  type: 'GROUP' | 'PERSONAL';
  session: TrainingSessionDto;
}

export const AvailableTrainingSessions: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<TrainingSessionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState<number | null>(null);
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [selectedSession, setSelectedSession] = useState<TrainingSessionDto | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const hours = Array.from({ length: 17 }, (_, i) => i + 6);

  const fetchTrainingSessions = async (week: Date) => {
    setLoading(true);
    try {
      const weekStart = startOfWeek(week, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(week, { weekStartsOn: 0 });
      
      const data = await getTrainingSessions({
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
        size: 100
      });
      
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Ошибка загрузки тренировок:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingSessions(currentWeek);
  }, [currentWeek]);

  const getWeekDays = () => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
    return eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(weekStart, { weekStartsOn: 0 })
    });
  };

  const allEvents = useMemo(() => {
    return sessions.map(session => ({
      id: session.id,
      title: session.name,
      startTime: parseBackendDate(session.startTime),
      endTime: parseBackendDate(session.endTime),
      type: session.type,
      session
    }));
  }, [sessions]);

  const getEventsForDay = (day: Date): CalendarEvent[] => {
    return allEvents.filter(event => isSameDay(event.startTime, day));
  };

  const getTypeColor = (type: string) => {
    return type === 'GROUP' 
      ? 'linear-gradient(135deg, var(--mantine-color-blue-5), var(--mantine-color-blue-6))' 
      : 'linear-gradient(135deg, var(--mantine-color-green-5), var(--mantine-color-green-6))';
  };

  const getTypeLabel = (type: string) => {
    return type === 'GROUP' ? 'Групповая' : 'Персональная';
  };

  const handleEnrollment = async (sessionId: number) => {
    if (!user) return;
    
    setEnrolling(sessionId);
    try {
      await enrollToSession(sessionId);
      notifications.show({
        title: 'Успешно',
        message: 'Вы записались на тренировку',
        color: 'green',
      });
      await fetchTrainingSessions(currentWeek);
      setSelectedSession(null);
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось записаться на тренировку',
        color: 'red',
      });
    } finally {
      setEnrolling(null);
    }
  };

  const weekDays = getWeekDays();
  const dayLabels = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  if (!user || user.userRole === 'TRAINER') {
    return (
      <Layout>
        <Container size="md" py="xl">
          <Center>
            <Stack align="center" gap="md">
              <Title order={2}>Доступ запрещен</Title>
              <Text>Эта страница доступна только для записи пользователей на тренировки</Text>
              <Button onClick={() => navigate('/profile')}>
                Вернуться к профилю
              </Button>
            </Stack>
          </Center>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container size="xl" py="md">
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={1}>Доступные тренировки</Title>
            <Group>
              <ActionIcon
                variant="light"
                size="lg"
                onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                disabled={loading}
              >
                <IconChevronLeft size={18} />
              </ActionIcon>
              <Paper p="sm" withBorder radius="md">
                <Text fw={500} size="lg" style={{ minWidth: '220px', textAlign: 'center' }}>
                  {format(weekDays[0], 'd MMMM', { locale: ru })} - {format(weekDays[6], 'd MMMM yyyy', { locale: ru })}
                </Text>
              </Paper>
              <ActionIcon
                variant="light"
                size="lg"
                onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                disabled={loading}
              >
                <IconChevronRight size={18} />
              </ActionIcon>
            </Group>
            <Button
              variant="light"
              leftSection={<IconCalendarEvent size={16} />}
              onClick={() => navigate('/my-enrollments')}
            >
              Мои записи
            </Button>
          </Group>

          <Card shadow="sm" padding="md" radius="md" withBorder>
            <ScrollArea h={600}>
              <Box style={{ minWidth: '800px' }}>
                <Grid gutter={0} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                  <Grid.Col span={1}>
                    <Box p="sm" h={50}></Box>
                  </Grid.Col>
                  {weekDays.map((day, index) => (
                    <Grid.Col key={day.toISOString()} span={11/7}>
                      <Box 
                        p="sm" 
                        ta="center" 
                        h={50} 
                        style={{ 
                          borderLeft: index > 0 ? '1px solid var(--mantine-color-default-border)' : 'none',
                          backgroundColor: 'var(--mantine-color-body)'
                        }}
                      >
                        <Text size="sm" c="dimmed">{dayLabels[index]}</Text>
                        <Text fw={500}>{format(day, 'd')}</Text>
                      </Box>
                    </Grid.Col>
                  ))}
                </Grid>

                 <Box style={{ position: 'relative' }}>
                   {hours.map((hour) => (
                     <Grid key={hour} gutter={0} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                       <Grid.Col span={1}>
                         <Box 
                           p="sm" 
                           h={60} 
                           style={{ 
                             borderRight: '1px solid var(--mantine-color-default-border)',
                             backgroundColor: 'var(--mantine-color-body)'
                           }}
                         >
                           <Text size="sm" c="dimmed">
                             {hour.toString().padStart(2, '0')}:00
                           </Text>
                         </Box>
                       </Grid.Col>
                       {weekDays.map((day, dayIndex) => {
                         const events = getEventsForDay(day);
                         return (
                           <Grid.Col key={`${day.toISOString()}-${hour}`} span={11/7}>
                             <Box 
                               h={60} 
                               style={{ 
                                 borderLeft: dayIndex > 0 ? '1px solid var(--mantine-color-default-border)' : 'none',
                                 position: 'relative',
                                 backgroundColor: hour % 2 === 0 ? 'var(--mantine-color-default)' : 'transparent'
                               }}
                             >
                               {events.map((event) => {
                                 const eventStartHour = getHours(event.startTime);
                                 const eventEndHour = getHours(event.endTime);
                                 const eventStartMinute = getMinutes(event.startTime);
                                 const eventEndMinute = getMinutes(event.endTime);
                                 
                                 if (eventStartHour <= hour && (eventEndHour > hour || (eventEndHour === hour && eventEndMinute > 0))) {
                                   const startMinute = hour === eventStartHour ? getMinutes(event.startTime) : 0;
                                   const endMinute = hour === eventEndHour ? getMinutes(event.endTime) : 60;
                                   
                                   const top = (startMinute / 60) * 60;
                                   const height = ((endMinute - startMinute) / 60) * 60;
                                   
                                   return (
                                     <Box
                                       key={`${event.id}-${hour}`}
                                       style={{
                                         position: 'absolute',
                                         top: `${top}px`,
                                         left: '2px',
                                         right: '2px',
                                         height: `${Math.max(height, 20)}px`,
                                         background: getTypeColor(event.type),
                                         color: 'white',
                                         borderRadius: '6px',
                                         padding: '4px 6px',
                                         cursor: 'pointer',
                                         zIndex: 10,
                                         fontSize: '11px',
                                         overflow: 'hidden',
                                         display: 'flex',
                                         flexDirection: 'column',
                                         justifyContent: 'center',
                                         boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                         border: '1px solid rgba(255, 255, 255, 0.2)',
                                         transition: 'transform 0.1s ease'
                                       }}
                                       onMouseEnter={(e) => {
                                         e.currentTarget.style.transform = 'scale(1.02)';
                                       }}
                                       onMouseLeave={(e) => {
                                         e.currentTarget.style.transform = 'scale(1)';
                                       }}
                                       onClick={() => {
                                         setSelectedSession(event.session);
                                         setModalOpened(true);
                                       }}
                                     >
                                       {hour === eventStartHour && (
                                         <>
                                           <Text size="xs" fw={500} style={{ color: 'white', lineHeight: 1.1 }}>
                                             {event.title}
                                           </Text>
                                           <Text size="xs" style={{ color: 'white', opacity: 0.9, lineHeight: 1 }}>
                                             {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
                                           </Text>
                                         </>
                                       )}
                                     </Box>
                                   );
                                 }
                                 return null;
                               })}
                             </Box>
                           </Grid.Col>
                         );
                       })}
                     </Grid>
                   ))}
                 </Box>
              </Box>
            </ScrollArea>
          </Card>
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
            
            <Group justify="flex-end" mt="md">
              <Button
                variant="filled"
                leftSection={<IconUserPlus size={16} />}
                loading={enrolling === selectedSession.id}
                disabled={selectedSession.isFull}
                onClick={() => handleEnrollment(selectedSession.id)}
              >
                {selectedSession.isFull ? 'Мест нет' : 'Записаться'}
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Layout>
  );
}; 