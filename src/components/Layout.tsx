import { AppShell, Group } from '@mantine/core';
import { ThemeToggle } from './ThemeToggle';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showHeader = true }) => {
  if (!showHeader) {
    return <>{children}</>;
  }

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="flex-end">
          <ThemeToggle />
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}; 