import React from 'react';
import { 
  Menu, 
  MenuItem, 
  ListItemIcon,
  Chip,
  Box,
  Typography
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { grayColor2 } from '@/constants/color';
import { AIModel } from './types';

interface AIModelSelectorProps {
  anchorEl: null | HTMLElement;
  isOpen: boolean;
  models: AIModel[];
  selectedModel: AIModel;
  onClose: () => void;
  onModelSelect: (model: AIModel) => void;
}

export default function AIModelSelector({ 
  anchorEl, 
  isOpen, 
  models, 
  selectedModel, 
  onClose, 
  onModelSelect 
}: AIModelSelectorProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'speed':
        return <SpeedIcon fontSize="small" sx={{ color: '#4ade80' }} />;
      case 'quality':
        return <AutoFixHighIcon fontSize="small" sx={{ color: '#8b5cf6' }} />;
      case 'reasoning':
        return <PsychologyIcon fontSize="small" sx={{ color: '#f59e0b' }} />;
      default:
        return <SmartToyIcon fontSize="small" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'speed':
        return '#4ade80';
      case 'quality':
        return '#8b5cf6';
      case 'reasoning':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: grayColor2,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          mt: 1,
          minWidth: 320,
          '& .MuiMenuItem-root': {
            color: 'white',
            py: 2,
            px: 3,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.05)'
            }
          }
        }
      }}
    >
      {models.map((model) => (
        <MenuItem 
          key={model.id}
          onClick={() => onModelSelect(model)}
          selected={selectedModel.id === model.id}
          sx={{
            flexDirection: 'column',
            alignItems: 'flex-start !important',
            gap: 1,
            '&.Mui-selected': {
              bgcolor: 'rgba(255, 255, 255, 0.08)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <ListItemIcon sx={{ minWidth: 'auto', color: getCategoryColor(model.category) }}>
              {getCategoryIcon(model.category)}
            </ListItemIcon>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {model.name}
                </Typography>
                {model.isLimited && (
                  <Chip 
                    label="Limited" 
                    size="small" 
                    sx={{ 
                      bgcolor: 'rgba(156, 163, 175, 0.2)',
                      color: '#9ca3af',
                      fontSize: '10px',
                      height: 18
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
                      fontSize: '10px',
                      height: 18
                    }} 
                  />
                )}
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '13px',
                  mb: 0.5
                }}
              >
                {model.description}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '12px'
                }}
              >
                ({model.provider})
              </Typography>
            </Box>
          </Box>
        </MenuItem>
      ))}
    </Menu>
  );
}