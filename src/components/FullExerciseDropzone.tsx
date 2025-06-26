import React from 'react';
import { Card, Group, Button, Text, ThemeIcon, Flex, useComputedColorScheme } from '@mantine/core';
import { IconBarbell, IconRepeat, IconCheck, IconRefresh } from '@tabler/icons-react';
import { useDroppable } from '@dnd-kit/core';
import type { FullExerciseDropzoneProps } from '../types';

export const FullExerciseDropzone: React.FC<FullExerciseDropzoneProps> = ({
  selectedExercise,
  selectedApproach,
  onDropExercise,
  onDropApproach,
  onCreate,
  onReset,
  creating,
  activeDragItem,
}) => {
  const { setNodeRef: setFullDropzoneRef } = useDroppable({ id: 'full-exercise-dropzone' });
  const { isOver: isOverExercise, setNodeRef: setExerciseDropRef } = useDroppable({
    id: 'exercise-drop-zone',
    data: { accepts: 'exercise' },
  });
  const { isOver: isOverApproach, setNodeRef: setApproachDropRef } = useDroppable({
    id: 'approach-drop-zone',
    data: { accepts: 'approach' },
  });
  const isDraggingExercise = activeDragItem && activeDragItem.exercise;
  const isDraggingApproach = activeDragItem && activeDragItem.approach;
  const computedColorScheme = useComputedColorScheme('light');
  const isDarkTheme = computedColorScheme === 'dark';
  const lightGradient = 'linear-gradient(90deg, #e7f5ff 0%, #e6fcf5 100%)';
  const darkGradient = 'linear-gradient(90deg, #1A2B3C 0%, #173330 100%)';
  const activeGradient = isDarkTheme ? darkGradient : lightGradient;

  return (
    <div ref={setFullDropzoneRef} style={{ width: '100%' }}>
      <Text c="dimmed" size="sm" ta="center">Перетащите упражнение и подход</Text>
      <Card
        mt="md"
        p="md"
        withBorder
        shadow="xs"
        radius="md"
        style={{
          minHeight: 140,
          background: (isOverExercise && isDraggingExercise) || (isOverApproach && isDraggingApproach) ? activeGradient : undefined,
          transition: 'background 0.2s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Flex justify="center" direction='column' align='center'>
          <Card
            ref={setExerciseDropRef}
            w={300}
            h={60}
            withBorder
            radius="md"
            style={{
              opacity: selectedExercise ? 1 : 0.5,
              borderColor: selectedExercise ? '#228be6' : (isOverExercise && isDraggingExercise) ? '#228be6' : undefined,
              background: (isOverExercise && isDraggingExercise) ? (isDarkTheme ? '#1A2B3C' : '#e7f5ff') : undefined,
              marginBottom: 8,
              transition: 'all 0.2s ease',
            }}
          >
            {selectedExercise ? (
              <Flex direction='row' gap='xs'>
                <ThemeIcon color="blue" variant="light"><IconBarbell size={18} /></ThemeIcon>
                <Text truncate='end'>{selectedExercise.title}</Text>
              </Flex>
            ) : (
              <Text c="dimmed" size="sm">Упражнение</Text>
            )}
          </Card>
          <Text fw={700} size="lg" mb={8} mt={8}>+</Text>
          <Card
            ref={setApproachDropRef}
            w={180}
            h={60}
            withBorder
            radius="md"
            style={{
              opacity: selectedApproach ? 1 : 0.5,
              borderColor: selectedApproach ? '#12b886' : (isOverApproach && isDraggingApproach) ? '#12b886' : undefined,
              background: (isOverApproach && isDraggingApproach) ? (isDarkTheme ? '#173330' : '#e6fcf5') : undefined,
              transition: 'all 0.2s ease',
            }}
          >
            {selectedApproach ? (
              <Group>
                <ThemeIcon color="teal" variant="light"><IconRepeat size={18} /></ThemeIcon>
                <Text>{selectedApproach.approachesCount} x {selectedApproach.repetitionPerApproachCount}</Text>
              </Group>
            ) : (
              <Text c="dimmed" size="sm">Подход</Text>
            )}
          </Card>
        </Flex>
        <Group mt="md" justify="center">
          <Button
            leftSection={<IconCheck size={18} />} color="teal"
            disabled={!selectedExercise || !selectedApproach || creating}
            loading={creating}
            onClick={onCreate}
          >
            Создать полное упражнение
          </Button>
          <Button variant="light" color="gray" leftSection={<IconRefresh size={16} />} onClick={onReset}>
            Сбросить
          </Button>
        </Group>
      </Card>
    </div>
  );
};