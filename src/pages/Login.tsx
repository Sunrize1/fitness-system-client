import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Container,
  Group,
  Anchor,
  Center,
  Box,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowLeft } from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => (!value ? 'Имя пользователя обязательно' : null),
      password: (value) => (!value ? 'Пароль обязателен' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      style={{ 
        minHeight: '100vh', 
        backgroundColor: 'var(--mantine-color-body)',
        padding: '0',
        margin: '0'
      }}
    >
      <Container size={460} py={40}>
        <Group justify="flex-start" mb="md">
          <Anchor component={Link} to="/" size="sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <IconArrowLeft size={16} />
            На главную
          </Anchor>
        </Group>
        
        <Title
          ta="center"
          style={{
            fontFamily: 'Greycliff CF, sans-serif',
            fontWeight: 900,
          }}
        >
          Добро пожаловать!
        </Title>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="Имя пользователя"
              placeholder="Ваше имя пользователя"
              required
              {...form.getInputProps('username')}
            />
            <PasswordInput
              label="Пароль"
              placeholder="Ваш пароль"
              required
              mt="md"
              {...form.getInputProps('password')}
            />
            <Button
              fullWidth
              mt="xl"
              type="submit"
              loading={loading}
              gradient={{ from: 'blue', to: 'cyan' }}
              variant="gradient"
            >
              Войти
            </Button>
          </form>
        </Paper>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Еще нет аккаунта?{' '}
          <Anchor component={Link} to="/register">
            Создать аккаунт
          </Anchor>
        </Text>
      </Container>
    </Box>
  );
}; 