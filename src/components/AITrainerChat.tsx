import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  Paper,
  Stack,
  TextInput,
  Button,
  Text,
  Group,
  ScrollArea,
  Avatar,
  Box,
  ActionIcon,
  Loader,
  Center,
  Divider,
} from '@mantine/core';
import { IconSend, IconRobot, IconUser, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { aiTrainerApi } from '../api/aiTrainer';
import type { ChatMessage } from '../types';

interface AITrainerChatProps {
  opened: boolean;
  onClose: () => void;
}

export const AITrainerChat: React.FC<AITrainerChatProps> = ({ opened, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      text: 'Привет! 👋 Я твой персональный ИИ-тренер. Готов помочь тебе с тренировками, питанием и достижением фитнес-целей. О чём хочешь поговорить?',
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (opened && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [opened]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await aiTrainerApi.getAdvice({ message: inputValue.trim() });
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.advice,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось получить ответ от ИИ-тренера',
        color: 'red',
      });
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Извини, у меня временные проблемы с подключением. Попробуй задать вопрос позже! 😔',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        text: 'Привет! 👋 Я твой персональный ИИ-тренер. Готов помочь тебе с тренировками, питанием и достижением фитнес-целей. О чём хочешь поговорить?',
        isUser: false,
        timestamp: new Date(),
      }
    ]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <Avatar size="sm" radius="xl" color="blue">
            <IconRobot size={20} />
          </Avatar>
          <Text fw={600}>ИИ-Тренер</Text>
        </Group>
      }
      size="xl"
      centered
      styles={{
        content: {
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
        },
        body: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
        }
      }}
    >
      <Stack h="100%" gap={0}>
        <Box px="md" py="xs">
          <Group justify="flex-end">
            <ActionIcon 
              variant="subtle" 
              color="red" 
              size="sm"
              onClick={clearChat}
              title="Очистить чат"
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Box>

        <Divider />

        <ScrollArea 
          flex={1} 
          px="md" 
          py="sm"
          ref={scrollAreaRef}
          style={{ maxHeight: 'calc(80vh - 120px)' }}
        >
          <Stack gap="md">
            {messages.map((message, index) => (
              <Group 
                key={message.id} 
                align="flex-start" 
                gap="sm" 
                wrap="nowrap"
                style={{
                  animation: index === messages.length - 1 ? 'fadeInUp 0.3s ease both' : undefined,
                }}
              >
                <Avatar 
                  size="sm" 
                  radius="xl" 
                  color={message.isUser ? "green" : "blue"}
                  style={{ minWidth: 32, marginTop: 2 }}
                >
                  {message.isUser ? <IconUser size={16} /> : <IconRobot size={16} />}
                </Avatar>
                
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Paper 
                    p="sm" 
                    radius="lg"
                    bg={message.isUser ? 'blue.6' : undefined}
                    c={message.isUser ? 'white' : undefined}
                    style={{ 
                      maxWidth: '100%',
                      backgroundColor: message.isUser ? undefined : 'var(--mantine-color-default-hover)',
                    }}
                  >
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                      {message.text}
                    </Text>
                    <Text 
                      size="xs" 
                      opacity={0.7} 
                      mt="xs"
                      style={{ color: message.isUser ? 'rgba(255,255,255,0.8)' : undefined }}
                    >
                      {formatTime(message.timestamp)}
                    </Text>
                  </Paper>
                </Box>
              </Group>
            ))}
            
            {isLoading && (
              <Group align="flex-start" gap="sm" wrap="nowrap">
                <Avatar size="sm" radius="xl" color="blue" style={{ minWidth: 32, marginTop: 2 }}>
                  <IconRobot size={16} />
                </Avatar>
                <Paper 
                  p="sm" 
                  radius="lg"
                  style={{ backgroundColor: 'var(--mantine-color-default-hover)' }}
                >
                  <Center>
                    <Group gap="xs">
                      <Loader size="xs" />
                      <Text size="sm" c="dimmed">Думаю...</Text>
                    </Group>
                  </Center>
                </Paper>
              </Group>
            )}
          </Stack>
        </ScrollArea>

        <Divider />

        <Box p="md">
          <Group gap="xs" align="center">
            <TextInput
              ref={inputRef}
              flex={1}
              placeholder="Напиши свой вопрос..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              radius="xl"
              size="md"
              styles={{
                input: {
                  paddingRight: 50,
                }
              }}
            />
            <ActionIcon
              size="lg"
              radius="xl"
              variant="filled"
              color="blue"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              loading={isLoading}
            >
              <IconSend size={18} />
            </ActionIcon>
          </Group>
        </Box>
      </Stack>
    </Modal>
  );
}; 