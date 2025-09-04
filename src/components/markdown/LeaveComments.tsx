import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { grayColor10, mintColor1, mintColor2 } from '@/constants/color';
import { leaveComment, replyToComment } from '@/services/markdown/firebase';

interface LeaveCommentsProps {
  pageId: string;
  commentsCount: number;
  isReply?: boolean;
  onCancel?: () => void;
}

export default function LeaveComments({ pageId, commentsCount, isReply, onCancel }: LeaveCommentsProps) {
  const [comment, setComment] = useState('');

  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      return;
    }
    try {
      await leaveComment(pageId, comment);
      setComment('');
    } catch (error) {
      console.error('Failed to leave comment:', error);
    }
  };

  return (
    <Box sx={{ color: 'white' }}>
      {/* Header */}
      {!isReply && (
        <Typography
          variant="h6"
          sx={{
            fontSize: '18px',
            fontWeight: 500,
            color: 'white',
            mb: 2
          }}
        >
          {commentsCount} comments
        </Typography>
      )}

      {/* Comment input container */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          multiline
          rows={4}
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a comment..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmitComment();
            }
          }}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: grayColor10,
              color: 'white',
              borderRadius: '4px',
              '& fieldset': { borderColor: '#374151' },
              '&:hover fieldset': { borderColor: '#4b5563' },
              '&.Mui-focused fieldset': { borderColor: '#4b5563' },
            },
            '& .MuiInputBase-input': {
              color: 'white',
              padding: '8px',
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#9ca3af',
              opacity: 1,
            }
          }}
        />

        {/* Submit button positioned in bottom right */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          {isReply && (
            <Button
              variant="text"
              onClick={onCancel}
              sx={{
                color: mintColor1,
                backgroundColor: 'transparent',
                px: 2,
                py: 1,
                width: 'fit-content',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleSubmitComment}
            sx={{
              backgroundColor: mintColor1,
              color: 'black',
              px: 2,
              py: 1,
              width: 'fit-content',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { backgroundColor: mintColor2 },
              transition: 'background-color 0.2s ease-in-out'
            }}
          >
            Comment
          </Button>
        </Box>
      </Box>
    </Box>
  );
}