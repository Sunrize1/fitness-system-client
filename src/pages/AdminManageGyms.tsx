import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Table,
  Button,
  Stack,
  Group,
  Text,
  Avatar,
  Input,
  ActionIcon,
  Modal,
  Alert,
  Loader,
  Center,
  TextInput,
  NumberInput,
  Textarea,
  FileInput,
  Image,
  Tabs,
  Badge,
  Card,
  SimpleGrid,
  Box,
  Tooltip,
  Flex, useMantineColorScheme, Select
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconMapPin, 
  IconUsers, 
  IconPhoto,
  IconBarbell,
  IconAlertCircle,
  IconBuilding,
  IconDevices,
} from '@tabler/icons-react';
import { Layout } from '../components';
import { gymRoomApi } from '../api/gymRoom';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import type { GymRoomDto, GymRoomCreateDto, TrainMachineDto, TrainMachineCreateDto } from '../types';
import { AddressSuggestions } from 'react-dadata';
import 'react-dadata/dist/react-dadata.css';
import {fetchAddress} from "../utils/fetchAddress";

export const AdminManageGyms: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const { user: currentUser } = useAuth();
  const [gymRooms, setGymRooms] = useState<GymRoomDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>('gyms');
  
  // Gym Room modals
  const [gymRoomModalOpened, setGymRoomModalOpened] = useState(false);
  const [selectedGymRoom, setSelectedGymRoom] = useState<GymRoomDto | null>(null);
  const [isEditingGymRoom, setIsEditingGymRoom] = useState(false);
  const [savingGymRoom, setSavingGymRoom] = useState(false);
  
  // Train Machine modals
  const [machineModalOpened, setMachineModalOpened] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<TrainMachineDto | null>(null);
  const [isEditingMachine, setIsEditingMachine] = useState(false);
  const [savingMachine, setSavingMachine] = useState(false);

  const [address, setAddress] = React.useState({});
  const [addresses, setAddresses] = React.useState<{ [id: string]: string }>({});

  // Gym Room form data
  const [gymRoomForm, setGymRoomForm] = useState({
    name: '',
    description: '',
    longitude: 0,
    latitude: 0,
    capacity: 1,
    imageFile: null as File | null,
    imagePreview: null as string | null
  });

  // Train Machine form data
  const [machineForm, setMachineForm] = useState({
    name: '',
    description: '',
    count: 1,
    gymRoomId: 0,
    imageFile: null as File | null,
    imagePreview: null as string | null
  });

  if (!currentUser || currentUser.userRole !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchGymRooms();
  }, []);

  const fetchGymRooms = async () => {
    try {
      const response = await gymRoomApi.getAllGymRooms();
      setGymRooms(response.gymRooms);
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось загрузить список залов',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    gymRooms.forEach(room => {
      if (room.latitude && room.longitude) {
        fetchAddress(room.latitude, room.longitude).then(address => {
          setAddresses(prev => ({ ...prev, [room.id]: address }));
        });
      }
    });
  }, [gymRooms]);

  const handleImageChange = (file: File | null, type: 'gymRoom' | 'machine') => {
    if (type === 'gymRoom') {
      setGymRoomForm(prev => ({ ...prev, imageFile: file }));
      
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setGymRoomForm(prev => ({ ...prev, imagePreview: reader.result as string }));
        };
        reader.readAsDataURL(file);
      } else {
        setGymRoomForm(prev => ({ ...prev, imagePreview: null }));
      }
    } else {
      setMachineForm(prev => ({ ...prev, imageFile: file }));
      
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMachineForm(prev => ({ ...prev, imagePreview: reader.result as string }));
        };
        reader.readAsDataURL(file);
      } else {
        setMachineForm(prev => ({ ...prev, imagePreview: null }));
      }
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const openGymRoomModal = (gymRoom?: GymRoomDto) => {
    if (gymRoom) {
      setSelectedGymRoom(gymRoom);
      setIsEditingGymRoom(true);
      setGymRoomForm({
        name: gymRoom.name,
        description: gymRoom.description || '',
        longitude: gymRoom.longitude,
        latitude: gymRoom.latitude,
        capacity: gymRoom.capacity,
        imageFile: null,
        imagePreview: gymRoom.base64Image ? `data:image/jpeg;base64,${gymRoom.base64Image}` : null
      });
      setAddress({
        value: addresses[gymRoom.id],
        data: {
          lon: gymRoom.longitude,
          lat: gymRoom.latitude,
        }
      })
    } else {
      setSelectedGymRoom(null);
      setIsEditingGymRoom(false);
      setGymRoomForm({
        name: '',
        description: '',
        longitude: 0,
        latitude: 0,
        address: '',
        capacity: 1,
        imageFile: null,
        imagePreview: null
      });
      setAddress({})
    }
    setGymRoomModalOpened(true);
  };

  const openMachineModal = (machine?: TrainMachineDto, gymRoomId?: number) => {
    if (machine) {
      setSelectedMachine(machine);
      setIsEditingMachine(true);
      setMachineForm({
        name: machine.name,
        description: machine.description || '',
        count: machine.count,
        gymRoomId: machine.gymRoomId,
        imageFile: null,
        imagePreview: machine.base64Image ? `data:image/jpeg;base64,${machine.base64Image}` : null
      });
    } else {
      setSelectedMachine(null);
      setIsEditingMachine(false);
      setMachineForm({
        name: '',
        description: '',
        count: 1,
        gymRoomId: gymRoomId || 0,
        imageFile: null,
        imagePreview: null
      });
    }
    setMachineModalOpened(true);
  };

  const handleSaveGymRoom = async () => {
    if (!gymRoomForm.name.trim()) {
      notifications.show({
        title: 'Ошибка',
        message: 'Название зала обязательно для заполнения',
        color: 'red',
      });
      return;
    }

    setSavingGymRoom(true);
    try {
      let imageBase64: string | undefined;
      
      if (gymRoomForm.imageFile) {
        imageBase64 = await convertToBase64(gymRoomForm.imageFile);
      }

      const data: GymRoomCreateDto = {
        name: gymRoomForm.name.trim(),
        description: gymRoomForm.description.trim() || undefined,
        longitude: gymRoomForm.longitude,
        latitude: gymRoomForm.latitude,
        capacity: gymRoomForm.capacity,
        base64Image: imageBase64
      };

      if (isEditingGymRoom && selectedGymRoom) {
        const updatedGymRoom = await gymRoomApi.updateGymRoom(selectedGymRoom.id, data);
        setGymRooms(prev => prev.map(g => g.id === selectedGymRoom.id ? updatedGymRoom : g));
        notifications.show({
          title: 'Успешно',
          message: 'Зал обновлен',
          color: 'green',
        });
      } else {
        const newGymRoom = await gymRoomApi.createGymRoom(data);
        setGymRooms(prev => [...prev, newGymRoom]);
        notifications.show({
          title: 'Успешно',
          message: 'Зал создан',
          color: 'green',
        });
      }

      setGymRoomModalOpened(false);
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: `Не удалось ${isEditingGymRoom ? 'обновить' : 'создать'} зал`,
        color: 'red',
      });
    } finally {
      setSavingGymRoom(false);
    }
  };

  const handleSaveMachine = async () => {
    if (!machineForm.name.trim() || !machineForm.gymRoomId) {
      notifications.show({
        title: 'Ошибка',
        message: 'Заполните все обязательные поля',
        color: 'red',
      });
      return;
    }

    setSavingMachine(true);
    try {
      let imageBase64: string | undefined;
      
      if (machineForm.imageFile) {
        imageBase64 = await convertToBase64(machineForm.imageFile);
      }

      const data: TrainMachineCreateDto = {
        name: machineForm.name.trim(),
        description: machineForm.description.trim() || undefined,
        count: machineForm.count,
        gymRoomId: machineForm.gymRoomId,
        base64Image: imageBase64
      };

      if (isEditingMachine && selectedMachine) {
        const updatedMachine = await gymRoomApi.updateTrainMachine(selectedMachine.id, data);
        // Update the machine in gym room
        setGymRooms(prev => prev.map(gymRoom => ({
          ...gymRoom,
          trainMachines: gymRoom.trainMachines.map(m => 
            m.id === selectedMachine.id ? updatedMachine : m
          )
        })));
        notifications.show({
          title: 'Успешно',
          message: 'Тренажер обновлен',
          color: 'green',
        });
      } else {
        const newMachine = await gymRoomApi.createTrainMachine(data);
        // Add machine to gym room
        setGymRooms(prev => prev.map(gymRoom => 
          gymRoom.id === machineForm.gymRoomId 
            ? { ...gymRoom, trainMachines: [...gymRoom.trainMachines, newMachine] }
            : gymRoom
        ));
        notifications.show({
          title: 'Успешно',
          message: 'Тренажер создан',
          color: 'green',
        });
      }

      setMachineModalOpened(false);
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: `Не удалось ${isEditingMachine ? 'обновить' : 'создать'} тренажер`,
        color: 'red',
      });
    } finally {
      setSavingMachine(false);
    }
  };

  const handleDeleteGymRoom = async (id: number) => {
    try {
      await gymRoomApi.deleteGymRoom(id);
      setGymRooms(prev => prev.filter(g => g.id !== id));
      notifications.show({
        title: 'Успешно',
        message: 'Зал удален',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось удалить зал',
        color: 'red',
      });
    }
  };

  const handleDeleteMachine = async (machineId: number, gymRoomId: number) => {
    try {
      await gymRoomApi.deleteTrainMachine(machineId);
      setGymRooms(prev => prev.map(gymRoom => 
        gymRoom.id === gymRoomId 
          ? { ...gymRoom, trainMachines: gymRoom.trainMachines.filter(m => m.id !== machineId) }
          : gymRoom
      ));
      notifications.show({
        title: 'Успешно',
        message: 'Тренажер удален',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось удалить тренажер',
        color: 'red',
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container size="lg">
          <Center h={400}>
            <Loader size="lg" />
          </Center>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container size="xl">
        <Paper p="xl" shadow="sm">
          <Stack gap="lg">
            <Group justify="space-between">
              <Title order={2}>Управление залами</Title>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => openGymRoomModal()}
              >
                Создать зал
              </Button>
            </Group>
            
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Информация"
              color="blue"
              variant="light"
            >
              Здесь вы можете управлять залами и тренажерами в фитнес-центре.
            </Alert>

            <Tabs value={activeTab} onChange={setActiveTab}>
              <Tabs.List>
                <Tabs.Tab value="gyms" leftSection={<IconBuilding size={16} />}>
                  Залы
                </Tabs.Tab>
                <Tabs.Tab value="overview" leftSection={<IconBuilding size={16} />}>
                  Обзор
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="gyms" pt="lg">
                <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
                  {gymRooms.map(gymRoom => (
                    <Card key={gymRoom.id} shadow="sm" padding="lg" radius="md" withBorder>
                      <Card.Section>
                        {gymRoom.base64Image ? (
                          <Image
                            src={`data:image/jpeg;base64,${gymRoom.base64Image}`}
                            height={200}
                            alt={gymRoom.name}
                            fit="cover"
                          />
                        ) : (
                          <Box
                            h={200}
                            bg="gray.1"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <IconBuilding size={48} color="gray" />
                          </Box>
                        )}
                      </Card.Section>

                      <Stack gap="sm" mt="md">
                        <Group justify="space-between">
                          <Text fw={500} size="lg">{gymRoom.name}</Text>
                          <Group gap="xs">
                            <ActionIcon
                              variant="light"
                              color="blue"
                              onClick={() => openGymRoomModal(gymRoom)}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="light"
                              color="red"
                              onClick={() => handleDeleteGymRoom(gymRoom.id)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Group>

                        {gymRoom.description && (
                          <Text size="sm" c="dimmed" lineClamp={2}>
                            {gymRoom.description}
                          </Text>
                        )}

                        <Group gap="lg">
                          <Flex align="center" gap="xs">
                            <IconUsers size={16} color="blue" />
                            <Text size="sm">{gymRoom.capacity} мест</Text>
                          </Flex>
                          <Flex align="center" gap="xs">
                            <IconBarbell size={16} color="green" />
                            <Text size="sm">{gymRoom.trainMachines.length} тренажеров</Text>
                          </Flex>
                        </Group>

                        <Flex align="center" gap="xs">
                          <IconMapPin size={16} color="red" />
                          <Text size="sm">
                            {addresses[gymRoom.id]}
                          </Text>
                        </Flex>

                        <Button
                          variant="light"
                          size="sm"
                          leftSection={<IconPlus size={14} />}
                          onClick={() => openMachineModal(undefined, gymRoom.id)}
                        >
                          Добавить тренажер
                        </Button>

                        {gymRoom.trainMachines.length > 0 && (
                          <Stack gap="xs">
                            <Text fw={500} size="sm">Тренажеры:</Text>
                            {gymRoom.trainMachines.map(machine => (
                              <Group key={machine.id} justify="space-between">
                                <Group gap="xs">
                                  <Badge variant="light" size="sm">
                                    {machine.name}
                                  </Badge>
                                  <Text size="xs" c="dimmed">x{machine.count}</Text>
                                </Group>
                                <Group gap="xs">
                                  <ActionIcon
                                    size="sm"
                                    variant="light"
                                    color="blue"
                                    onClick={() => openMachineModal(machine)}
                                  >
                                    <IconEdit size={12} />
                                  </ActionIcon>
                                  <ActionIcon
                                    size="sm"
                                    variant="light"
                                    color="red"
                                    onClick={() => handleDeleteMachine(machine.id, gymRoom.id)}
                                  >
                                    <IconTrash size={12} />
                                  </ActionIcon>
                                </Group>
                              </Group>
                            ))}
                          </Stack>
                        )}
                      </Stack>
                    </Card>
                  ))}
                </SimpleGrid>

                {gymRooms.length === 0 && (
                  <Center h={300}>
                    <Stack align="center" gap="md">
                      <IconBuilding size={64} color="gray" />
                      <Text c="dimmed" size="lg">Залы не найдены</Text>
                      <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={() => openGymRoomModal()}
                      >
                        Создать первый зал
                      </Button>
                    </Stack>
                  </Center>
                )}
              </Tabs.Panel>

              <Tabs.Panel value="overview" pt="lg">
                <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="lg">
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between">
                      <Stack gap="xs">
                        <Text size="sm" c="dimmed">Всего залов</Text>
                        <Text size="xl" fw={700}>{gymRooms.length}</Text>
                      </Stack>
                      <IconBuilding size={40} color="blue" />
                    </Group>
                  </Card>

                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between">
                      <Stack gap="xs">
                        <Text size="sm" c="dimmed">Всего тренажеров</Text>
                        <Text size="xl" fw={700}>
                          {gymRooms.reduce((total, gym) => total + gym.trainMachines.length, 0)}
                        </Text>
                      </Stack>
                      <IconBarbell size={40} color="green" />
                    </Group>
                  </Card>

                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between">
                      <Stack gap="xs">
                        <Text size="sm" c="dimmed">Общая вместимость</Text>
                        <Text size="xl" fw={700}>
                          {gymRooms.reduce((total, gym) => total + gym.capacity, 0)}
                        </Text>
                      </Stack>
                      <IconUsers size={40} color="orange" />
                    </Group>
                  </Card>

                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between">
                      <Stack gap="xs">
                        <Text size="sm" c="dimmed">Средняя вместимость</Text>
                        <Text size="xl" fw={700}>
                          {gymRooms.length > 0 
                            ? Math.round(gymRooms.reduce((total, gym) => total + gym.capacity, 0) / gymRooms.length)
                            : 0
                          }
                        </Text>
                      </Stack>
                      <IconDevices size={40} color="purple" />
                    </Group>
                  </Card>
                </SimpleGrid>
              </Tabs.Panel>
            </Tabs>
          </Stack>
        </Paper>
      </Container>

      {/* Gym Room Modal */}
      <Modal
        opened={gymRoomModalOpened}
        onClose={() => setGymRoomModalOpened(false)}
        title={isEditingGymRoom ? "Редактировать зал" : "Создать зал"}
        centered
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Название зала"
            placeholder="Введите название зала"
            value={gymRoomForm.name}
            onChange={(event) => setGymRoomForm(prev => ({ ...prev, name: event.target.value }))}
            required
          />

          <Textarea
            label="Описание"
            placeholder="Описание зала (необязательно)"
            value={gymRoomForm.description}
            onChange={(event) => setGymRoomForm(prev => ({ ...prev, description: event.target.value }))}
            minRows={3}
          />

          <Group grow>
            <Input.Wrapper
                label="Адрес"
                required
                className={isDark ? 'dadata-dark' : ''}
            >
              <AddressSuggestions
                  token="3a8eb01fe2aafe76a2e9a78915573215025b8d07"
                  placeholder="Введите адрес"
                  value={address}
                  onChange={(suggestion) => {
                    if (suggestion?.data?.geo_lat && suggestion?.data?.geo_lon) {
                      setGymRoomForm((prev) => ({
                        ...prev,
                        latitude: Number(suggestion.data.geo_lat),
                        longitude: Number(suggestion.data.geo_lon),
                      }));
                    }
                  }}
              />
            </Input.Wrapper>
          </Group>

          <NumberInput
            label="Вместимость"
            placeholder="Количество мест в зале"
            value={gymRoomForm.capacity}
            onChange={(value) => setGymRoomForm(prev => ({ ...prev, capacity: Number(value) || 1 }))}
            min={1}
            required
          />

          <Stack gap="xs">
            <Text size="sm" fw={500}>Изображение зала (необязательно)</Text>
            <FileInput
              leftSection={<IconPhoto size={16} />}
              placeholder="Выберите изображение"
              accept="image/*"
              value={gymRoomForm.imageFile}
              onChange={(file) => handleImageChange(file, 'gymRoom')}
              clearable
            />

            {gymRoomForm.imagePreview && (
              <Image
                src={gymRoomForm.imagePreview}
                alt="Предварительный просмотр"
                fit="contain"
                h={200}
                radius="md"
              />
            )}
          </Stack>

          <Group justify="flex-end">
            <Button variant="light" onClick={() => setGymRoomModalOpened(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleSaveGymRoom}
              loading={savingGymRoom}
              disabled={!gymRoomForm.name.trim()}
            >
              {isEditingGymRoom ? 'Сохранить' : 'Создать'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Train Machine Modal */}
      <Modal
        opened={machineModalOpened}
        onClose={() => setMachineModalOpened(false)}
        title={isEditingMachine ? "Редактировать тренажер" : "Создать тренажер"}
        centered
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Название тренажера"
            placeholder="Введите название тренажера"
            value={machineForm.name}
            onChange={(event) => setMachineForm(prev => ({ ...prev, name: event.target.value }))}
            required
          />

          <Textarea
            label="Описание"
            placeholder="Описание тренажера (необязательно)"
            value={machineForm.description}
            onChange={(event) => setMachineForm(prev => ({ ...prev, description: event.target.value }))}
            minRows={3}
          />

          <Group grow>
            <NumberInput
              label="Количество"
              placeholder="Количество тренажеров"
              value={machineForm.count}
              onChange={(value) => setMachineForm(prev => ({ ...prev, count: Number(value) || 1 }))}
              min={1}
              required
            />
            
            {!isEditingMachine && (
              <Select
                label="Зал"
                placeholder="Выберите зал"
                value={machineForm.gymRoomId.toString()}
                required
                onChange={(value) => setMachineForm(prev => ({ ...prev, gymRoomId: Number(value) }))}
                data={gymRooms.map((gym, index) => {
                  return { value: gym.id.toString(), label: gym.name }
                })}
              />
            )}
          </Group>

          <Stack gap="xs">
            <Text size="sm" fw={500}>Изображение тренажера (необязательно)</Text>
            <FileInput
              leftSection={<IconPhoto size={16} />}
              placeholder="Выберите изображение"
              accept="image/*"
              value={machineForm.imageFile}
              onChange={(file) => handleImageChange(file, 'machine')}
              clearable
            />

            {machineForm.imagePreview && (
              <Image
                src={machineForm.imagePreview}
                alt="Предварительный просмотр"
                fit="contain"
                h={200}
                radius="md"
              />
            )}
          </Stack>

          <Group justify="flex-end">
            <Button variant="light" onClick={() => setMachineModalOpened(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleSaveMachine}
              loading={savingMachine}
              disabled={!machineForm.name.trim() || (!isEditingMachine && !machineForm.gymRoomId)}
            >
              {isEditingMachine ? 'Сохранить' : 'Создать'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Layout>
  );
}; 