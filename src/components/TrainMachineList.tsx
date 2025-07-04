import React from 'react';
import { Card, Group, Stack, Text, ThemeIcon, useComputedColorScheme, ActionIcon, Badge } from '@mantine/core';
import { IconBrandDatabricks, IconX } from '@tabler/icons-react';
import { useDraggable } from '@dnd-kit/core';
import type { TrainMachineDto } from '../types';

interface TrainMachineListProps {
  trainMachines: TrainMachineDto[];
  selectedTrainMachine: TrainMachineDto | null;
  onDelete?: (trainMachineId: number) => void;
}

interface DraggableTrainMachineCardProps {
  trainMachine: TrainMachineDto;
  selected: boolean;
  isOverlay?: boolean;
  onDelete?: (trainMachineId: number) => void;
}

export const TrainMachineList: React.FC<TrainMachineListProps> = ({ 
  trainMachines, 
  selectedTrainMachine, 
  onDelete 
}) => (
  <Stack>
    {trainMachines.length === 0 ? (
      <Text c="dimmed" ta="center">Нет тренажеров</Text>
    ) : trainMachines.map(tm => (
      <DraggableTrainMachineCard
        key={tm.id}
        trainMachine={tm}
        selected={selectedTrainMachine?.id === tm.id}
        onDelete={onDelete}
      />
    ))}
  </Stack>
);

export const DraggableTrainMachineCard: React.FC<DraggableTrainMachineCardProps> = ({ 
  trainMachine, 
  selected, 
  isOverlay,
  onDelete 
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `train-machine-${trainMachine.id}`,
    data: { trainMachine },
  });

  const computedColorScheme = useComputedColorScheme('light');
  const isDarkTheme = computedColorScheme === 'dark';
  const lightGradient = 'linear-gradient(90deg, #fff0f6 0%, #f0f9ff 100%)';
  const darkGradient = 'linear-gradient(90deg, #2B1A3C 0%, #1A2B3C 100%)';
  const activeGradient = isDarkTheme ? darkGradient : lightGradient;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(trainMachine.id);
    }
  };

  const handleDeleteMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDeleteTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  return (
    <Card
      ref={setNodeRef}
      shadow="sm"
      p="sm"
      radius="md"
      withBorder
      style={{
        cursor: isOverlay ? 'grabbing' : 'grab',
        transition: isOverlay ? 'none' : 'box-shadow 0.2s, background 0.2s',
        boxShadow: selected ? '0 0 0 2px #e64980' : isOverlay ? '0 4px 12px rgba(0,0,0,0.2)' : undefined,
        background: (isDragging && !isOverlay) || selected ? activeGradient : undefined,
        opacity: isOverlay ? 0.8 : isDragging && !isOverlay ? 0 : 1,
        height: isDragging && !isOverlay ? 0 : 'auto',
        overflow: isDragging && !isOverlay ? 'hidden' : 'visible',
        transform: isOverlay ? 'rotate(2deg)' : undefined,
      }}
    >
      <Group justify="space-between">
        <Group {...listeners} {...attributes} style={{ flex: 1, cursor: isOverlay ? 'grabbing' : 'grab' }}>
          <ThemeIcon color="pink" variant="light"><IconBrandDatabricks size={18} /></ThemeIcon>
          <div>
            <Group gap="xs">
              <Text fw={500}>{trainMachine.name}</Text>
            </Group>
            <Text size="xs" c="dimmed">{trainMachine.description || 'Нет описания'}</Text>
          </div>
        </Group>
        
        {onDelete && !isOverlay && (
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            onClick={handleDelete}
            onMouseDown={handleDeleteMouseDown}
            onTouchStart={handleDeleteTouchStart}
            style={{ 
              opacity: 0.7,
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            <IconX size={14} />
          </ActionIcon>
        )}
      </Group>
    </Card>
  );
}; 