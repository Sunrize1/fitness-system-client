import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Button,
  SimpleGrid,
  Card,
  Loader,
  ThemeIcon,
  Flex,
  Box,
  Badge,
  ActionIcon,
  useComputedColorScheme,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconBarbell, IconTrash, IconArrowLeft, IconBrandDatabricks } from '@tabler/icons-react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { getFullExercises } from '../api/exercise';
import {detachFullExercise } from '../api/trainingSession';
import {attachFullExercise} from '../api/trainingSession';
import type { TrainingSessionDto, FullExerciseDto } from '../types';
import { useDraggable } from '@dnd-kit/core';

interface TrainingSessionExerciseManagerProps {
  trainingSession: TrainingSessionDto;
  onBack: () => void;
  onTrainingSessionUpdate: (updatedSession: TrainingSessionDto) => void;
}

export const TrainingSessionExerciseManager: React.FC<TrainingSessionExerciseManagerProps> = ({
  trainingSession,
  onBack,
  onTrainingSessionUpdate,
}) => {

  const [fullExercises, setFullExercises] = useState<FullExerciseDto[]>([]);
  const [loading, setLoading] = useState(false);


  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<any | null>(null);

  const fetchFullExercises = async () => {
    setLoading(true);
    try {
      const data = await getFullExercises();
      setFullExercises(data);
    } catch (error) {
      notifications.show({
        color: 'red',
        title: 'Ошибка загрузки',
        message: 'Не удалось загрузить упражнения',
        icon: <IconX size={18} />,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFullExercises();
  }, []);


  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
    setActiveItem(event.active.data.current);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    setActiveId(null);
    setActiveItem(null);

    if (!active || !over) {
      return;
    }


    if (active.id.startsWith('full-exercise-') && over.id === 'training-session-dropzone') {
      const fullExerciseId = parseInt(active.id.replace('full-exercise-', ''));
      await handleAttachFullExercise(fullExerciseId);
    }
  };

  const handleAttachFullExercise = async (fullExerciseId: number) => {

    if (trainingSession.fullExercises.some(fe => fe.id === fullExerciseId)) {
      notifications.show({
        color: 'orange',
        title: 'Упражнение уже добавлено',
        message: 'Это упражнение уже есть в тренировке',
        icon: <IconX size={18} />,
      });
      return;
    }

    try {
      await attachFullExercise(trainingSession.id, [fullExerciseId]);
      
      const fullExercise = fullExercises.find(fe => fe.id === fullExerciseId);
      if (fullExercise) {
        const updatedSession = {
          ...trainingSession,
          fullExercises: [...trainingSession.fullExercises, fullExercise],
        };
        onTrainingSessionUpdate(updatedSession);
      }

      notifications.show({
        color: 'green',
        title: 'Упражнение добавлено',
        message: 'Упражнение успешно добавлено в тренировку',
        icon: <IconCheck size={18} />,
      });
    } catch (error) {
      notifications.show({
        color: 'red',
        title: 'Ошибка',
        message: 'Не удалось добавить упражнение в тренировку',
        icon: <IconX size={18} />,
      });
    }
  };

  const handleDetachFullExercise = async (fullExerciseId: number) => {
    try {
      await detachFullExercise(trainingSession.id, fullExerciseId);
      
      const updatedSession = {
        ...trainingSession,
        fullExercises: trainingSession.fullExercises.filter(fe => fe.id !== fullExerciseId),
      };
      onTrainingSessionUpdate(updatedSession);

      notifications.show({
        color: 'green',
        title: 'Упражнение удалено',
        message: 'Упражнение успешно удалено из тренировки',
        icon: <IconCheck size={18} />,
      });
    } catch (error) {
      notifications.show({
        color: 'red',
        title: 'Ошибка',
        message: 'Не удалось удалить упражнение из тренировки',
        icon: <IconX size={18} />,
      });
    }
  };


  const availableFullExercises = fullExercises.filter(
    fe => !trainingSession.fullExercises.some(tfe => tfe.id === fe.id) &&
          (!fe.trainMachineDto || fe.trainMachineDto.gymRoomId === trainingSession.gymRoom.id)
  );

  if (loading) {
    return (
      <Container size="xl">
        <Flex justify="center" align="center" style={{ height: '50vh' }}>
          <Loader size="xl" />
        </Flex>
      </Container>
    );
  }

  return (
    <Container size="xl" w="100%">
      <Stack gap="xl">
        <Group justify="space-between">
          <div>
            <Group>
              <Button
                variant="subtle"
                leftSection={<IconArrowLeft size={16} />}
                onClick={onBack}
              >
                Назад
              </Button>
              <Title order={2}>
                {trainingSession.name}
              </Title>
            </Group>
            <Text c="dimmed" mt="xs">
              Добавьте упражнения в тренировку перетаскиванием
            </Text>
            <Group gap="xs" mt="xs">
              <Text size="sm" c="dimmed">
                Зал: <Text span fw={500}>{trainingSession.gymRoom.name}</Text>
              </Text>
              <Text size="sm" c="dimmed">
                Тип: <Text span fw={500}>{trainingSession.type === 'GROUP' ? 'Групповая' : 'Персональная'}</Text>
              </Text>
            </Group>
          </div>
          <Group>
            <Badge size="lg" variant="light" color="blue">
              Упражнений: {trainingSession.fullExercises.length}
            </Badge>
            <Badge size="lg" variant="light" color="teal">
              Зал: {trainingSession.gymRoom.name}
            </Badge>
          </Group>
        </Group>


        <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
            {activeId && activeId.startsWith('full-exercise-') && activeItem?.fullExercise && (
              <DraggableFullExerciseCard
                fullExercise={activeItem.fullExercise}
                isOverlay={true}
              />
            )}
          </DragOverlay>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">

            <Stack>
              <Title order={4}>Доступные упражнения</Title>
              <Text size="sm" c="dimmed">
                Показаны только упражнения с тренажерами из зала "{trainingSession.gymRoom.name}"
              </Text>
              <Box style={{ maxHeight: 600, overflowY: 'auto', overflowX: 'hidden' }}>
                <Stack gap="sm">
                  {availableFullExercises.map((fullExercise) => (
                    <DraggableFullExerciseCard
                      key={fullExercise.id}
                      fullExercise={fullExercise}
                    />
                  ))}
                  {availableFullExercises.length === 0 && (
                    <Text ta="center" c="dimmed" p="xl">
                      Нет доступных упражнений для зала "{trainingSession.gymRoom.name}"
                    </Text>
                  )}
                </Stack>
              </Box>
            </Stack>


            <Stack>
              <Title order={4}>Упражнения в тренировке</Title>
              <TrainingSessionDropzone 
                trainingSession={trainingSession}
                onDetachFullExercise={handleDetachFullExercise}
              />
            </Stack>
          </SimpleGrid>
        </DndContext>
      </Stack>
    </Container>
  );
};


const TrainingSessionDropzone: React.FC<{
  trainingSession: TrainingSessionDto;
  onDetachFullExercise: (id: number) => void;
}> = ({ trainingSession, onDetachFullExercise }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'training-session-dropzone',
  });

  const computedColorScheme = useComputedColorScheme('light');
  const isDarkTheme = computedColorScheme === 'dark';
  const lightGradient = 'linear-gradient(90deg, #e7f5ff 0%, #e6fcf5 100%)';
  const darkGradient = 'linear-gradient(90deg, #1A2B3C 0%, #173330 100%)';
  const activeGradient = isDarkTheme ? darkGradient : lightGradient;

  return (
    <Paper
      ref={setNodeRef}
      p="xl"
      withBorder
      shadow="sm"
      radius="md"
      style={{
        minHeight: 300,
        background: isOver ? activeGradient : (isDarkTheme ? '#1a1b1e' : '#f8f9fa'),
        borderStyle: isOver ? 'dashed' : 'solid',
        borderColor: isOver ? '#228be6' : '#dee2e6',
        borderWidth: isOver ? '2px' : '1px',
        transition: 'all 0.3s ease',
      }}
    >
      {trainingSession.fullExercises.length === 0 ? (
        <Flex justify="center" align="center" style={{ height: 200 }}>
          <Text ta="center" c={isOver ? "blue" : "dimmed"} fw={isOver ? 600 : 400}>
            {isOver ? '📍 Отпустите упражнение здесь' : '👆 Перетащите упражнения сюда'}
          </Text>
        </Flex>
      ) : (
        <Stack gap="sm">
          {trainingSession.fullExercises.map((fullExercise) => (
            <Card key={fullExercise.id} p="md" withBorder>
              <Group justify="space-between">
                <Group>
                  <ThemeIcon color="blue" variant="light">
                    <IconBarbell size={16} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600} size="sm">
                      {fullExercise.exerciseDto.title}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {fullExercise.exerciseDto.description}
                    </Text>
                    <Group gap="xs" mt="xs">
                      <Badge size="xs" variant="light" color="teal">
                        {fullExercise.approachDto.approachesCount} подходов
                      </Badge>
                      <Badge size="xs" variant="light" color="orange">
                        {fullExercise.approachDto.repetitionPerApproachCount} повторений
                      </Badge>
                      {fullExercise.trainMachineDto && (
                        <Badge size="xs" variant="light" color="pink">
                          {fullExercise.trainMachineDto.name}
                        </Badge>
                      )}
                    </Group>
                  </div>
                </Group>
                <ActionIcon
                  color="red"
                  variant="light"
                  onClick={() => onDetachFullExercise(fullExercise.id)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Paper>
  );
};


const DraggableFullExerciseCard: React.FC<{ 
  fullExercise: FullExerciseDto; 
  isOverlay?: boolean; 
}> = ({ fullExercise, isOverlay = false }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `full-exercise-${fullExercise.id}`,
    data: { fullExercise },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging && !isOverlay ? 0.5 : 1,
  } : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={{
        ...style,
        cursor: isOverlay ? 'grabbing' : 'grab',
        transition: isOverlay ? 'none' : 'transform 0.2s',
        opacity: isOverlay ? 0.8 : isDragging ? 0.5 : 1,
        transform: isOverlay ? 'rotate(2deg)' : style?.transform,
      }}
      {...listeners}
      {...attributes}
      p="md"
      withBorder
      shadow="sm"
    >
      <Group>
        <ThemeIcon color="blue" variant="light">
          <IconBarbell size={16} />
        </ThemeIcon>
        <div style={{ flex: 1 }}>
          <Text fw={600} size="sm">
            {fullExercise.exerciseDto.title}
          </Text>
          <Text size="xs" c="dimmed">
            {fullExercise.exerciseDto.description}
          </Text>
          <Group gap="xs" mt="xs">
            <Badge size="xs" variant="light" color="teal">
              {fullExercise.approachDto.approachesCount} подходов
            </Badge>
            <Badge size="xs" variant="light" color="orange">
              {fullExercise.approachDto.repetitionPerApproachCount} повторений
            </Badge>
            {fullExercise.trainMachineDto && (
              <Badge size="xs" variant="light" color="pink">
                {fullExercise.trainMachineDto.name}
              </Badge>
            )}
          </Group>
        </div>
      </Group>
    </Card>
  );
}; 