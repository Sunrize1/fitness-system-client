import React from 'react';
import { Card, Group, Button, Text, ThemeIcon, Flex, useComputedColorScheme, Stack, Badge } from '@mantine/core';
import { IconBarbell, IconRepeat, IconCheck, IconRefresh, IconArrowsLeftRight } from '@tabler/icons-react';
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
      <Stack align="center" gap="md">
        <Badge size="lg" variant="light" color="blue">
          Перетащите упражнение и подход для создания
        </Badge>
        
        <Card
          p="xl"
          withBorder
          shadow="md"
          radius="lg"
          style={{
            minHeight: 200,
            width: '100%',
            maxWidth: 400,
            background: (isOverExercise && isDraggingExercise) || (isOverApproach && isDraggingApproach) 
              ? activeGradient 
              : isDarkTheme ? '#1a1b1e' : '#f8f9fa',
            transition: 'all 0.3s ease',
            border: (isOverExercise && isDraggingExercise) || (isOverApproach && isDraggingApproach) 
              ? '2px dashed #228be6' 
              : '1px solid #e9ecef',
          }}
        >
          <Stack align="center" gap="lg">
            <Card
              ref={setExerciseDropRef}
              w="100%"
              p="md"
              withBorder
              radius="md"
              style={{
                opacity: selectedExercise ? 1 : 0.6,
                borderColor: selectedExercise ? '#228be6' : (isOverExercise && isDraggingExercise) ? '#228be6' : '#dee2e6',
                borderWidth: selectedExercise || (isOverExercise && isDraggingExercise) ? 2 : 1,
                background: (isOverExercise && isDraggingExercise) ? (isDarkTheme ? '#1A2B3C' : '#e7f5ff') : 
                           selectedExercise ? (isDarkTheme ? '#1A2B3C' : '#f0f8ff') : 'transparent',
                transition: 'all 0.2s ease',
                minHeight: 70,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selectedExercise ? (
                <Group>
                  <ThemeIcon color="blue" variant="light" size="md">
                    <IconBarbell size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600} size="sm">{selectedExercise.title}</Text>
                    <Text size="xs" c="dimmed">{selectedExercise.description}</Text>
                  </div>
                </Group>
              ) : (
                <Text c="dimmed" size="sm" ta="center">
                  {isDraggingExercise ? "Отпустите упражнение здесь" : "Перетащите упражнение"}
                </Text>
              )}
            </Card>

            <ThemeIcon 
              size="lg" 
              radius="xl" 
              variant="light" 
              color={selectedExercise && selectedApproach ? 'teal' : 'gray'}
            >
              <IconArrowsLeftRight size={18} />
            </ThemeIcon>

            <Card
              ref={setApproachDropRef}
              w="100%"
              p="md"
              withBorder
              radius="md"
              style={{
                opacity: selectedApproach ? 1 : 0.6,
                borderColor: selectedApproach ? '#12b886' : (isOverApproach && isDraggingApproach) ? '#12b886' : '#dee2e6',
                borderWidth: selectedApproach || (isOverApproach && isDraggingApproach) ? 2 : 1,
                background: (isOverApproach && isDraggingApproach) ? (isDarkTheme ? '#173330' : '#e6fcf5') : 
                           selectedApproach ? (isDarkTheme ? '#173330' : '#f0fdf4') : 'transparent',
                transition: 'all 0.2s ease',
                minHeight: 70,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selectedApproach ? (
                <Group>
                  <ThemeIcon color="teal" variant="light" size="md">
                    <IconRepeat size={20} />
                  </ThemeIcon>
                  <Text fw={600}>{selectedApproach.approachesCount} x {selectedApproach.repetitionPerApproachCount}</Text>
                </Group>
              ) : (
                <Text c="dimmed" size="sm" ta="center">
                  {isDraggingApproach ? "Отпустите подход здесь" : "Перетащите подход"}
                </Text>
              )}
            </Card>
          </Stack>
        </Card>

        <Group>
          <Button
            leftSection={<IconCheck size={18} />} 
            color="teal"
            size="lg"
            w="100%"
            disabled={!selectedExercise || !selectedApproach || creating}
            loading={creating}
            onClick={onCreate}
            variant="filled"
          >
            {creating ? 'Создаю...' : 'Создать полное упражнение'}
          </Button>
          <Button 
            variant="light" 
            color="gray" 
            w="100%"
            leftSection={<IconRefresh size={16} />} 
            onClick={onReset}
            size="md"
            disabled={creating}
          >
            Очистить
          </Button>
        </Group>
      </Stack>
    </div>
  );
};