import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface AIButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const AIButton: React.FC<AIButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <Tooltip title={disabled ? 'AI assistant unavailable' : 'Open AI markdown assistant'}>
      <span>
        <IconButton
          onClick={disabled ? undefined : onClick}
          disabled={disabled}
          size="small"
          sx={{
            bgcolor: 'rgba(79, 70, 229, 0.16)',
            color: '#c7d2fe',
            borderRadius: 2,
            '&:hover': {
              bgcolor: 'rgba(99, 102, 241, 0.25)',
            },
            '&.Mui-disabled': {
              bgcolor: 'rgba(148, 163, 184, 0.18)',
              color: 'rgba(226, 232, 240, 0.45)',
            },
          }}
        >
          <AutoAwesomeIcon fontSize="medium" sx={{ color: 'inherit' }} />
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default AIButton;
