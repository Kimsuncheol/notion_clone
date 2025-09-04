import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Typography,
  Button,
  Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LeaveComments from './LeaveComments';
import { mintColor1 } from '@/constants/color';
import { Comment } from '@/types/firebase';
import { Timestamp } from 'firebase/firestore';

interface CommentsSectionProps {
  comments: Comment[];
  pageId: string;
}

export default function CommentsSection({ comments, pageId }: CommentsSectionProps) {

  return (
    <Box sx={{
      color: 'white',
      p: 3,
    }}>
      {comments.map((comment, index) => (
        <CommentItem key={comment.id} comment={comment} isLastComment={index === comments.length - 1} pageId={pageId} />
      ))}
    </Box>
  );
}

const formatDate = (date: Date | Timestamp): string => {
  if (date instanceof Date) {
    return date.toLocaleDateString();
  }
  if (date instanceof Timestamp) {
    return date.toDate().toLocaleDateString();
  }
  if (typeof date === 'string' || typeof date === 'number') {
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString();
    }
  }
  return 'Invalid date';
};

function CommentItem({ comment, isLastComment, pageId }: { comment: Comment, isLastComment?: boolean, pageId: string }) {
  const [showReply, setShowReply] = useState(false);
  const iconStyle = { fontSize: '12px', color: mintColor1 }
  return (
    <Box sx={{
      color: 'white',
      p: 3,
    }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Avatar sx={{
          bgcolor: '#666',
          width: 48,
          height: 48
        }}>
          <PersonIcon />
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="h6" sx={{
              fontWeight: 600,
              fontSize: '16px'
            }}>
              {comment.author}
            </Typography>
          </Box>

          <Typography variant="body2" sx={{
            color: '#aaa',
            mb: 2,
            fontSize: '14px'
          }}>
            {formatDate(comment.createdAt)}
          </Typography>

          <Typography variant="body1" sx={{
            mb: 2,
            lineHeight: 1.6,
            fontSize: '15px'
          }}>
            {comment.content}
          </Typography>

          {/* Show/Hide Reply Button */}
          { !comment.parentCommentId && (
            <Button
              variant="text"
              onClick={() => {
                setShowReply(!showReply);
              }}
              startIcon={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: `1px solid ${mintColor1}`, p: 0.25 }}>
                  {showReply ? <RemoveIcon sx={iconStyle} /> : <AddIcon sx={iconStyle} />}
                </Box>
              }
              sx={{
                color: mintColor1,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '14px',
                p: 0,
                minWidth: 'auto',
                '&:hover': {
                  bgcolor: 'transparent',
                  color: 'white'
                }
              }}
            >
              {showReply ? 'Hide' : 'Show'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Render nested replies */}
      {comment.comments && comment.comments.map((reply, index) => (
        <Box key={reply.id} sx={{ ml: 6, mb: 2 }}>
          <CommentItem comment={reply} isLastComment={index === comment!.comments!.length - 1} pageId={pageId} />
        </Box>
      ))}

      {showReply && (
        <Box sx={{ mb: 4 }}>
          <LeaveComments isReply={showReply} onCancel={() => setShowReply(false)} pageId={pageId} commentsCount={0} />
        </Box>
      )}
      {!isLastComment && <Divider sx={{ bgcolor: '#333', mb: 4 }} />}
    </Box>
  )
}