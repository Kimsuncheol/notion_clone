import React, { useState } from 'react';
import { Box, TextField, Button, Typography, SxProps, Theme } from '@mui/material';
import { grayColor10, mintColor1, mintColor2 } from '@/constants/color';
import { leaveComment, replyToComment } from '@/services/markdown/firebase';

interface LeaveCommentsProps {
  pageId: string;
  commentsCount?: number;
  initialComment?: string;
  isReply?: boolean;
  isEditing?: boolean;
  parentCommentId?: string;
  onCancel?: () => void;
  canInteract?: boolean;
  // onCancel?: () => void;
}

export default function LeaveComments({
  pageId,
  commentsCount,
  initialComment,
  isReply,
  isEditing,
  parentCommentId,
  onCancel,
  canInteract = true,
}: LeaveCommentsProps) {
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
      {(!isReply && !isEditing) && (
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
          value={initialComment || comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a comment..."
          disabled={!canInteract}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              console.log('parentCommentId', parentCommentId);
              if (!canInteract) return;
              if (isReply) {
                replyToComment(pageId, parentCommentId!, comment);
              } else {
                handleSubmitComment();
              }
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
          {(isReply || isEditing) && (
            <LeaveCommentsButton
              variant="text"
              onClick={onCancel!}
              sx={{
                color: mintColor1,
                backgroundColor: 'transparent',
                px: 2,
                py: 1,
                width: 'fit-content',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'none'
              }}
              text="Cancel"
            />
          )}
          <LeaveCommentsButton
            variant="contained"
            onClick={() => {
              if (!canInteract) return;
              if (isReply) {
                replyToComment(pageId, parentCommentId!, comment);
              } else {
                handleSubmitComment();
              }
              onCancel?.();
            }}
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
            disabled={!canInteract}
            text={isReply ? 'Reply' : isEditing ? 'Update' : 'Comment'}
          />
        </Box>
      </Box>
    </Box>
  );
}

interface LeaveCommentsButtonProps {
  variant: 'contained' | 'text';
  onClick: () => void;
  sx: SxProps<Theme>;
  text: string;
}
function LeaveCommentsButton({ variant, onClick, sx, text }: LeaveCommentsButtonProps) {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      sx={sx}
    >
      {text}
    </Button>
  )
}