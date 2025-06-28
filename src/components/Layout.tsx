import { AppShell, Flex, Group, NavLink } from '@mantine/core';
import { ThemeToggle } from './ThemeToggle';
import { AITrainerButtonCustom } from './AITrainerButtonCustom';
import { IconUser, IconBarbell, IconCalendarPlus, IconCalendar, IconUserPlus, IconListCheck, IconHome, IconNews } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showHeader = true }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!showHeader) {
    return (
      <>
        {children}
        <AITrainerButtonCustom />
      </>
    );
  }

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Flex direction='row' justify='space-between' h="100%">
          <Flex direction='row'>
            <NavLink
              label="Главная"
              leftSection={<IconHome size={18} />}
              active={location.pathname === '/'}
              onClick={() => navigate('/')}
              style={{ cursor: 'pointer' }}
            />
            <NavLink
              label="Новости"
              leftSection={<IconNews size={18} />}
              active={location.pathname === '/news'}
              onClick={() => navigate('/news')}
              style={{ cursor: 'pointer' }}
            />
            <NavLink
              label="Профиль"
              leftSection={<IconUser size={18} />}
              active={location.pathname === '/profile'}
              onClick={() => navigate('/profile')}
              style={{ cursor: 'pointer' }}
            />
            {user && user.userRole === 'TRAINER' && (
              <>
                <NavLink
                  label="Мои тренировки"
                  leftSection={<IconCalendar size={18} />}
                  active={location.pathname === '/my-training-sessions'}
                  onClick={() => navigate('/my-training-sessions')}
                  style={{ cursor: 'pointer' }}
                />
                <NavLink
                  label="Упражнения"
                  leftSection={<IconBarbell size={18} />}
                  active={location.pathname === '/exerciseConstructor'}
                  onClick={() => navigate('/exerciseConstructor')}
                  style={{ cursor: 'pointer' }}
                />
                <NavLink
                  label="Создать тренировку"
                  leftSection={<IconCalendarPlus size={18} />}
                  active={location.pathname === '/create-training-session'}
                  onClick={() => navigate('/create-training-session')}
                  style={{ cursor: 'pointer' }}
                />
              </>
            )}
            {user && user.userRole === 'DEFAULT_USER' && (
              <>
                <NavLink
                  label="Записаться на тренировку"
                  leftSection={<IconUserPlus size={18} />}
                  active={location.pathname === '/available-training-sessions'}
                  onClick={() => navigate('/available-training-sessions')}
                  style={{ cursor: 'pointer' }}
                />
                <NavLink
                  label="Мои записи"
                  leftSection={<IconListCheck size={18} />}
                  active={location.pathname === '/my-enrollments'}
                  onClick={() => navigate('/my-enrollments')}
                  style={{ cursor: 'pointer' }}
                />
              </>
            )}
            {user && user.userRole === 'ADMIN' && (
              <>
                <NavLink
                  label="Мои тренировки"
                  leftSection={<IconCalendar size={18} />}
                  active={location.pathname === '/my-training-sessions'}
                  onClick={() => navigate('/my-training-sessions')}
                  style={{ cursor: 'pointer' }}
                />
                <NavLink
                  label="Упражнения"
                  leftSection={<IconBarbell size={18} />}
                  active={location.pathname === '/exerciseConstructor'}
                  onClick={() => navigate('/exerciseConstructor')}
                  style={{ cursor: 'pointer' }}
                />
                <NavLink
                  label="Создать тренировку"
                  leftSection={<IconCalendarPlus size={18} />}
                  active={location.pathname === '/create-training-session'}
                  onClick={() => navigate('/create-training-session')}
                  style={{ cursor: 'pointer' }}
                />
                <NavLink
                  label="Записаться на тренировку"
                  leftSection={<IconUserPlus size={18} />}
                  active={location.pathname === '/available-training-sessions'}
                  onClick={() => navigate('/available-training-sessions')}
                  style={{ cursor: 'pointer' }}
                />
                <NavLink
                  label="Мои записи"
                  leftSection={<IconListCheck size={18} />}
                  active={location.pathname === '/my-enrollments'}
                  onClick={() => navigate('/my-enrollments')}
                  style={{ cursor: 'pointer' }}
                />
              </>
            )}
          </Flex>
          <Group px="md" justify="flex-end">
            <ThemeToggle />
          </Group>
        </Flex>
      </AppShell.Header>
      <AppShell.Main>
        {children}
        <AITrainerButtonCustom />
      </AppShell.Main>
    </AppShell>
  );
}; 