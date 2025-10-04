'use client';

import React from 'react';
import {
  Box,
  Chip,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { AIModel } from './types';

interface AIModelSidebarProps {
  models: AIModel[];
  selectedModel: AIModel;
  onSelect: (model: AIModel) => void;
  disabled?: boolean;
  sx?: SxProps<Theme>;
}

const getCategoryIcon = (category: AIModel['category']) => {
  switch (category) {
    case 'speed':
      return <SpeedIcon fontSize="small" sx={{ color: '#4ade80' }} />;
    case 'quality':
      return <AutoFixHighIcon fontSize="small" sx={{ color: '#8b5cf6' }} />;
    case 'reasoning':
      return <PsychologyIcon fontSize="small" sx={{ color: '#f59e0b' }} />;
    default:
      return <SmartToyIcon fontSize="small" sx={{ color: '#6b7280' }} />;
  }
};

const getCategoryAccent = (category: AIModel['category']) => {
  switch (category) {
    case 'speed':
      return 'rgba(74, 222, 128, 0.18)';
    case 'quality':
      return 'rgba(139, 92, 246, 0.18)';
    case 'reasoning':
      return 'rgba(245, 158, 11, 0.18)';
    default:
      return 'rgba(107, 114, 128, 0.18)';
  }
};

export default function AIModelSidebar({
  models,
  selectedModel,
  onSelect,
  disabled = false,
  sx,
}: AIModelSidebarProps) {
  const rootSx: SxProps<Theme> = [
    {
      width: '100%',
      maxWidth: 280,
      display: { xs: 'none', md: 'flex' },
      flexDirection: 'column',
      gap: 3,
      bgcolor: 'rgba(7, 11, 23, 0.72)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: 4,
      padding: 3,
      boxShadow: '0px 18px 45px rgba(0, 0, 0, 0.35)',
      position: 'sticky',
      top: 32,
      alignSelf: 'flex-start',
    },
    ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
  ];

  return (
    <Box sx={rootSx}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography
          variant="overline"
          sx={{
            color: 'rgba(255, 255, 255, 0.5)',
            letterSpacing: '0.12em',
            fontSize: 11,
          }}
        >
          MODEL MENU
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 500,
            fontSize: 18,
          }}
        >
          Choose the right assistant
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.5 }}
        >
          Switch between available AI models to match speed, quality, or reasoning needs.
        </Typography>
      </Box>

      <List disablePadding component="nav" sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {models.map((model) => {
          const isSelected = model.id === selectedModel.id;

          return (
            <ListItemButton
              key={model.id}
              onClick={() => onSelect(model)}
              selected={isSelected}
              disabled={disabled}
              sx={{
                alignItems: 'flex-start',
                borderRadius: 3,
                bgcolor: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'background-color 180ms ease, border-color 180ms ease, transform 180ms ease',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.16)',
                  transform: disabled ? 'none' : 'translateX(4px)',
                },
                '&.Mui-disabled': {
                  bgcolor: 'rgba(255, 255, 255, 0.04)',
                  borderColor: 'rgba(255, 255, 255, 0.06)',
                  cursor: 'not-allowed',
                },
                '&.Mui-selected': {
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 1.5,
                  mt: 0.2,
                  bgcolor: getCategoryAccent(model.category),
                  borderRadius: '50%',
                  width: 34,
                  height: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getCategoryIcon(model.category)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.92)', fontSize: 16 }}>
                      {model.name}
                    </Typography>
                    {model.isLimited && (
                      <Chip
                        label="Limited"
                        size="small"
                        sx={{
                          bgcolor: 'rgba(156, 163, 175, 0.2)',
                          color: '#9ca3af',
                          fontSize: 10,
                          height: 18,
                        }}
                      />
                    )}
                    {model.isNew && (
                      <Chip
                        label="New"
                        size="small"
                        sx={{
                          bgcolor: 'rgba(34, 197, 94, 0.2)',
                          color: '#22c55e',
                          fontSize: 10,
                          height: 18,
                        }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: 13 }}>
                      {model.description}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 12 }}>
                      {model.provider}
                    </Typography>
                  </Box>
                }
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
