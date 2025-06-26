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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconBarbell, IconRepeat, IconCheck, IconX, IconRefresh } from '@tabler/icons-react';
import {
  getExercises,
  getApproaches,
  createExercise,
  createApproach,
  createFullExercise,
  getFullExercises,
} from '../api/exercise';
import type { FullExerciseDto } from '../types';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { DraggableExerciseCard, ExerciseList } from '../components/ExerciseList';
import { ApproachList, DraggableApproachCard } from '../components/ApproachList';
import { FullExerciseDropzone } from '../components/FullExerciseDropzone';
import { FullExerciseList } from '../components/FullExerciseList';
import { Layout } from '../components';

export const ExerciseConstructor: React.FC = () => {
  // Списки
  const [exercises, setExercises] = useState<any[]>([]);
  const [approaches, setApproaches] = useState<any[]>([]);
  const [fullExercises, setFullExercises] = useState<FullExerciseDto[]>([]);
  // Формы
  const [exerciseTitle, setExerciseTitle] = useState('');
  const [exerciseDescription, setExerciseDescription] = useState('');
  const [approachesCount, setApproachesCount] = useState<number | undefined>(undefined);
  const [repetitionPerApproachCount, setRepetitionPerApproachCount] = useState<number | undefined>(undefined);
  // Загрузка
  const [loading, setLoading] = useState(false);
  const [loadingExercise, setLoadingExervice] = useState(false)
  const [loadingApproach, setLoadingApproach] = useState(false)

  // Drag & Drop: выбранные элементы
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);
  const [selectedApproach, setSelectedApproach] = useState<any | null>(null);
  const [creatingFull, setCreatingFull] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null); // Добавьте это состояние
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

  const handleDragEnd = (event: any) => {
    const { active, over } = event; 
  
    setActiveId(null);
    setActiveItem(null); 
  
    if (!active || !over) {
      return;
    }
  
    
    if (active.id.startsWith('exercise-') && (over.id === 'exercise-drop-zone' || over.id === 'full-exercise-dropzone')) {
      setSelectedExercise(active.data.current.exercise);
    } else if (active.id.startsWith('approach-') && (over.id === 'approach-drop-zone' || over.id === 'full-exercise-dropzone')) {
      setSelectedApproach(active.data.current.approach);
    }
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id); 
    setActiveItem(event.active.data.current);
  };

  // Создание полного упражнения
  const handleCreateFullExercise = async () => {
    if (!selectedExercise || !selectedApproach) return;
    setCreatingFull(true);
    try {
      await createFullExercise(selectedExercise.id, selectedApproach.id);
      notifications.show({
        color: 'green',
        title: 'Полное упражнение создано',
        message: 'Успешно сконструировано!',
        icon: <IconCheck size={18} />,
      });
      setSelectedExercise(null);
      setSelectedApproach(null);
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

  // Сброс выбора
  const handleReset = () => {
    setSelectedExercise(null);
    setSelectedApproach(null);
  };

  return (
    <Layout>
    <Container size="xl" my={40}>
      <Title order={2} mb="md" ta="center">Конструктор упражнений</Title>
      <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <DragOverlay>
        {activeId && activeId.startsWith('exercise-') && (
          <DraggableExerciseCard
            exercise={exercises.find(ex => `exercise-${ex.id}` === activeId)}
            selected={false} 
            isOverlay={true} 
          />
        )}
        {activeId && activeId.startsWith('approach-') && (
          <DraggableApproachCard
            approach={approaches.find(ap => `approach-${ap.id}` === activeId)}
            selected={false} 
            isOverlay={true} 
          />
        )}
      </DragOverlay>
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        <Stack>
          <Paper p="md" withBorder shadow="md" radius="md">
            <Title order={4} mb="sm">Создать упражнение</Title>
            <TextInput
              label="Название"
              value={exerciseTitle}
              onChange={e => setExerciseTitle(e.target.value)}
              mb="sm"
              placeholder="Например: Приседания"
              autoComplete="off"
            />
            <TextInput
              label="Описание"
              value={exerciseDescription}
              onChange={e => setExerciseDescription(e.target.value)}
              mb="sm"
              placeholder="Краткое описание"
              autoComplete="off"
            />
            <Button leftSection={<IconPlus size={16}/>} onClick={handleCreateExercise} loading={loading || loadingExercise} fullWidth>
              Добавить упражнение
            </Button>
          </Paper>
          <Divider my="sm" label="Упражнения"/>
          {loading ? <Loader/> : (
            <ExerciseList
              exercises={exercises}
              selectedExercise={selectedExercise}
            />
          )}
        </Stack>

          <FullExerciseDropzone
            selectedExercise={selectedExercise}
            selectedApproach={selectedApproach}
            onDropExercise={setSelectedExercise}
            onDropApproach={setSelectedApproach}
            onCreate={handleCreateFullExercise}
            onReset={handleReset}
            creating={creatingFull}
            activeDragItem={activeItem}
          />

        <Stack>
          <Paper p="md" withBorder shadow="md" radius="md">
            <Title order={4} mb="sm">Создать подход</Title>
            <NumberInput
              label="Кол-во подходов"
              value={approachesCount}
              onChange={val => setApproachesCount(typeof val === 'number' ? val : undefined)}
              min={1}
              mb="sm"
              placeholder="Например: 3"
            />
            <NumberInput
              label="Повторений в подходе"
              value={repetitionPerApproachCount}
              onChange={val => setRepetitionPerApproachCount(typeof val === 'number' ? val : undefined)}
              min={1}
              mb="sm"
              placeholder="Например: 12"
            />
            <Button leftSection={<IconPlus size={16}/>} onClick={handleCreateApproach} loading={loading || loadingApproach} fullWidth>
              Добавить подход
            </Button>
          </Paper>
          <Divider my="sm" label="Подходы"/>
          {loading ? <Loader/> : (
            <ApproachList
              approaches={approaches}
              selectedApproach={selectedApproach}
            />
          )}
        </Stack>
      </SimpleGrid>
      </DndContext>
      
      <Container size="xl" my={40}>
        <FullExerciseList fullExercises={fullExercises}  />
      </Container>
    </Container>
    </Layout>
  );
}; 