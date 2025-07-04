import React from 'react';
import { Card, Group, Stack, Text, ThemeIcon, Title, ActionIcon, Badge } from '@mantine/core';
import { IconBarbell, IconRepeat, IconX, IconBrandDatabricks } from '@tabler/icons-react';
import type { FullExerciseListProps } from '../types';

export const FullExerciseList: React.FC<FullExerciseListProps> = ({ fullExercises, onDelete }) => (
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
                <Group>
                  <ThemeIcon color="blue" variant="light"><IconBarbell size={18}/></ThemeIcon>
                  <Text fw={500}>{full.exerciseDto.title}</Text>
                  <Text size="sm" c="dimmed">{full.exerciseDto.description}</Text>
                </Group>
                <Group>
                  <ThemeIcon color="teal" variant="light"><IconRepeat size={18}/></ThemeIcon>
                  <Text fw={500}>{full.approachDto.approachesCount} x {full.approachDto.repetitionPerApproachCount}</Text>
                </Group>
                {full.trainMachineDto && (
                  <Group>
                    <ThemeIcon color="pink" variant="light"><IconBrandDatabricks size={18}/></ThemeIcon>
                    <div>
                      <Text fw={500} size="sm">{full.trainMachineDto.name}</Text>
                    </div>
                  </Group>
                )}
              </Group>
              {onDelete && (
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={() => onDelete(full.id)}
                  style={{ opacity: 0.7 }}
                >
                  <IconX size={14} />
                </ActionIcon>
              )}
            </Group>
          </Card>
        ))}
      </Stack>
    )}
  </>
); 