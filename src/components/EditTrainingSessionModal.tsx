import { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Button,
  Group,
  Stack,
  Alert,
  LoadingOverlay
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertTriangle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { updateTrainingSession } from '../api/trainingSession';
import { hasEnrollments } from '../api/enrollment';
import { parseBackendDate } from '../utils/dateUtils';
import type { TrainingSessionDto, UpdateTrainingSessionDto } from '../types';
import { userApi } from '../api/user';
import { useAuth } from '../contexts/AuthContext';

interface EditTrainingSessionModalProps {
  opened: boolean;  
  onClose: () => void;
  session: TrainingSessionDto | null;
  onUpdate: () => void;
}

interface FormValues {
  name: string;
  description: string;
  type: 'GROUP' | 'PERSONAL';
  startDate: string;
  startTime: string;
  trainerId?: number;
  durationMinutes: number;
  maxParticipants: number;
  location: string;
}

export const EditTrainingSessionModal = ({ 
  opened, 
  onClose, 
  session, 
  onUpdate 
}: EditTrainingSessionModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingEnrollments, setCheckingEnrollments] = useState(false);
  const [hasActiveEnrollments, setHasActiveEnrollments] = useState(false);

  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      description: '',
      type: 'GROUP',
      trainerId: user?.id,
      startDate: '',
      startTime: '',
      durationMinutes: 60,
      maxParticipants: 10,
      location: ''
    },
    validate: {
      name: (value) => (!value ? 'Название обязательно' : null),
      startDate: (value) => (!value ? 'Дата начала обязательна' : null),
      startTime: (value) => (!value ? 'Время начала обязательно' : null),
      durationMinutes: (value) => (
        !value || value < 1 ? 'Длительность должна быть минимум 1 минута' : null
      ),
      maxParticipants: (value, values) => (
        values.type === 'GROUP' && (!value || value < 1) 
          ? 'Максимальное количество участников должно быть минимум 1' : null
      ),
    },
  });

  const checkEnrollments = async (sessionId: number) => {
    setCheckingEnrollments(true);
    try {
      const hasEnrolls = await hasEnrollments(sessionId);
      setHasActiveEnrollments(hasEnrolls);
    } catch (error) {
      console.error('Error checking enrollments:', error);
      setHasActiveEnrollments(false);
    } finally {
      setCheckingEnrollments(false);
    }
  };

  useEffect(() => {
    if (session && opened) {
      const startDate = parseBackendDate(session.startTime);
      
      form.setValues({
        name: session.name || '',
        description: session.description || '',
        type: session.type || 'GROUP',
        startDate: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().substring(0, 5),
        trainerId: user?.id,
        durationMinutes: session.durationMinutes || 60,
        maxParticipants: session.maxParticipants || 10,
        location: session.location || ''
      });
      
      checkEnrollments(session.id);
    }
  }, [session, opened]);

  const handleSubmit = async (values: FormValues) => {
    if (!session) return;

    if (hasActiveEnrollments) {
      notifications.show({
        title: 'Невозможно изменить',
        message: 'На тренировку уже записаны участники. Редактирование невозможно.',
        color: 'orange',
        icon: <IconAlertTriangle size={18} />,
      });
      return;
    }

    setLoading(true);
    try {
      const [hours, minutes] = values.startTime.split(':').map(Number);
      const date = new Date(values.startDate);
      
      const startDateTime = new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hours,
        minutes,
        0,
        0
      ));

      const formattedData: UpdateTrainingSessionDto = {
        name: values.name,
        description: values.description,
        type: values.type,
        startTime: startDateTime.toISOString(),
        trainerId: values.trainerId,
        durationMinutes: values.durationMinutes,
        maxParticipants: values.type === 'PERSONAL' ? undefined : values.maxParticipants,
        location: values.location
      };

      await updateTrainingSession(session.id, formattedData);
      
      notifications.show({
        title: 'Успешно',
        message: 'Тренировка обновлена',
        color: 'green',
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating training session:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось обновить тренировку',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setHasActiveEnrollments(false);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Редактировать тренировку"
      size="lg"
      centered
    >
      <LoadingOverlay visible={checkingEnrollments} />
      
      {hasActiveEnrollments && (
        <Alert 
          icon={<IconAlertTriangle size={16} />} 
          color="orange" 
          mb="md"
          title="Внимание!"
        >
          На эту тренировку уже записаны участники. Редактирование и удаление недоступны.
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Название тренировки"
            placeholder="Введите название"
            required
            disabled={hasActiveEnrollments}
            {...form.getInputProps('name')}
          />

          <Textarea
            label="Описание"
            placeholder="Описание тренировки (необязательно)"
            disabled={hasActiveEnrollments}
            {...form.getInputProps('description')}
          />

          <Select
            label="Тип тренировки"
            required
            disabled={hasActiveEnrollments}
            data={[
              { value: 'GROUP', label: 'Групповая' },
              { value: 'PERSONAL', label: 'Персональная' },
            ]}
            {...form.getInputProps('type')}
          />

          <Group grow>
            <TextInput
              label="Дата начала"
              placeholder="Выберите дату"
              required
              type="date"
              disabled={hasActiveEnrollments}
              min={new Date().toISOString().split('T')[0]}
              {...form.getInputProps('startDate')}
            />
            <TextInput
              label="Время начала"
              placeholder="Выберите время"
              required
              type="time"
              disabled={hasActiveEnrollments}
              {...form.getInputProps('startTime')}
            />
          </Group>

          <NumberInput
            label="Длительность (минуты)"
            placeholder="60"
            required
            min={1}
            max={480}
            disabled={hasActiveEnrollments}
            {...form.getInputProps('durationMinutes')}
          />

          {form.values.type === 'GROUP' && (
            <NumberInput
              label="Максимальное количество участников"
              placeholder="10"
              required
              min={1}
              max={100}
              disabled={hasActiveEnrollments}
              {...form.getInputProps('maxParticipants')}
            />
          )}

          <TextInput
            label="Место проведения"
            placeholder="Зал, адрес"
            disabled={hasActiveEnrollments}
            {...form.getInputProps('location')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose}>
              Отмена
            </Button>
            <Button 
              type="submit" 
              loading={loading}
              disabled={hasActiveEnrollments}
            >
              Сохранить изменения
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}; 