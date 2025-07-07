'use client';
import React, { useState } from 'react';
import { Box, Menu, MenuItem, Typography } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { SiGooglegemini, SiAnthropic, SiOpenai } from 'react-icons/si';

const gptModels = [
  { name: 'Gemini-2.5 pro', icon: <SiGooglegemini /> },
  { name: 'Claude-4.0 sonnet', icon: <SiAnthropic /> },
  { name: 'GPT-4.5', icon: <SiOpenai /> },
];

const GptModelSelector: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedModel, setSelectedModel] = useState(gptModels[0]);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectModel = (model: typeof gptModels[0]) => {
    setSelectedModel(model);
    handleClose();
  };

  return (
    <Box>
      <Box
        onClick={handleClick}
        sx={{
          color: 'white',
          backgroundColor: '#4a5568',
          textTransform: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1,
          fontSize: '16px',
          gap: 2,
          borderRadius: '10px',
          '&:hover': {
            backgroundColor: '#5a6678',
            cursor: 'pointer',
          },
        }}
      >
        <SmartToyIcon sx={{ fontSize: 16 }} />
        {selectedModel.icon}
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'gpt-model-button',
        }}
        sx={{
          cursor: 'pointer',
          mt: 3,
          '& .MuiPaper-root': {
            backgroundColor: '#4a5568',
            color: 'white',
          },
        }}
      >
        {gptModels.map((model) => (
          <MenuItem key={model.name} onClick={() => handleSelectModel(model)} sx={{
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}>
            {model.icon}
            <Typography variant="body2">{model.name}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default GptModelSelector; 