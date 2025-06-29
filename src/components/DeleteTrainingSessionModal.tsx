import { useState, useEffect } from 'react';
import {
  Modal,
  Text,
  Button,
  Group,
  Stack,
  Alert,
  LoadingOverlay
} from '@mantine/core';
import { IconAlertTriangle, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { deleteTrainingSession } from '../api/trainingSession';
import { hasEnrollments } from '../api/enrollment';
import { parseBackendDate } from '../utils/dateUtils';
import type { TrainingSessionDto } from '../types';

interface DeleteTrainingSessionModalProps {
  opened: boolean;
  onClose: () => void;
  session: TrainingSessionDto | null;
  onDelete: () => void;
}

export const DeleteTrainingSessionModal = ({ 
  opened, 
  onClose, 
  session, 
  onDelete 
}: DeleteTrainingSessionModalProps) => {
  const [loading, setLoading] = useState(false);
  const [checkingEnrollments, setCheckingEnrollments] = useState(false);
  const [hasActiveEnrollments, setHasActiveEnrollments] = useState(false);

  const checkSessionEnrollments = async (sessionId: number) => {
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
      checkSessionEnrollments(session.id);
    }
  }, [session, opened]);

  const handleDelete = async () => {
    if (!session) return;

    if (hasActiveEnrollments) {
      notifications.show({
        title: 'Невозможно удалить',
        message: 'На тренировку уже записаны участники. Удаление невозможно.',
        color: 'orange',
        icon: <IconAlertTriangle size={18} />,
      });
      return;
    }

    setLoading(true);
    try {
      await deleteTrainingSession(session.id);
      
      notifications.show({
        title: 'Успешно',
        message: 'Тренировка удалена',
        color: 'green',
      });
      
      onDelete();
      onClose();
    } catch (error) {
      console.error('Error deleting training session:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось удалить тренировку',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setHasActiveEnrollments(false);
    onClose();
  };

  if (!session) return null;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Удалить тренировку"
      size="md"
      centered
    >
      <LoadingOverlay visible={checkingEnrollments} />
      
      <Stack gap="md">
        {hasActiveEnrollments ? (
          <Alert 
            icon={<IconAlertTriangle size={16} />} 
            color="orange"
            title="Удаление невозможно"
          >
            На эту тренировку уже записаны участники. Удаление недоступно.
          </Alert>
        ) : (
          <Alert 
            icon={<IconAlertTriangle size={16} />} 
            color="red"
            title="Внимание!"
          >
            Это действие нельзя отменить. Тренировка будет удалена безвозвратно.
          </Alert>
        )}

        <div>
          <Text size="sm" c="dimmed" mb="xs">Название тренировки:</Text>
          <Text fw={500}>{session.name}</Text>
        </div>

        <div>
          <Text size="sm" c="dimmed" mb="xs">Дата и время:</Text>
          <Text>
            {parseBackendDate(session.startTime).toLocaleDateString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })} в {parseBackendDate(session.startTime).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </div>

        <div>
          <Text size="sm" c="dimmed" mb="xs">Тип:</Text>
          <Text>{session.type === 'GROUP' ? 'Групповая' : 'Персональная'}</Text>
        </div>

        {session.currentParticipants > 0 && (
          <div>
            <Text size="sm" c="dimmed" mb="xs">Записано участников:</Text>
            <Text c="orange" fw={500}>{session.currentParticipants}</Text>
          </div>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={handleClose}>
            Отмена
          </Button>
          <Button 
            color="red"
            leftSection={<IconTrash size={16} />}
            loading={loading}
            onClick={handleDelete}
            disabled={hasActiveEnrollments}
          >
            Удалить тренировку
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}; 