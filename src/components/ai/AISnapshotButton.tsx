import React from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';

interface AISnapshotButtonProps {
  onSnapshot: () => void;
  disabled?: boolean;
  isBusy?: boolean;
}

const AISnapshotButton: React.FC<AISnapshotButtonProps> = ({ onSnapshot, disabled = false, isBusy = false }) => {
  const isDisabled = disabled || isBusy;

  return (
    <Tooltip title={isDisabled ? 'Snapshot unavailable' : 'Download a snapshot of the current view'}>
      <span>
        <IconButton
          onClick={isDisabled ? undefined : onSnapshot}
          disabled={isDisabled}
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
          {isBusy ? (
            <CircularProgress size={20} sx={{ color: 'inherit' }} thickness={5} />
          ) : (
            <CameraAltOutlinedIcon fontSize="medium" sx={{ color: 'inherit' }} />
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default AISnapshotButton;
