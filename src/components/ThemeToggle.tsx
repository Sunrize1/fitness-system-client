import { ActionIcon, Tooltip, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'filled' | 'light' | 'outline' | 'transparent' | 'white' | 'subtle';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  size = 'md', 
  variant = 'light' 
}) => {
  const { colorScheme, toggleColorScheme } = useTheme();
  const { setColorScheme } = useMantineColorScheme();

  const handleToggle = () => {
    toggleColorScheme();
    const newScheme = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(newScheme);
  };

  const isDark = colorScheme === 'dark';

  return (
    <Tooltip
      label={isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
      position="bottom"
      withArrow
    >
      <ActionIcon
        onClick={handleToggle}
        variant={variant}
        size={size}
        style={{
          transition: 'all 0.3s ease',
          transform: 'scale(1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isDark ? (
          <IconSun 
            size={size === 'sm' ? 16 : size === 'md' ? 18 : size === 'lg' ? 20 : 24} 
            style={{ 
              transition: 'all 0.3s ease',
              filter: 'drop-shadow(0 0 6px rgba(255, 193, 7, 0.6))'
            }} 
          />
        ) : (
          <IconMoon 
            size={size === 'sm' ? 16 : size === 'md' ? 18 : size === 'lg' ? 20 : 24} 
            style={{ 
              transition: 'all 0.3s ease',
              filter: 'drop-shadow(0 0 6px rgba(74, 144, 226, 0.6))'
            }} 
          />
        )}
      </ActionIcon>
    </Tooltip>
  );
}; 