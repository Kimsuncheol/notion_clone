'use client';
import React from 'react';
import { Box, Typography, IconButton, Chip, Stack } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

interface AttachedFilesListProps {
  selectedFiles: File[];
  onRemoveFile: (file: File) => void;
  onRemoveAllFiles: () => void;
}

const AttachedFilesList: React.FC<AttachedFilesListProps> = ({
  selectedFiles,
  onRemoveFile,
  onRemoveAllFiles,
}) => {
  if (selectedFiles.length === 0) {
    return null;
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon sx={{ fontSize: '16px', mr: 0.5 }} />;
    } else if (file.type === 'application/pdf') {
      return <PictureAsPdfIcon sx={{ fontSize: '16px', mr: 0.5 }} />;
    }
    return <InsertDriveFileIcon sx={{ fontSize: '16px', mr: 0.5 }} />;
  };

  const getFileSizeText = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" sx={{ color: '#a0aec0' }}>
          {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} attached
        </Typography>
        {selectedFiles.length > 1 && (
          <IconButton
            size="small"
            onClick={onRemoveAllFiles}
            sx={{ color: '#a0aec0', '&:hover': { color: 'white' } }}
          >
            <ClearIcon sx={{ fontSize: '14px' }} />
          </IconButton>
        )}
      </Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {selectedFiles.map((file, index) => (
          <Chip
            key={`${file.name}-${index}`}
            icon={getFileIcon(file)}
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="body2" sx={{ fontSize: '12px' }}>
                  {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '10px', opacity: 0.7 }}>
                  {getFileSizeText(file.size)}
                </Typography>
              </Box>
            }
            onDelete={() => onRemoveFile(file)}
            deleteIcon={<ClearIcon />}
            variant="outlined"
            sx={{
              color: 'white',
              borderColor: '#a0aec0',
              mb: 1,
              height: 'auto',
              '& .MuiChip-label': {
                padding: '8px 12px',
              },
              '& .MuiChip-deleteIcon': {
                color: '#a0aec0',
                '&:hover': {
                  color: '#f87171',
                },
              },
              cursor: 'pointer',
            }}
            onClick={() => {
              const fileUrl = URL.createObjectURL(file);
              window.open(fileUrl, '_blank');
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default AttachedFilesList; 