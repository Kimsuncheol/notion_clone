'use client';
import React from 'react';
import { Box, Menu, MenuItem, Typography } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useGptModelStore, GptModel } from '@/store/gptModelStore';

const GptModelSelector: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { models, selectedModel, setSelectedModel } = useGptModelStore();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectModel = (model: GptModel) => {
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
        {/* <selectedModel.icon /> */}
        {/* <React.Fragment>
          {selectedModel.icon}
        </React.Fragment> */}
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
        {models.map((model) => (
          <MenuItem key={model.name} onClick={() => handleSelectModel(model)} sx={{
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }} id={`gpt-model-${model.title}`}>
            {React.cloneElement(model.icon)}
            <Typography variant="body2">{model.title}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default GptModelSelector; 