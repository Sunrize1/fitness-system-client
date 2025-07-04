import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Title,
  Text,
  Card,
  Stack,
  Group,
  Button,
  Grid,
  Image,
  Badge,
  TextInput,
  Select,
  Box,
  Center,
  Loader,
  Pagination,
  Paper,
  Divider,
  Modal,
  TypographyStylesProvider
} from '@mantine/core';
import {
  IconSearch,
  IconCalendar,
  IconEye,
  IconPlus,
  IconFilter,
  IconSortAscending,
  IconSortDescending, IconEdit, IconHttpDelete
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { getPublicPosts } from '../api/post';
import { createImageDataUrl, createFallbackImage } from '../utils/imageUtils';
import { parseBackendDate } from '../utils/dateUtils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Layout, CreatePostForm } from '../components';
import { useAuth } from '../contexts/AuthContext';
import type { PostDto } from '../types';
import {usePosts} from "../contexts/PostsContext.tsx";

export const News: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { handleCloseForm, setPostEdit, setFormOpened, formOpened, deletePost, posts, setPosts } = usePosts()
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPost, setSelectedPost] = useState<PostDto | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const isAdmin = user?.userRole === 'ADMIN';

  const fetchPosts = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const data = await getPublicPosts({
        page: page - 1,
        size: 9,
        sort: [sortBy, sortOrder]
      });
      setPosts(data.posts);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Ошибка загрузки новостей:', error);
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortOrder]);

  useEffect(() => {
    if (!formOpened) {
      fetchPosts(1);
    }
  }, [fetchPosts, formOpened]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term) {
      const filtered = posts.filter(post => 
        post.title.toLowerCase().includes(term.toLowerCase()) ||
        post.description.toLowerCase().includes(term.toLowerCase())
      );
      setPosts(filtered);
    } else {
      fetchPosts(currentPage);
    }
  };

  const handleSort = (field: string) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const openPostModal = (post: PostDto) => {
    setSelectedPost(post);
    setModalOpened(true);
  };

  return (
    <Layout>
      <Container size="xl" py="xl">
        <Stack gap="xl">
          <Group justify="space-between">
            <Stack gap="xs">
              <Title order={1} size="3rem">
                Новости
              </Title>
              <Text size="lg" c="dimmed">
                Последние новости и события из мира фитнеса
              </Text>
            </Stack>
            {isAdmin && (
              <Button
                leftSection={<IconPlus size={18} />}
                onClick={handleCloseForm}
                size="lg"
              >
                Создать новость
              </Button>
            )}
          </Group>

          <Paper p="md" withBorder radius="md">
            <Grid align="flex-end">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  placeholder="Поиск новостей..."
                  leftSection={<IconSearch size={16} />}
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  size="md"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, md: 3 }}>
                <Select
                  placeholder="Сортировка"
                  data={[
                    { value: 'createdAt', label: 'По дате' },
                    { value: 'title', label: 'По названию' }
                  ]}
                  value={sortBy}
                  onChange={(value) => value && handleSort(value)}
                  size="md"
                  leftSection={<IconFilter size={16} />}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, md: 3 }}>
                <Button
                  variant="light"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  leftSection={sortOrder === 'asc' ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />}
                  size="md"
                  fullWidth
                >
                  {sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}
                </Button>
              </Grid.Col>
            </Grid>
          </Paper>

          {loading ? (
            <Center>
              <Loader size="lg" />
            </Center>
          ) : (
            <>
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
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '';
                      }}
                      onClick={() => openPostModal(post)}
                    >
                      <Card.Section>
                        {post.imageBase64 ? (
                          <Image
                            src={createImageDataUrl(post.imageBase64)}
                            alt={post.title}
                            height={200}
                            fit="cover"
                            fallbackSrc={createFallbackImage(400, 200)}
                          />
                        ) : (
                          <Box
                            h={200}
                            style={{
                              background: 'linear-gradient(135deg, var(--mantine-color-blue-1), var(--mantine-color-blue-0))',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <IconCalendar size={48} style={{ color: 'var(--mantine-color-blue-5)', opacity: 0.5 }} />
                          </Box>
                        )}
                      </Card.Section>

                      <Stack gap="md" mt="md">
                        <Stack gap="xs">
                          <Badge variant="light" color="blue" size="sm">
                            {format(parseBackendDate(post.createdAt), 'd MMMM yyyy', { locale: ru })}
                          </Badge>
                          <Title order={4} lineClamp={2}>
                            {post.title}
                          </Title>
                          <Text c="dimmed" size="sm" lineClamp={3}>
                            {post.description}
                          </Text>
                        </Stack>
                        
                        <Group justify="space-between" mt="auto">
                          <Button
                            variant="light"
                            size="sm"
                            leftSection={<IconEye size={16} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              openPostModal(post);
                            }}
                          >
                            Читать
                          </Button>
                          <Button
                              variant="light"
                              size="sm"
                              color="orange"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPostEdit(post);
                                setFormOpened(true);
                              }}
                          >
                            Редактировать
                          </Button>
                          <Button
                              variant="light"
                              size="sm"
                              color="red"
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePost(post.id);
                              }}
                          >
                            Удалить
                          </Button>
                        </Group>
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>

              {posts.length === 0 && (
                <Center>
                  <Stack align="center" gap="md">
                    <Text size="lg" c="dimmed">
                      Новости не найдены
                    </Text>
                    {searchTerm && (
                      <Button variant="light" onClick={() => handleSearch('')}>
                        Показать все новости
                      </Button>
                    )}
                  </Stack>
                </Center>
              )}

              {totalPages > 1 && (
                <Center>
                  <Pagination
                    total={totalPages}
                    value={currentPage}
                    onChange={fetchPosts}
                    size="lg"
                    radius="md"
                  />
                </Center>
              )}
            </>
          )}
        </Stack>
      </Container>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={selectedPost?.title}
        size="lg"
        centered
      >
        {selectedPost && (
          <Stack gap="md">
            {selectedPost.imageBase64 && (
              <Image
                src={createImageDataUrl(selectedPost.imageBase64)}
                alt={selectedPost.title}
                radius="md"
                fallbackSrc={createFallbackImage(600, 300)}
              />
            )}
            
            <Group>
              <Badge variant="light" color="blue">
                {format(parseBackendDate(selectedPost.createdAt), 'd MMMM yyyy в HH:mm', { locale: ru })}
              </Badge>
              {selectedPost.updatedAt && (
                <Badge variant="light" color="gray">
                  Обновлено: {format(parseBackendDate(selectedPost.updatedAt), 'd MMMM yyyy в HH:mm', { locale: ru })}
                </Badge>
              )}
            </Group>

            <Divider />

            <TypographyStylesProvider>
              <Text style={{ whiteSpace: 'pre-wrap' }}>
                {selectedPost.description}
              </Text>
            </TypographyStylesProvider>
          </Stack>
        )}
      </Modal>

       <CreatePostForm />
    </Layout>
  );
}; 