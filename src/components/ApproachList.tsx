import React from 'react';
import { Card, Group, Stack, Text, ThemeIcon, useComputedColorScheme } from '@mantine/core';
import { IconRepeat } from '@tabler/icons-react';
import { useDraggable } from '@dnd-kit/core';
import type { DraggableApproachCardProps } from '../types';

interface ApproachListProps {
  approaches: any[];
  selectedApproach: any | null;
}

export const ApproachList: React.FC<ApproachListProps> = ({ approaches, selectedApproach }) => (
  <Stack>
    {approaches.length === 0 ? (
      <Text c="dimmed" ta="center">Нет подходов</Text>
    ) : approaches.map(ap => (
      <DraggableApproachCard
        key={ap.id}
        approach={ap}
        selected={selectedApproach && selectedApproach.id === ap.id}
      />
    ))}
  </Stack>
);

export const DraggableApproachCard: React.FC<DraggableApproachCardProps> = ({ approach, selected, isOverlay }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `approach-${approach.id}`,
    data: { approach },
  });

  const computedColorScheme = useComputedColorScheme('light');
  const isDarkTheme = computedColorScheme === 'dark';
  const lightGradient = 'linear-gradient(90deg, #e7f5ff 0%, #e6fcf5 100%)';
  const darkGradient = 'linear-gradient(90deg, #1A2B3C 0%, #173330 100%)';
  const activeGradient = isDarkTheme ? darkGradient : lightGradient;

  return (
    <Card
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      shadow="sm"
      p="sm"
      radius="md"
      withBorder
      style={{
        cursor: isOverlay ? 'grabbing' : 'grab',
        transition: isOverlay ? 'none' : 'box-shadow 0.2s, background 0.2s',
        boxShadow: selected ? '0 0 0 2px #228be6' : isOverlay ? '0 4px 12px rgba(0,0,0,0.2)' : undefined,
        background: (isDragging && !isOverlay) || selected ? activeGradient : undefined,
        opacity: isOverlay ? 0.8 : isDragging && !isOverlay ? 0 : 1,
        height: isDragging && !isOverlay ? 0 : 'auto',
        overflow: isDragging && !isOverlay ? 'hidden' : 'visible',
        transform: isOverlay ? 'rotate(2deg)' : undefined,
      }}
    >
      <Group>
        <ThemeIcon color="teal" variant="light"><IconRepeat size={18} /></ThemeIcon>
        <div>
          <Text fw={500}>{approach.approachesCount} x {approach.repetitionPerApproachCount}</Text>
        </div>
      </Group>
    </Card>
  );
}; 