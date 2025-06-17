import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserDto } from '../types';
import { userApi } from '../api/user';
import { notifications } from '@mantine/notifications';

interface AuthContextType {
  user: UserDto | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    firstname: string;
    lastname: string;
    password: string;
    gender: 'MALE' | 'FEMALE';
  }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const refreshProfile = async () => {
    try {
      const profile = await userApi.getMyProfile();
      setUser(profile);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshProfile().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await userApi.login({ username, password });
      localStorage.setItem('token', response.token);
      await refreshProfile();
      notifications.show({
        title: 'Успешный вход',
        message: 'Добро пожаловать!',
        color: 'green',
      });
      navigate('/profile');
    } catch (error) {
      notifications.show({
        title: 'Ошибка входа',
        message: 'Неверное имя пользователя или пароль',
        color: 'red',
      });
      throw error;
    }
  };

  const register = async (data: {
    username: string;
    firstname: string;
    lastname: string;
    password: string;
    gender: 'MALE' | 'FEMALE';
  }) => {
    try {
      const response = await userApi.register(data);
      localStorage.setItem('token', response.token);
      await refreshProfile();
      notifications.show({
        title: 'Успешная регистрация',
        message: 'Добро пожаловать в систему!',
        color: 'green',
      });
      navigate('/profile');
    } catch (error) {
      notifications.show({
        title: 'Ошибка регистрации',
        message: 'Не удалось зарегистрировать пользователя',
        color: 'red',
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
    notifications.show({
      title: 'Выход',
      message: 'Вы вышли из системы',
      color: 'blue',
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 