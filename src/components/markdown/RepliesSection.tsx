import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { Comment } from '@/types/firebase';
import { Timestamp } from 'firebase/firestore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MoreoptionsModal from './MoreoptionsModal';
import LeaveComments from './LeaveComments';
import { useMarkdownStore } from '@/store/markdownEditorContentStore';

interface RepliesSectionProps {
  replies: Comment[];
  pageId: string;
  parentCommentId: string;
}

export default function RepliesSection({ replies, pageId, parentCommentId }: RepliesSectionProps) {
  return (
    <Box sx={{
      color: 'white',
      py: 3,
    }}>
      {replies.map((reply, index) => (
        <RepliesSectionItem
          key={reply.id}
          reply={reply}
          isLastReply={index === replies.length - 1}
          pageId={pageId}
          parentCommentId={parentCommentId}
        />
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

interface RepliesSectionItemProps {
  reply: Comment;
  isLastReply?: boolean;
  parentCommentId: string;
  pageId: string;
}

function RepliesSectionItem({ reply, isLastReply, parentCommentId, pageId }: RepliesSectionItemProps) {
  const [showMoreOptionsModal, setShowMoreOptionsModal] = useState<boolean>(false);
  const { isBeingEditedReplyId, handleEditStateSetter } = useMarkdownStore();

  return (
    <Box sx={{
      color: 'white',
      py: 3,
      position: 'relative',
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
          {/* reply author and more options */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6" sx={{
              fontWeight: 600,
              fontSize: '16px'
            }}>
              {reply.author}
            </Typography>
            <IconButton sx={{
              color: 'white',
              '&:hover': {
                bgcolor: 'transparent',
                color: 'white'
              }
            }} onClick={() => setShowMoreOptionsModal(true)}>
              <MoreVertIcon />
            </IconButton>
            {showMoreOptionsModal && (
              <MoreoptionsModal
                noteId={pageId}
                commentId={parentCommentId}
                replyId={reply.id}
                onClose={() => setShowMoreOptionsModal(false)}
              />
            )}
          </Box>

          <Typography variant="body2" sx={{
            color: '#aaa',
            mb: 2,
            fontSize: '14px'
          }}>
            {formatDate(reply.createdAt)}
          </Typography>

          {/* reply content */}
          {isBeingEditedReplyId === reply.id ? (
            <LeaveComments
              onCancel={() => handleEditStateSetter(null, null)}
              pageId={pageId}
              parentCommentId={parentCommentId}
              isEditing={true}
              initialComment={reply.content}
            />
          ) : (
            <Typography variant="body1" sx={{
              mb: 2,
              lineHeight: 1.6,
              fontSize: '15px'
            }}>
              {reply.content}
            </Typography>
          )}
        </Box>
      </Box>

      {!isLastReply && <Divider sx={{ bgcolor: '#333', mb: 4 }} />}
    </Box>
  );
}
