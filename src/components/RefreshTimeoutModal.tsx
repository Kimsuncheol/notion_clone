'use client';

import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface RefreshTimeoutModalProps {
  open: boolean;
  onRefresh: () => void;
  onClose?: () => void;
}

const RefreshTimeoutModal: React.FC<RefreshTimeoutModalProps> = ({ open, onRefresh, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="refresh-timeout-title">
      <DialogTitle id="refresh-timeout-title">Page loading timeout</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          The page is taking longer than expected to load. You can refresh to try again.
        </Typography>
      </DialogContent>
      <DialogActions>
        {onClose && (
          <Button onClick={onClose} color="inherit">
            Keep waiting
          </Button>
        )}
        <Button onClick={onRefresh} variant="contained" color="primary">
          Refresh
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RefreshTimeoutModal;


