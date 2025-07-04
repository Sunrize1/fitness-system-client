import React, { useEffect, useState } from 'react';
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
  SimpleGrid,
  Card,
  Divider,
  Loader,
  ThemeIcon,
  Flex,
  Box,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconBarbell, IconRepeat, IconCheck, IconX, IconRefresh, IconTrash, IconBrandDatabricks } from '@tabler/icons-react';
import {
  getExercises,
  getApproaches,
  createExercise,
  createApproach,
  createFullExercise,
  getFullExercises,
  deleteExercise,
  deleteApproach,
  deleteFullExercise,
} from '../api/exercise';
import { getTrainMachines } from '../api/trainMachine';
import type { FullExerciseDto, TrainMachineDto } from '../types';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { DraggableExerciseCard, ExerciseList } from '../components/ExerciseList';
import { ApproachList, DraggableApproachCard } from '../components/ApproachList';
import { TrainMachineList, DraggableTrainMachineCard } from '../components/TrainMachineList';
import { FullExerciseDropzone } from '../components/FullExerciseDropzone';
import { FullExerciseList } from '../components/FullExerciseList';
import { Layout } from '../components';

export const ExerciseConstructor: React.FC = () => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [approaches, setApproaches] = useState<any[]>([]);
  const [trainMachines, setTrainMachines] = useState<TrainMachineDto[]>([]);
  const [fullExercises, setFullExercises] = useState<FullExerciseDto[]>([]);
  const [exerciseTitle, setExerciseTitle] = useState('');
  const [exerciseDescription, setExerciseDescription] = useState('');
  const [approachesCount, setApproachesCount] = useState<number | undefined>(undefined);
  const [repetitionPerApproachCount, setRepetitionPerApproachCount] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [loadingExercise, setLoadingExervice] = useState(false)
  const [loadingApproach, setLoadingApproach] = useState(false)
  const [loadingTrainMachine, setLoadingTrainMachine] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);
  const [selectedApproach, setSelectedApproach] = useState<any | null>(null);
  const [selectedTrainMachine, setSelectedTrainMachine] = useState<TrainMachineDto | null>(null);
  const [creatingFull, setCreatingFull] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<any | null>(null);

  const fetchExercisesList = async () => {
    setLoadingExervice(true);
    try {
      setExercises(await getExercises());
    } catch (e) {
      setExercises([]);
    }
    setLoadingExervice(false);
  };
  const fetchApproachesList = async () => {
    setLoadingApproach(true);
    try {
      setApproaches(await getApproaches());
    } catch (e) {
      setApproaches([]);
    }
    setLoadingApproach(false);
  };

  const fetchTrainMachinesList = async () => {
    setLoadingTrainMachine(true);
    try {
      setTrainMachines(await getTrainMachines());
    } catch (e) {
      setTrainMachines([]);
    }
    setLoadingTrainMachine(false);
  };
  const fetchFullExercisesList = async () => {
    try {
      setFullExercises(await getFullExercises());
    } catch (e) {
      setFullExercises([]);
    }
  };

  useEffect(() => {
    setLoading(true)
    fetchExercisesList();
    fetchApproachesList();
    fetchTrainMachinesList();
    fetchFullExercisesList();
    setLoading(false)
  }, []);

  const handleCreateExercise = async () => {
    if (!exerciseTitle) return;
    setLoadingExervice(true);
    try {
      await createExercise(exerciseTitle, exerciseDescription);
      setExerciseTitle('');
      setExerciseDescription('');
      notifications.show({
        color: 'green',
        title: 'Упражнение создано',
        message: 'Новое упражнение успешно добавлено!',
        icon: <IconCheck size={18} />,
      });
      fetchExercisesList();
    } catch (e) {
      notifications.show({
        color: 'red',
        title: 'Ошибка',
        message: 'Не удалось создать упражнение',
        icon: <IconX size={18} />,
      });
    }
    setLoadingExervice(false);
  };

  const handleCreateApproach = async () => {
    if (!approachesCount || !repetitionPerApproachCount) return;
    setLoadingApproach(true);
    try {
      await createApproach(approachesCount, repetitionPerApproachCount);
      setApproachesCount(undefined);
      setRepetitionPerApproachCount(undefined);
      notifications.show({
        color: 'green',
        title: 'Подход создан',
        message: 'Новый подход успешно добавлен!',
        icon: <IconCheck size={18} />,
      });
      fetchApproachesList();
    } catch (e) {
      notifications.show({
        color: 'red',
        title: 'Ошибка',
        message: 'Не удалось создать подход',
        icon: <IconX size={18} />,
      });
    }
    setLoadingApproach(false);
  };

  const handleDeleteExercise = async (exerciseId: number) => {
    try {
      await deleteExercise(exerciseId);
      notifications.show({
        color: 'green',
        title: 'Упражнение удалено',
        message: 'Упражнение успешно удалено!',
        icon: <IconCheck size={18} />,
      });
      if (selectedExercise && selectedExercise.id === exerciseId) {
        setSelectedExercise(null);
      }
      fetchExercisesList();
    } catch (e) {
      notifications.show({
        color: 'red',
        title: 'Ошибка',
        message: 'Не удалось удалить упражнение',
        icon: <IconX size={18} />,
      });
    }
  };

  const handleDeleteApproach = async (approachId: number) => {
    try {
      await deleteApproach(approachId);
      notifications.show({
        color: 'green',
        title: 'Подход удален',
        message: 'Подход успешно удален!',
        icon: <IconCheck size={18} />,
      });
      if (selectedApproach && selectedApproach.id === approachId) {
        setSelectedApproach(null);
      }
      fetchApproachesList();
    } catch (e) {
      notifications.show({
        color: 'red',
        title: 'Ошибка',
        message: 'Не удалось удалить подход',
        icon: <IconX size={18} />,
      });
    }
  };

  const handleDeleteFullExercise = async (fullExerciseId: number) => {
    try {
      await deleteFullExercise(fullExerciseId);
      notifications.show({
        color: 'green',
        title: 'Полное упражнение удалено',
        message: 'Полное упражнение успешно удалено!',
        icon: <IconCheck size={18} />,
      });
      fetchFullExercisesList();
    } catch (e) {
      notifications.show({
        color: 'red',
        title: 'Ошибка',
        message: 'Не удалось удалить полное упражнение',
        icon: <IconX size={18} />,
      });
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event; 
  
    const wasActiveId = activeId;
    setActiveId(null);
    setActiveItem(null); 
  
    if (!active || !over) {
      return;
    }
  
    if (active.id.startsWith('exercise-') && (over.id === 'exercise-drop-zone' || over.id === 'full-exercise-dropzone')) {
      const exerciseData = active.data.current?.exercise;
      if (exerciseData) {
        setSelectedExercise(exerciseData);
      }
    } else if (active.id.startsWith('approach-') && (over.id === 'approach-drop-zone' || over.id === 'full-exercise-dropzone')) {
      const approachData = active.data.current?.approach;
      if (approachData) {
        setSelectedApproach(approachData);
      }
    } else if (active.id.startsWith('train-machine-') && (over.id === 'train-machine-drop-zone' || over.id === 'full-exercise-dropzone')) {
      const trainMachineData = active.data.current?.trainMachine;
      if (trainMachineData) {
        setSelectedTrainMachine(trainMachineData);
      }
    }
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id); 
    setActiveItem(event.active.data.current);
  };

  const handleCreateFullExercise = async () => {
    if (!selectedExercise || !selectedApproach) return;
    setCreatingFull(true);
    try {
      await createFullExercise(selectedExercise.id, selectedApproach.id, selectedTrainMachine?.id);
      notifications.show({
        color: 'green',
        title: 'Полное упражнение создано',
        message: 'Успешно сконструировано!',
        icon: <IconCheck size={18} />,
      });
      setSelectedExercise(null);
      setSelectedApproach(null);
      setSelectedTrainMachine(null);
      fetchFullExercisesList();
    } catch (e) {
      notifications.show({
        color: 'red',
        title: 'Ошибка',
        message: 'Не удалось создать полное упражнение',
        icon: <IconX size={18} />,
      });
    }
    setCreatingFull(false);
  };

  const handleReset = () => {
    setSelectedExercise(null);
    setSelectedApproach(null);
    setSelectedTrainMachine(null);
  };

  return (
    <Layout>
      <Container size="xl" py={40}>
        <Stack gap="xl">
          <Title order={2} ta="center" mb="xl">
            Конструктор упражнений
          </Title>
          
          <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
            <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
              {activeId && activeId.startsWith('exercise-') && activeItem?.exercise && (
                <DraggableExerciseCard
                  exercise={activeItem.exercise}
                  selected={false} 
                  isOverlay={true} 
                />
              )}
              {activeId && activeId.startsWith('approach-') && activeItem?.approach && (
                <DraggableApproachCard
                  approach={activeItem.approach}
                  selected={false} 
                  isOverlay={true} 
                />
              )}
              {activeId && activeId.startsWith('train-machine-') && activeItem?.trainMachine && (
                <DraggableTrainMachineCard
                  trainMachine={activeItem.trainMachine}
                  selected={false} 
                  isOverlay={true} 
                />
              )}
            </DragOverlay>
            
            <SimpleGrid cols={{ base: 1, sm: 1, md: 4 }} spacing="xl">
              <Stack>
                <Box>
                  <Paper p="lg" withBorder shadow="sm" radius="md">
                                         <Title order={4} mb="md" c="blue">
                       <Group>
                         <IconBarbell size={20} />
                         Создать упражнение
                       </Group>
                     </Title>
                     <Stack gap="md">
                      <TextInput
                        label="Название"
                        value={exerciseTitle}
                        onChange={e => setExerciseTitle(e.target.value)}
                        placeholder="Например: Приседания"
                        autoComplete="off"
                      />
                      <TextInput
                        label="Описание"
                        value={exerciseDescription}
                        onChange={e => setExerciseDescription(e.target.value)}
                        placeholder="Краткое описание"
                        autoComplete="off"
                      />
                      <Button 
                        leftSection={<IconPlus size={16}/>} 
                        onClick={handleCreateExercise} 
                        loading={loadingExercise} 
                        fullWidth
                        variant="filled"
                      >
                        Добавить упражнение
                      </Button>
                    </Stack>
                  </Paper>
                </Box>
                
                <Divider label="Упражнения" labelPosition="center" />
                
                <Box style={{ minHeight: 200, maxHeight: 400, overflowY: 'auto' }}>
                  {loadingExercise ? (
                    <Flex justify="center" p="xl">
                      <Loader />
                    </Flex>
                  ) : (
                    <ExerciseList
                      exercises={exercises}
                      selectedExercise={selectedExercise}
                      onDelete={handleDeleteExercise}
                    />
                  )}
                </Box>
              </Stack>

              <Stack style={{ minHeight: 500 }}>
                <FullExerciseDropzone
                  selectedExercise={selectedExercise}
                  selectedApproach={selectedApproach}
                  selectedTrainMachine={selectedTrainMachine}
                  onDropExercise={setSelectedExercise}
                  onDropApproach={setSelectedApproach}
                  onDropTrainMachine={setSelectedTrainMachine}
                  onCreate={handleCreateFullExercise}
                  onReset={handleReset}
                  creating={creatingFull}
                  activeDragItem={activeItem}
                />
              </Stack>

              <Stack>
                <Box>
                  <Paper p="lg" withBorder shadow="sm" radius="md">
                                         <Title order={4} mb="md" c="teal">
                       <Group>
                         <IconRepeat size={20} />
                         Создать подход
                       </Group>
                     </Title>
                     <Stack gap="md">
                      <NumberInput
                        label="Кол-во подходов"
                        value={approachesCount}
                        onChange={val => setApproachesCount(typeof val === 'number' ? val : undefined)}
                        min={1}
                        placeholder="Например: 3"
                      />
                      <NumberInput
                        label="Повторений в подходе"
                        value={repetitionPerApproachCount}
                        onChange={val => setRepetitionPerApproachCount(typeof val === 'number' ? val : undefined)}
                        min={1}
                        placeholder="Например: 12"
                      />
                      <Button 
                        leftSection={<IconPlus size={16}/>} 
                        onClick={handleCreateApproach} 
                        loading={loadingApproach} 
                        fullWidth
                        variant="filled"
                        color="teal"
                      >
                        Добавить подход
                      </Button>
                    </Stack>
                  </Paper>
                </Box>
                
                <Divider label="Подходы" labelPosition="center" />
                
                <Box style={{ minHeight: 200, maxHeight: 400, overflowY: 'auto' }}>
                  {loadingApproach ? (
                    <Flex justify="center" p="xl">
                      <Loader />
                    </Flex>
                  ) : (
                    <ApproachList
                      approaches={approaches}
                      selectedApproach={selectedApproach}
                      onDelete={handleDeleteApproach}
                    />
                  )}
                </Box>
              </Stack>

              <Stack>
                <Box>
                  <Paper p="lg" withBorder shadow="sm" radius="md">
                                         <Title order={4} mb="md" c="pink">
                       <Group>
                         <IconBrandDatabricks size={20} />
                         Тренажеры
                       </Group>
                     </Title>
                     <Text size="sm" c="dimmed" mb="md">
                       Выберите тренажер для упражнения (опционально)
                     </Text>
                  </Paper>
                </Box>
                
                <Divider label="Доступные тренажеры" labelPosition="center" />
                
                <Box style={{ minHeight: 200, maxHeight: 400, overflowY: 'auto' }}>
                  {loadingTrainMachine ? (
                    <Flex justify="center" p="xl">
                      <Loader />
                    </Flex>
                  ) : (
                    <TrainMachineList
                      trainMachines={trainMachines}
                      selectedTrainMachine={selectedTrainMachine}
                    />
                  )}
                </Box>
              </Stack>
            </SimpleGrid>
          </DndContext>
          
          <Paper p="lg" withBorder shadow="sm" radius="md" mt="xl">
            <FullExerciseList 
              fullExercises={fullExercises} 
              onDelete={handleDeleteFullExercise}
            />
          </Paper>
        </Stack>
      </Container>
    </Layout>
  );
}; 