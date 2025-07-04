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
  Stack,
  Burger,
  Drawer,
  ScrollArea,
  Divider,
  NavLink
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
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
  IconDashboard,
  IconBuilding,
  IconChartBar,
  IconCreditCard
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
  compact?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick, compact = false }) => (
  <Tooltip label={compact ? label : undefined} position="bottom" withArrow disabled={!compact}>
    <UnstyledButton
      onClick={onClick}
      style={{
        padding: compact ? '8px' : '8px 16px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: compact ? 'center' : 'flex-start',
        gap: compact ? '0' : '8px',
        backgroundColor: active 
          ? 'var(--mantine-color-blue-filled)' 
          : 'transparent',
        color: active 
          ? 'white' 
          : 'var(--mantine-color-text)',
        transition: 'all 0.2s ease',
        fontWeight: active ? 600 : 500,
        fontSize: '14px',
        minWidth: compact ? '40px' : 'auto',
        minHeight: '40px'
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
      {!compact && (
        <Text size="sm" fw={active ? 600 : 500} c={active ? 'white' : undefined}>
          {label}
        </Text>
      )}
    </UnstyledButton>
  </Tooltip>
);

interface MobileNavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({ icon, label, active, onClick }) => (
  <NavLink
    leftSection={icon}
    label={label}
    active={active}
    onClick={onClick}
    style={{
      borderRadius: '8px',
      marginBottom: '4px'
    }}
  />
);

export const Layout: React.FC<LayoutProps> = ({ children, showHeader = true }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { colorScheme } = useTheme();
  const [opened, { toggle, close }] = useDisclosure(false);
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1200px)');

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

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      close();
    }
  };

  const renderNavItems = (mobile = false) => {
    const NavComponent = mobile ? MobileNavItem : NavItem;
    const compact = isTablet && !isMobile;

    return (
      <>
        <NavComponent
          icon={<IconHome size={18} />}
          label="Главная"
          active={location.pathname === '/'}
          onClick={() => handleNavigation('/')}
          {...(!mobile && { compact })}
        />
        <NavComponent
          icon={<IconNews size={18} />}
          label="Новости"
          active={location.pathname === '/news'}
          onClick={() => handleNavigation('/news')}
          {...(!mobile && { compact })}
        />

        {user && user.userRole === 'TRAINER' && (
          <>
            <NavComponent
              icon={<IconCalendar size={18} />}
              label="Мои тренировки"
              active={location.pathname === '/my-training-sessions'}
              onClick={() => handleNavigation('/my-training-sessions')}
              {...(!mobile && { compact })}
            />
            <NavComponent
              icon={<IconBarbell size={18} />}
              label="Упражнения"
              active={location.pathname === '/exerciseConstructor'}
              onClick={() => handleNavigation('/exerciseConstructor')}
              {...(!mobile && { compact })}
            />
            <NavComponent
              icon={<IconCalendarPlus size={18} />}
              label="Создать тренировку"
              active={location.pathname === '/create-training-session'}
              onClick={() => handleNavigation('/create-training-session')}
              {...(!mobile && { compact })}
            />
            <NavComponent
              icon={<IconUserPlus size={18} />}
              label="Заявки"
              active={location.pathname === '/trainer-enrollment-requests'}
              onClick={() => handleNavigation('/trainer-enrollment-requests')}
              {...(!mobile && { compact })}
            />
          </>
        )}

        {user && user.userRole === 'DEFAULT_USER' && (
          <>
            <NavComponent
              icon={<IconUserPlus size={18} />}
              label="Записаться"
              active={location.pathname === '/available-training-sessions'}
              onClick={() => handleNavigation('/available-training-sessions')}
              {...(!mobile && { compact })}
            />
            <NavComponent
              icon={<IconListCheck size={18} />}
              label="Мои записи"
              active={location.pathname === '/my-enrollments'}
              onClick={() => handleNavigation('/my-enrollments')}
              {...(!mobile && { compact })}
            />
          </>
        )}

        {user && user.userRole === 'ADMIN' && (
          <>
            <NavComponent
              icon={<IconEdit size={18} />}
              label="Создать пост"
              active={location.pathname === '/admin/create-post'}
              onClick={() => handleNavigation('/admin/create-post')}
              {...(!mobile && { compact })}
            />
            <NavComponent
              icon={<IconSettings size={18} />}
              label="Пользователи"
              active={location.pathname === '/admin/manage-users'}
              onClick={() => handleNavigation('/admin/manage-users')}
              {...(!mobile && { compact })}
            />
            <NavComponent
              icon={<IconBuilding size={18} />}
              label="Залы"
              active={location.pathname === '/admin/manage-gyms'}
              onClick={() => handleNavigation('/admin/manage-gyms')}
              {...(!mobile && { compact })}
            />
            <NavComponent
              icon={<IconCreditCard size={18} />}
              label="Абонементы"
              active={location.pathname === '/admin/manage-subscriptions'}
              onClick={() => handleNavigation('/admin/manage-subscriptions')}
              {...(!mobile && { compact })}
            />
            <NavComponent
              icon={<IconChartBar size={18} />}
              label="Статистика"
              active={location.pathname === '/admin/statistics'}
              onClick={() => handleNavigation('/admin/statistics')}
              {...(!mobile && { compact })}
            />
          </>
        )}
      </>
    );
  };

  return (
    <>
      <AppShell
        header={{ height: 70 }}
        padding="md"
      >
        <AppShell.Header style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
          <Group h="100%" px={isMobile ? "md" : "xl"} justify="space-between">
            <Group gap="md">
              {isMobile && (
                <Burger
                  opened={opened}
                  onClick={toggle}
                  hiddenFrom="sm"
                  size="sm"
                />
              )}
              <Stack gap={0}>
                <Title 
                  order={isMobile ? 4 : 3} 
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
                {!isMobile && (
                  <Text size="xs" c="dimmed" style={{ lineHeight: 1 }}>
                    Фитнес платформа
                  </Text>
                )}
              </Stack>
            </Group>

            {!isMobile && (
              <Group gap="xs">
                {renderNavItems()}
              </Group>
            )}

            <Group gap={isMobile ? "xs" : "md"}>
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
                        gap: isMobile ? '4px' : '8px',
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
                      {!isMobile && (
                        <Box style={{ textAlign: 'left' }}>
                          <Text size="sm" fw={500}>
                            {user.firstname} {user.lastname}
                          </Text>
                          <Badge size="xs" color={getRoleColor(user.userRole)} variant="light">
                            {getRoleText(user.userRole)}
                          </Badge>
                        </Box>
                      )}
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
                    size={isMobile ? "xs" : "sm"}
                  >
                    Войти
                  </Button>
                  <Button 
                    onClick={() => navigate('/register')}
                    size={isMobile ? "xs" : "sm"}
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

      <Drawer
        opened={opened}
        onClose={close}
        title="Навигация"
        padding="md"
        size="300px"
        zIndex={1000000}
      >
        <ScrollArea h="calc(100vh - 80px)">
          <Stack gap="sm">
            {renderNavItems(true)}
            
            {user && (
              <>
                <Divider my="md" />
                <Group>
                  <Avatar
                    size="sm"
                    radius="xl"
                    src={user.avatarBase64}
                  />
                  <Box>
                    <Text size="sm" fw={500}>
                      {user.firstname} {user.lastname}
                    </Text>
                    <Badge size="xs" color={getRoleColor(user.userRole)} variant="light">
                      {getRoleText(user.userRole)}
                    </Badge>
                  </Box>
                </Group>
                
                <MobileNavItem
                  icon={<IconUser size={18} />}
                  label="Мой профиль"
                  active={location.pathname === '/profile'}
                  onClick={() => handleNavigation('/profile')}
                />
                
                <Divider my="sm" />
                
                <UnstyledButton
                  onClick={logout}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    color: 'var(--mantine-color-red-6)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%'
                  }}
                >
                  <IconLogout size={18} />
                  <Text size="sm">Выйти</Text>
                </UnstyledButton>
              </>
            )}
          </Stack>
        </ScrollArea>
      </Drawer>
    </>
  );
}; 