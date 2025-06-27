import { AppShell, Flex, Group, NavLink } from '@mantine/core';
import { ThemeToggle } from './ThemeToggle';
import { IconUser, IconBarbell, IconCalendarPlus } from '@tabler/icons-react';
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
    return <>{children}</>;
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
              label="Профиль"
              leftSection={<IconUser size={18} />}
              active={location.pathname === '/profile'}
              onClick={() => navigate('/profile')}
              style={{ cursor: 'pointer' }}
            />
            {user?.userRole === 'TRAINER' && (
              <>
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
          </Flex>
          <Group px="md" justify="flex-end">
            <ThemeToggle />
          </Group>
        </Flex>
      </AppShell.Header>
      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}; 