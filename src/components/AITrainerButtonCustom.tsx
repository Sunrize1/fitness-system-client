import React, { useState } from 'react';
import { ActionIcon, Tooltip, Box } from '@mantine/core';
import { AITrainerChat } from './AITrainerChat';
import robotIconUrl from '../assets/robot-svgrepo-com.svg';

export const AITrainerButtonCustom: React.FC = () => {
  const [chatOpened, setChatOpened] = useState(false);

  return (
    <>
      <Box
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
        }}
      >
        <Tooltip label="Спроси ИИ-Тренера" position="left">
          <ActionIcon
            size={60}
            radius="xl"
            variant="filled"
            color="blue"
            onClick={() => setChatOpened(true)}
            className="ai-trainer-button"
            style={{
              boxShadow: '0 4px 20px rgba(59, 130, 246, 0.5)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(59, 130, 246, 0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.5)';
            }}
          >
            <img 
              src={robotIconUrl} 
              alt="ИИ-Тренер" 
              width={32} 
              height={32}
            />
          </ActionIcon>
        </Tooltip>
      </Box>

      <AITrainerChat
        opened={chatOpened}
        onClose={() => setChatOpened(false)}
      />
    </>
  );
}; 