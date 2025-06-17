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
  Select,
  Anchor,
  Progress,
  Box,
  Group,
  Center,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';

function PasswordStrength({ value }: { value: string }) {
  const requirements = [
    { re: /.{6,}/, label: 'Минимум 6 символов' },
    { re: /[0-9]/, label: 'Содержит цифру' },
    { re: /[a-z]/, label: 'Содержит строчную букву' },
    { re: /[A-Z]/, label: 'Содержит заглавную букву' },
  ];

  function getStrength(password: string) {
    let multiplier = password.length > 5 ? 0 : 1;

    requirements.forEach((requirement) => {
      if (!requirement.re.test(password)) {
        multiplier += 1;
      }
    });

    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 0);
  }

  const strength = getStrength(value);

  function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
    return (
      <Text color={meets ? 'teal' : 'red'} mt={5} size="sm">
        <Center inline>
          {meets ? <IconCheck size={14} stroke={1.5} /> : <IconX size={14} stroke={1.5} />}
          <Box ml={7}>{label}</Box>
        </Center>
      </Text>
    );
  }

  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(value)}
    />
  ));
  const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';

  return (
    <>
      <Progress color={color} value={strength} size={5} mb="xs" />
      {checks}
    </>
  );
}

export const Register = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const form = useForm({
    initialValues: {
      username: '',
      firstname: '',
      lastname: '',
      password: '',
      confirmPassword: '',
      gender: '',
    },
    validate: {
      username: (value) => (!value ? 'Имя пользователя обязательно' : null),
      firstname: (value) => (!value ? 'Имя обязательно' : null),
      lastname: (value) => (!value ? 'Фамилия обязательна' : null),
      password: (value) => (value.length < 6 ? 'Пароль должен быть минимум 6 символов' : null),
      confirmPassword: (value, values) =>
        value !== values.password ? 'Пароли не совпадают' : null,
      gender: (value) => (!value ? 'Выберите пол' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      await register({
        username: values.username,
        firstname: values.firstname,
        lastname: values.lastname,
        password: values.password,
        gender: values.gender as 'MALE' | 'FEMALE',
      });
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={460} my={30}>
      <Title
        ta="center"
        style={{
          fontFamily: 'Greycliff CF, sans-serif',
          fontWeight: 900,
        }}
      >
        Создать аккаунт
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Уже есть аккаунт?{' '}
        <Anchor component={Link} to="/login">
          Войти
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Имя пользователя"
            placeholder="Выберите имя пользователя"
            required
            {...form.getInputProps('username')}
          />
          <Group grow mt="md">
            <TextInput
              label="Имя"
              placeholder="Ваше имя"
              required
              {...form.getInputProps('firstname')}
            />
            <TextInput
              label="Фамилия"
              placeholder="Ваша фамилия"
              required
              {...form.getInputProps('lastname')}
            />
          </Group>
          <Select
            label="Пол"
            placeholder="Выберите пол"
            required
            mt="md"
            data={[
              { value: 'MALE', label: 'Мужской' },
              { value: 'FEMALE', label: 'Женский' },
            ]}
            {...form.getInputProps('gender')}
          />
          <PasswordInput
            label="Пароль"
            placeholder="Создайте пароль"
            required
            mt="md"
            {...form.getInputProps('password')}
          />
          {form.values.password && (
            <Box mt="xs">
              <PasswordStrength value={form.values.password} />
            </Box>
          )}
          <PasswordInput
            label="Подтвердите пароль"
            placeholder="Повторите пароль"
            required
            mt="md"
            {...form.getInputProps('confirmPassword')}
          />
          <Button
            fullWidth
            mt="xl"
            type="submit"
            loading={loading}
            gradient={{ from: 'teal', to: 'blue' }}
            variant="gradient"
          >
            Зарегистрироваться
          </Button>
        </form>
      </Paper>
    </Container>
  );
}; 