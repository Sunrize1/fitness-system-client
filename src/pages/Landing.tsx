import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Card,
  Grid,
  Image,
  Box,
  Paper,
  Divider,
  Center,
  Badge,
  Anchor,
  Loader
} from '@mantine/core';
import {
  IconBarbell,
  IconHeartbeat,
  IconUsers,
  IconClock,
  IconTrophy,
  IconTarget,
  IconPhone,
  IconMail,
  IconMapPin,
  IconCalendarEvent,
  IconArrowRight,
  IconLogin,
  IconUserPlus
} from '@tabler/icons-react';
import { getPublicPosts } from '../api/post';
import { parseBackendDate } from '../utils/dateUtils';
import { createImageDataUrl, createFallbackImage } from '../utils/imageUtils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Layout } from '../components';
import type { PostDto } from '../types';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setPostsLoading(true);
      try {
        const data = await getPublicPosts({ 
          page: 0, 
          size: 6,
          sort: ['createdAt', 'desc']
        });
        setPosts(data.posts);
      } catch (error) {
        console.error('Ошибка загрузки постов:', error);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const features = [
    {
      icon: IconBarbell,
      title: 'Профессиональное оборудование',
      description: 'Современные тренажеры и спортивный инвентарь высочайшего качества'
    },
    {
      icon: IconUsers,
      title: 'Опытные тренеры',
      description: 'Квалифицированные инструкторы с многолетним опытом работы'
    },
    {
      icon: IconClock,
      title: 'Удобное расписание',
      description: 'Групповые и персональные тренировки в удобное для вас время'
    },
    {
      icon: IconHeartbeat,
      title: 'Здоровый образ жизни',
      description: 'Комплексный подход к фитнесу и правильному питанию'
    },
    {
      icon: IconTrophy,
      title: 'Достижение целей',
      description: 'Индивидуальные программы для достижения ваших спортивных целей'
    },
    {
      icon: IconTarget,
      title: 'Эффективные результаты',
      description: 'Проверенные методики тренировок для максимального эффекта'
    }
  ];

  const content = (
    <Box>
      <Box
        style={{
          background: 'linear-gradient(135deg, var(--mantine-color-blue-7) 0%, var(--mantine-color-blue-5) 100%)',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container size="xl" py="xl">
          <Grid align="center" gutter="xl">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xl">
                <Title
                  order={1}
                  size="4rem"
                  fw={900}
                  style={{ color: 'var(--mantine-color-white)', lineHeight: 1.1 }}
                >
                  Твой путь к{' '}
                  <Text
                    component="span"
                    inherit
                    style={{
                      background: 'linear-gradient(45deg, #ffd43b, #fab005)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    идеальной форме
                  </Text>
                </Title>
                <Text size="xl" style={{ color: 'var(--mantine-color-white)', opacity: 0.9 }}>
                  Современный фитнес-центр с профессиональным оборудованием, 
                  опытными тренерами и индивидуальным подходом к каждому клиенту.
                </Text>
                <Group>
                  <Button
                    size="xl"
                    radius="xl"
                    leftSection={<IconUserPlus size={20} />}
                    onClick={() => navigate('/register')}
                    style={{
                      background: 'linear-gradient(45deg, var(--mantine-color-yellow-4), var(--mantine-color-yellow-6))',
                      color: 'var(--mantine-color-blue-7)',
                      border: 'none'
                    }}
                  >
                    Начать тренировки
                  </Button>
                  <Button
                    size="xl"
                    radius="xl"
                    variant="outline"
                    leftSection={<IconLogin size={20} />}
                    onClick={() => navigate('/login')}
                    style={{
                      color: 'var(--mantine-color-white)',
                      borderColor: 'var(--mantine-color-white)'
                    }}
                  >
                    Войти
                  </Button>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Center>
                <Box
                  style={{
                    width: '100%',
                    maxWidth: '500px',
                    height: '400px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <IconBarbell size={200} style={{ color: 'var(--mantine-color-white)', opacity: 0.8 }} />
                </Box>
              </Center>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      <Container size="xl" py="xl">
        <Center mb="xl">
          <Stack align="center" gap="md">
            <Title order={2} size="3rem" ta="center">
              Почему выбирают нас
            </Title>
            <Text size="lg" c="dimmed" ta="center" maw="600px">
              Мы предлагаем все необходимое для эффективных тренировок и достижения ваших спортивных целей
            </Text>
          </Stack>
        </Center>

        <Grid gutter="xl">
          {features.map((feature, index) => (
            <Grid.Col key={index} span={{ base: 12, md: 6, lg: 4 }}>
              <Card
                shadow="sm"
                padding="xl"
                radius="md"
                withBorder
                h="100%"
                style={{
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <Stack align="center" ta="center" gap="md">
                  <Box
                    style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-blue-4))',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <feature.icon size={40} style={{ color: 'var(--mantine-color-white)' }} />
                  </Box>
                  <Title order={3} size="xl">
                    {feature.title}
                  </Title>
                  <Text c="dimmed" size="md">
                    {feature.description}
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Container>

      <Box style={{ backgroundColor: 'var(--mantine-color-default)' }}>
        <Container size="xl" py="xl">
          <Grid align="center" gutter="xl">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box
                style={{
                  height: '400px',
                  background: 'linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-blue-4))',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconTrophy size={150} style={{ color: 'var(--mantine-color-white)', opacity: 0.8 }} />
              </Box>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                <Title order={2} size="3rem">
                  О нашем фитнес-центре
                </Title>
                <Text size="lg" c="dimmed">
                  Мы работаем уже более 10 лет и помогли тысячам людей достичь своих фитнес-целей. 
                  Наш центр оснащен современным оборудованием и имеет команду профессиональных тренеров.
                </Text>
                <Stack gap="xs">
                  <Group>
                    <Badge size="lg" color="blue">1000+</Badge>
                    <Text>Довольных клиентов</Text>
                  </Group>
                  <Group>
                    <Badge size="lg" color="green">15+</Badge>
                    <Text>Опытных тренеров</Text>
                  </Group>
                  <Group>
                    <Badge size="lg" color="orange">24/7</Badge>
                    <Text>Доступ к залу</Text>
                  </Group>
                </Stack>
              </Stack>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      <Container size="xl" py="xl">
        <Center mb="xl">
          <Stack align="center" gap="md">
            <Title order={2} size="3rem" ta="center">
              Новости и события
            </Title>
            <Text size="lg" c="dimmed" ta="center" maw="600px">
              Будьте в курсе последних новостей, событий и полезных советов от наших тренеров
            </Text>
          </Stack>
        </Center>

        {postsLoading ? (
          <Center>
            <Loader size="lg" />
          </Center>
        ) : (
          <Grid gutter="xl">
            {posts.map((post) => (
              <Grid.Col key={post.id} span={{ base: 12, md: 6, lg: 4 }}>
                <Card
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  h="100%"
                  style={{
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                  onClick={() => navigate('/news')}
                >
                  <Stack gap="md" h="100%">
                    {post.imageBase64 ? (
                      <Image
                        src={createImageDataUrl(post.imageBase64)}
                        alt={post.title}
                        height={200}
                        radius="md"
                        fit="cover"
                        fallbackSrc={createFallbackImage(400, 200)}
                        style={{
                          backgroundColor: 'var(--mantine-color-gray-1)'
                        }}
                      />
                    ) : (
                      <Box
                        style={{
                          height: '200px',
                          backgroundColor: 'var(--mantine-color-gray-1)',
                          borderRadius: 'var(--mantine-radius-md)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, var(--mantine-color-blue-1), var(--mantine-color-blue-0))'
                        }}
                      >
                        <IconBarbell size={48} style={{ color: 'var(--mantine-color-blue-5)', opacity: 0.5 }} />
                      </Box>
                    )}
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Title order={4} lineClamp={2}>
                        {post.title}
                      </Title>
                      <Text size="sm" c="dimmed">
                        {format(parseBackendDate(post.createdAt), 'd MMMM yyyy', { locale: ru })}
                      </Text>
                      <Text c="dimmed" lineClamp={3} style={{ flex: 1 }}>
                        {post.description}
                      </Text>
                    </Stack>
                    <Group justify="flex-end">
                      <Anchor 
                        size="sm" 
                        component="button"
                                              onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/news`);
                      }}
                        style={{ cursor: 'pointer' }}
                      >
                        Читать далее
                        <IconArrowRight size={14} style={{ marginLeft: '4px' }} />
                      </Anchor>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}

        {posts.length === 0 && !postsLoading && (
          <Center>
            <Text size="lg" c="dimmed">
              Пока нет новостей
            </Text>
          </Center>
        )}

        {posts.length > 0 && (
          <Center mt="xl">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/news')}
              leftSection={<IconArrowRight size={18} />}
            >
              Все новости
            </Button>
          </Center>
        )}
      </Container>

      <Box style={{ backgroundColor: 'var(--mantine-color-default)' }}>
        <Container size="xl" py="xl">
          <Center mb="xl">
            <Stack align="center" gap="md">
              <Title order={2} size="3rem" ta="center">
                Контакты
              </Title>
              <Text size="lg" c="dimmed" ta="center" maw="600px">
                Свяжитесь с нами или приезжайте к нам в гости
              </Text>
            </Stack>
          </Center>

          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 12 }}>
              <Card shadow="sm" padding="xl" radius="md" withBorder>
                <Stack gap="md">
                  <Group>
                    <IconMapPin size={24} style={{ color: 'var(--mantine-color-blue-6)' }} />
                    <div>
                      <Text fw={500}>Адрес</Text>
                      <Text c="dimmed">г. Томск, ул. Никитина, 4, стр. 1</Text>
                    </div>
                  </Group>
                  <Group>
                    <IconPhone size={24} style={{ color: 'var(--mantine-color-blue-6)' }} />
                    <div>
                      <Text fw={500}>Телефон</Text>
                      <Text c="dimmed">+7 (999) 999-99-99</Text>
                    </div>
                  </Group>
                  <Group>
                    <IconMail size={24} style={{ color: 'var(--mantine-color-blue-6)' }} />
                    <div>
                      <Text fw={500}>Email</Text>
                      <Text c="dimmed">info@fitness-center.ru</Text>
                    </div>
                  </Group>
                  <Group>
                    <IconClock size={24} style={{ color: 'var(--mantine-color-blue-6)' }} />
                    <div>
                      <Text fw={500}>Часы работы</Text>
                      <Text c="dimmed">Ежедневно с 6:00 до 00:00</Text>
                    </div>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      <Box style={{ backgroundColor: 'var(--mantine-color-dark-9)', color: 'var(--mantine-color-white)' }}>
        <Container size="xl" py="xl">
          <Center>
            <Stack align="center" gap="md">
              <Group>
                <IconBarbell size={30} style={{ color: 'var(--mantine-color-white)' }} />
                <Title order={3} style={{ color: 'var(--mantine-color-white)' }}>
                  Fitness Center
                </Title>
              </Group>
              <Text style={{ color: 'var(--mantine-color-gray-4)' }} ta="center">
                © 2025 Fitness Center. Все права защищены.
              </Text>
            </Stack>
          </Center>
        </Container>
      </Box>
    </Box>
  );

  return (
    <Layout showHeader={false}>
      {content}
    </Layout>
  );
}; 