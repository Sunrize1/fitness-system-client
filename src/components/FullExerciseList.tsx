import React from 'react';
import { Card, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconBarbell, IconRepeat } from '@tabler/icons-react';
import type { FullExerciseListProps } from '../types';

export const FullExerciseList: React.FC<FullExerciseListProps> = ({ fullExercises }) => (
  <>
    <Title order={3} mb="md" ta="center">Ваши полные упражнения</Title>
    {fullExercises.length === 0 ? (
      <Text c="dimmed" ta="center">Пока нет созданных полных упражнений</Text>
    ) : (
      <Stack>
        {fullExercises.map((full) => (
          <Card key={full.id} shadow="sm" p="md" radius="md" withBorder>
            <Group justify="space-between">
              <Group>
                <ThemeIcon color="blue" variant="light"><IconBarbell size={18}/></ThemeIcon>
                <Text fw={500}>{full.exerciseDto.title}</Text>
                <Text size="sm" c="dimmed">{full.exerciseDto.description}</Text>
              </Group>
              <Group>
                <ThemeIcon color="teal" variant="light"><IconRepeat size={18}/></ThemeIcon>
                <Text fw={500}>{full.approachDto.approachesCount} x {full.approachDto.repetitionPerApproachCount}</Text>
              </Group>
            </Group>
          </Card>
        ))}
      </Stack>
    )}
  </>
); 