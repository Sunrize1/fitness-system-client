import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Button,
  TextInput,
  NumberInput,
  Select,
  Textarea,
  ThemeIcon,
  rem,
  Stepper,
  Box,
} from '@mantine/core';

import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { IconCheck, IconX, IconCalendar, IconUsers, IconMapPin, IconBarbell } from '@tabler/icons-react';
import { Layout, TrainingSessionExerciseManager } from '../components';
import { createTrainingSession } from '../api/trainingSession';
import { gymRoomApi } from '../api/gymRoom';
import { assignEnrollmentToUser } from '../api/enrollment';
import { userApi } from '../api/user';
import type { CreateTrainingSessionDto, TrainingSessionDto, GymRoomDto, UserDto } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const CreateTrainingSession: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [createdTrainingSession, setCreatedTrainingSession] = useState<TrainingSessionDto | null>(null);
  const [gymRooms, setGymRooms] = useState<GymRoomDto[]>([]);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loadingGymRooms, setLoadingGymRooms] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const [formData, setFormData] = useState<Omit<CreateTrainingSessionDto, 'startTime'> & { 
    startDate: Date | null;
    startTime: string;
    selectedUserId?: number;
  }>({
    name: '',
    description: '',
    type: 'GROUP',
    startDate: null,
    startTime: '',
    trainerId: user?.id,
    durationMinutes: 60,
    maxParticipants: 10,
    gymRoomId: 0,
    selectedUserId: undefined,
  });

  useEffect(() => {
    const fetchGymRooms = async () => {
      setLoadingGymRooms(true);
      try {
        const response = await gymRoomApi.getAllGymRooms();
        setGymRooms(response.gymRooms);
      } catch (error) {
        notifications.show({
          color: 'red',
          title: 'Ошибка',
          message: 'Не удалось загрузить залы',
          icon: <IconX size={18} />,
        });
      } finally {
        setLoadingGymRooms(false);
      }
    };

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await userApi.getAllUsers();
        setUsers(response.users.filter(u => u.userRole === 'DEFAULT_USER'));
      } catch (error) {
        notifications.show({
          color: 'red',
          title: 'Ошибка',
          message: 'Не удалось загрузить пользователей',
          icon: <IconX size={18} />,
        });
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchGymRooms();
    fetchUsers();
  }, []);

  const handleInputChange = (field: keyof typeof formData) => (value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.startDate || !formData.startTime || !formData.durationMinutes || !formData.gymRoomId) {
      notifications.show({
        color: 'red',
        title: 'Ошибка валидации',
        message: 'Пожалуйста, заполните все обязательные поля',
        icon: <IconX size={18} />,
      });
      return;
    }

    if (formData.type === 'PERSONAL' && !formData.selectedUserId) {
      notifications.show({
        color: 'red',
        title: 'Ошибка валидации',
        message: 'Для персональной тренировки необходимо выбрать клиента',
        icon: <IconX size={18} />,
      });
      return;
    }

    if (formData.durationMinutes < 1) {
      notifications.show({
        color: 'red',
        title: 'Ошибка валидации',
        message: 'Продолжительность должна быть больше 0 минут',
        icon: <IconX size={18} />,
      });
      return;
    }

    if (formData.type === 'GROUP' && formData.maxParticipants && formData.maxParticipants < 1) {
      notifications.show({
        color: 'red',
        title: 'Ошибка валидации',
        message: 'Максимальное количество участников должно быть больше 0',
        icon: <IconX size={18} />,
      });
      return;
    }

    setLoading(true);
    try {
      const [hours, minutes] = formData.startTime.split(':').map(Number);
      const date = formData.startDate!;
      
      const startDateTime = new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hours,
        minutes,
        0,
        0
      ));

      const sessionData: CreateTrainingSessionDto = {
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        trainerId: formData.trainerId,
        startTime: startDateTime.toISOString(),
        durationMinutes: formData.durationMinutes,
        maxParticipants: formData.type === 'GROUP' ? formData.maxParticipants : undefined,
        gymRoomId: formData.gymRoomId,
      };

      const createdSession = await createTrainingSession(sessionData);
      setCreatedTrainingSession(createdSession);

      // Если это персональная тренировка, автоматически записываем выбранного пользователя
      if (formData.type === 'PERSONAL' && formData.selectedUserId) {
        try {
          await assignEnrollmentToUser(createdSession.id, formData.selectedUserId);
          notifications.show({
            color: 'green',
            title: 'Тренировка создана',
            message: 'Персональная тренировка создана и клиент записан!',
            icon: <IconCheck size={18} />,
          });
        } catch (enrollmentError) {
          notifications.show({
            color: 'orange',
            title: 'Тренировка создана',
            message: 'Тренировка создана, но не удалось записать клиента',
            icon: <IconCheck size={18} />,
          });
        }
      } else {
        notifications.show({
          color: 'green',
          title: 'Тренировка создана',
          message: 'Теперь добавьте упражнения в тренировку',
          icon: <IconCheck size={18} />,
        });
      }
      
      setCurrentStep(1);
    } catch (error: any) {
      notifications.show({
        color: 'red',
        title: 'Ошибка создания',
        message: error.response?.data?.message || 'Не удалось создать тренировку',
        icon: <IconX size={18} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setCurrentStep(0);
  };

  const handleTrainingSessionUpdate = (updatedSession: TrainingSessionDto) => {
    setCreatedTrainingSession(updatedSession);
  };

  const handleFinish = () => {
    notifications.show({
      color: 'green',
      title: 'Тренировка готова',
      message: 'Тренировка успешно создана и настроена!',
      icon: <IconCheck size={18} />,
    });
    navigate('/profile');
  };

  return (
    <Layout>
      <Container size="xl">
        <Stack gap="xl">
          <Paper shadow="sm" p="xl" radius="md">
            <Stack gap="lg">
              <Group justify="space-between" align="center">
                <div>
                  <Title order={2} mb="xs">
                    {currentStep === 0 ? 'Создание тренировки' : 'Добавление упражнений'}
                  </Title>
                  <Text c="dimmed">
                    {currentStep === 0 
                      ? 'Заполните форму для создания новой тренировки'
                      : 'Перетащите упражнения в тренировку'
                    }
                  </Text>
                </div>
                <ThemeIcon size="xl" variant="light" color={currentStep === 0 ? "blue" : "green"}>
                  {currentStep === 0 
                    ? <IconCalendar style={{ width: rem(24), height: rem(24) }} />
                    : <IconBarbell style={{ width: rem(24), height: rem(24) }} />
                  }
                </ThemeIcon>
              </Group>

              <Stepper active={currentStep} onStepClick={undefined}>
                <Stepper.Step 
                  label="Создание тренировки" 
                  description="Основная информация"
                  completedIcon={<IconCheck style={{ width: rem(18), height: rem(18) }} />}
                />
                <Stepper.Step 
                  label="Добавление упражнений" 
                  description="Drag & Drop упражнений"
                  completedIcon={<IconBarbell style={{ width: rem(18), height: rem(18) }} />}
                />
              </Stepper>

              {currentStep === 0 && (
                <Box mt="xl">
                  <Stack gap="md">
                    <TextInput
                      label="Название тренировки"
                      placeholder="Введите название тренировки"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name')(e.target.value)}
                    />

                    <Textarea
                      label="Описание"
                      placeholder="Опишите тренировку (необязательно)"
                      minRows={3}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description')(e.target.value)}
                    />

                    <Select
                      label="Тип тренировки"
                      placeholder="Выберите тип тренировки"
                      required
                      data={[
                        { value: 'GROUP', label: 'Групповая' },
                        { value: 'PERSONAL', label: 'Персональная' },
                      ]}
                      value={formData.type}
                      onChange={(value) => handleInputChange('type')(value)}
                    />

                    <Select
                      label="Зал"
                      placeholder="Выберите зал"
                      required
                      data={gymRooms.map(room => ({ 
                        value: room.id.toString(), 
                        label: room.name 
                      }))}
                      value={formData.gymRoomId ? formData.gymRoomId.toString() : ''}
                      onChange={(value) => handleInputChange('gymRoomId')(value ? parseInt(value) : 0)}
                      disabled={loadingGymRooms}
                    />

                    {formData.type === 'PERSONAL' && (
                      <Select
                        label="Клиент"
                        placeholder="Выберите клиента для персональной тренировки"
                        required
                        data={users.map(user => ({ 
                          value: user.id.toString(), 
                          label: `${user.firstname} ${user.lastname} (${user.username})` 
                        }))}
                        value={formData.selectedUserId ? formData.selectedUserId.toString() : ''}
                        onChange={(value) => handleInputChange('selectedUserId')(value ? parseInt(value) : undefined)}
                        disabled={loadingUsers}
                        leftSection={<IconUsers size={16} />}
                      />
                    )}

                    <Group grow>
                      <TextInput
                        label="Дата начала"
                        placeholder="Выберите дату"
                        required
                        type="date"
                        value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
                        onChange={(event) => {
                          const dateValue = event.target.value;
                          handleInputChange('startDate')(dateValue ? new Date(dateValue) : null);
                        }}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <TextInput
                        label="Время начала"
                        placeholder="Выберите время"
                        required
                        type="time"
                        value={formData.startTime}
                        onChange={(event) => handleInputChange('startTime')(event.target.value)}
                      />
                    </Group>

                    <Group grow>
                      <NumberInput
                        label="Продолжительность (минуты)"
                        placeholder="60"
                        required
                        min={1}
                        max={600}
                        value={formData.durationMinutes}
                        onChange={(value) => handleInputChange('durationMinutes')(value)}
                      />

                      {formData.type === 'GROUP' && (
                        <NumberInput
                          label="Максимум участников"
                          placeholder="10"
                          min={1}
                          max={100}
                          value={formData.maxParticipants}
                          onChange={(value) => handleInputChange('maxParticipants')(value)}
                          leftSection={<IconUsers size={16} />}
                        />
                      )}
                    </Group>
                  </Stack>

                  <Group justify="space-between" mt="xl">
                    <Button
                      variant="subtle"
                      onClick={() => navigate(-1)}
                      disabled={loading}
                    >
                      Отмена
                    </Button>
                    
                    <Button
                      onClick={handleSubmit}
                      loading={loading}
                      leftSection={!loading ? <IconCheck size={16} /> : undefined}
                    >
                      Создать тренировку
                    </Button>
                  </Group>
                </Box>
              )}
            </Stack>
          </Paper>

          {currentStep === 1 && createdTrainingSession && (
            <Paper shadow="sm" p="lg" radius="md">
              <Stack gap="lg">
                <Group justify="space-between">
                  <Text size="lg" fw={600}>
                    Шаг 2: Добавление упражнений
                  </Text>
                  <Button
                    color="green"
                    leftSection={<IconCheck size={16} />}
                    onClick={handleFinish}
                  >
                    Завершить создание
                  </Button>
                </Group>
                
                <TrainingSessionExerciseManager
                  trainingSession={createdTrainingSession}
                  onBack={handleBackToForm}
                  onTrainingSessionUpdate={handleTrainingSessionUpdate}
                />
              </Stack>
            </Paper>
          )}
        </Stack>
      </Container>
    </Layout>
  );
}; 