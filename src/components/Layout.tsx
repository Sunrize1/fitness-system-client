import { 
  AppShell, 
  Group, 
  Button, 
  Text, 
  Menu, 
  Avatar, 
  Badge, 
  UnstyledButton,
  Box,
  Tooltip,
  Flex,
  Title,
  Stack
} from '@mantine/core';
import { ThemeToggle } from './ThemeToggle';
import { AITrainerButtonCustom } from './AITrainerButtonCustom';
import { 
  IconUser, 
  IconBarbell, 
  IconCalendarPlus, 
  IconCalendar, 
  IconUserPlus, 
  IconListCheck, 
  IconHome, 
  IconNews, 
  IconEdit, 
  IconSettings,
  IconLogout,
  IconChevronDown,
  IconDashboard
} from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <Tooltip label={label} position="bottom" withArrow>
    <UnstyledButton
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: active 
          ? 'var(--mantine-color-blue-filled)' 
          : 'transparent',
        color: active 
          ? 'white' 
          : 'var(--mantine-color-text)',
        transition: 'all 0.2s ease',
        fontWeight: active ? 600 : 500,
        fontSize: '14px'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'var(--mantine-color-default-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      {icon}
      <Text size="sm" fw={active ? 600 : 500} c={active ? 'white' : undefined}>{label}</Text>
    </UnstyledButton>
  </Tooltip>
);

export const Layout: React.FC<LayoutProps> = ({ children, showHeader = true }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { colorScheme } = useTheme();

  if (!showHeader) {
    return (
      <>
        {children}
        <AITrainerButtonCustom />
      </>
    );
  }

  const getRoleText = (role: string): string => {
    switch (role) {
      case "ADMIN": return "Администратор";
      case "TRAINER": return "Тренер"; 
      case "DEFAULT_USER": return "Пользователь";
      default: return "Пользователь";
    }
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case "ADMIN": return "red";
      case "TRAINER": return "yellow";
      case "DEFAULT_USER": return "blue";
      default: return "gray";
    }
  };

  return (
    <AppShell
      header={{ height: 70 }}
      padding="md"
    >
      <AppShell.Header style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
        <Group h="100%" px="xl" justify="space-between">
          <Group gap="md">
            <Stack gap={0}>
              <Title 
                order={3} 
                style={{ 
                  background: colorScheme === 'dark' 
                    ? 'linear-gradient(45deg, var(--mantine-color-blue-4), var(--mantine-color-purple-4))' 
                    : 'linear-gradient(45deg, var(--mantine-color-blue-6), var(--mantine-color-purple-6))',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  lineHeight: 1.2,
                  fontWeight: 700
                }}
              >
                FitSystem
              </Title>
              <Text size="xs" c="dimmed" style={{ lineHeight: 1 }}>
                Фитнес платформа
              </Text>
            </Stack>
          </Group>

          <Group gap="xs">
            <NavItem
              icon={<IconHome size={18} />}
              label="Главная"
              active={location.pathname === '/'}
              onClick={() => navigate('/')}
            />
            <NavItem
              icon={<IconNews size={18} />}
              label="Новости"
              active={location.pathname === '/news'}
              onClick={() => navigate('/news')}
            />

            {user && user.userRole === 'TRAINER' && (
              <>
                <NavItem
                  icon={<IconCalendar size={18} />}
                  label="Мои тренировки"
                  active={location.pathname === '/my-training-sessions'}
                  onClick={() => navigate('/my-training-sessions')}
                />
                <NavItem
                  icon={<IconBarbell size={18} />}
                  label="Упражнения"
                  active={location.pathname === '/exerciseConstructor'}
                  onClick={() => navigate('/exerciseConstructor')}
                />
                <NavItem
                  icon={<IconCalendarPlus size={18} />}
                  label="Создать тренировку"
                  active={location.pathname === '/create-training-session'}
                  onClick={() => navigate('/create-training-session')}
                />
              </>
            )}

            {user && user.userRole === 'DEFAULT_USER' && (
              <>
                <NavItem
                  icon={<IconUserPlus size={18} />}
                  label="Записаться"
                  active={location.pathname === '/available-training-sessions'}
                  onClick={() => navigate('/available-training-sessions')}
                />
                <NavItem
                  icon={<IconListCheck size={18} />}
                  label="Мои записи"
                  active={location.pathname === '/my-enrollments'}
                  onClick={() => navigate('/my-enrollments')}
                />
              </>
            )}

            {user && user.userRole === 'ADMIN' && (
              <>
                <NavItem
                  icon={<IconEdit size={18} />}
                  label="Создать пост"
                  active={location.pathname === '/admin/create-post'}
                  onClick={() => navigate('/admin/create-post')}
                />
                <NavItem
                  icon={<IconSettings size={18} />}
                  label="Управление"
                  active={location.pathname === '/admin/manage-users'}
                  onClick={() => navigate('/admin/manage-users')}
                />
              </>
            )}
          </Group>

          <Group gap="md">
            <ThemeToggle />
            
            {user ? (
                             <Menu 
                 shadow={colorScheme === 'dark' ? 'xl' : 'md'} 
                 width={280} 
                 position="bottom-end"
               >
                <Menu.Target>
                                     <UnstyledButton
                     style={{
                       padding: '6px 12px',
                       borderRadius: '8px',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '8px',
                       transition: 'background-color 0.2s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.backgroundColor = 'var(--mantine-color-default-hover)';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.backgroundColor = 'transparent';
                     }}
                   >
                                         <Avatar
                       size={32}
                       radius="xl"
                       src={user.avatarBase64}
                       style={{ border: '2px solid var(--mantine-color-default-border)' }}
                     />
                    <Box style={{ textAlign: 'left' }}>
                      <Text size="sm" fw={500}>
                        {user.firstname} {user.lastname}
                      </Text>
                      <Badge size="xs" color={getRoleColor(user.userRole)} variant="light">
                        {getRoleText(user.userRole)}
                      </Badge>
                    </Box>
                    <IconChevronDown size={16} />
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Профиль</Menu.Label>
                  <Menu.Item
                    leftSection={<IconUser size={16} />}
                    onClick={() => navigate('/profile')}
                  >
                    Мой профиль
                  </Menu.Item>
                  
                  <Menu.Divider />
                  
                  <Menu.Label>Аккаунт</Menu.Label>
                  <Menu.Item
                    leftSection={<IconLogout size={16} />}
                    color="red"
                    onClick={logout}
                  >
                    Выйти
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Group gap="sm">
                <Button 
                  variant="subtle" 
                  onClick={() => navigate('/login')}
                  size="sm"
                >
                  Войти
                </Button>
                <Button 
                  onClick={() => navigate('/register')}
                  size="sm"
                >
                  Регистрация
                </Button>
              </Group>
            )}
          </Group>
        </Group>
      </AppShell.Header>
      
             <AppShell.Main 
         style={{ 
           backgroundColor: colorScheme === 'dark' 
             ? 'var(--mantine-color-dark-7)' 
             : 'var(--mantine-color-gray-0)' 
         }}
       >
         {children}
         <AITrainerButtonCustom />
       </AppShell.Main>
    </AppShell>
  );
}; 