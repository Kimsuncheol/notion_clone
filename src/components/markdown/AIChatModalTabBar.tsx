'use client';

import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import MenuBookIcon from '@mui/icons-material/MenuBook';

interface AIChatModalTabBarProps {
  activeTab: number;
  onTabChange: (newTab: number) => void;
}

export default function AIChatModalTabBar({ activeTab, onTabChange }: AIChatModalTabBarProps) {
  return (
    <Box
      sx={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        bgcolor: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => onTabChange(newValue)}
        sx={{
          px: 3,
          minHeight: 60,
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          },
        }}
      >
        <Tab
          icon={<ChatIcon sx={{ fontSize: 20 }} />}
          iconPosition="start"
          label="Writing Assistant"
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            minHeight: 60,
            fontSize: '0.95rem',
            fontWeight: 500,
            textTransform: 'none',
            '&.Mui-selected': {
              color: 'white',
            },
            '&:hover': {
              color: 'rgba(255, 255, 255, 0.9)',
              bgcolor: 'rgba(255, 255, 255, 0.03)',
            },
          }}
        />
        <Tab
          icon={<MenuBookIcon sx={{ fontSize: 20 }} />}
          iconPosition="start"
          label="Markdown Assistant"
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            minHeight: 60,
            fontSize: '0.95rem',
            fontWeight: 500,
            textTransform: 'none',
            '&.Mui-selected': {
              color: 'white',
            },
            '&:hover': {
              color: 'rgba(255, 255, 255, 0.9)',
              bgcolor: 'rgba(255, 255, 255, 0.03)',
            },
          }}
        />
      </Tabs>
    </Box>
  );
}
