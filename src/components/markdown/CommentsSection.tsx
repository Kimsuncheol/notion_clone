import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Typography,
  Button,
  Divider,
  IconButton
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LeaveComments from './LeaveComments';
import { mintColor1 } from '@/constants/color';
import { Comment } from '@/types/firebase';
import { Timestamp } from 'firebase/firestore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MoreoptionsModal from './MoreoptionsModal';
import RepliesSection from './RepliesSection';
import { useMarkdownStore } from '@/store/markdownEditorContentStore';

interface CommentsSectionProps {
  comments: Comment[];
  pageId: string;
  canInteract?: boolean;
}

export default function CommentsSection({ comments, pageId, canInteract = true }: CommentsSectionProps) {

  return (
    <Box sx={{
      color: 'white',
      py: 3,
      pl: 3,
    }}>
      {comments.map((comment, index) => (
        <CommentItem key={comment.id} comment={comment} isLastComment={index === comments.length - 1} pageId={pageId} parentCommentId={comment.id} canInteract={canInteract} />
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

interface CommentItemProps {
  comment: Comment;
  isLastComment?: boolean;
  parentCommentId?: string;
  pageId: string;
  canInteract?: boolean;
}

function CommentItem({ comment, isLastComment, parentCommentId, pageId, canInteract = true }: CommentItemProps) {
  const iconStyle = { fontSize: '12px', color: mintColor1 }
  const [showMoreOptionsModal, setShowMoreOptionsModal] = useState<boolean>(false);
  const { isBeingEditedCommentId, isBeingEditedReplyId, handleEditStateSetter, setIsShowingRepliesCommentId, isShowingRepliesCommentId } = useMarkdownStore();

  return (
    <Box sx={{
      color: 'white',
      py: 3,
      pl: 3,
      pr: 0,
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6" sx={{
              fontWeight: 600,
              fontSize: '16px'
            }}>
              {comment.author}
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
                commentId={comment.id}
                onClose={() => setShowMoreOptionsModal(false)} />
            )}
          </Box>

          <Typography variant="body2" sx={{
            color: '#aaa',
            mb: 2,
            fontSize: '14px'
          }}>
            {formatDate(comment.createdAt)}
          </Typography>

          {isBeingEditedCommentId === comment.id ? (
            <LeaveComments
              onCancel={() => handleEditStateSetter(null, null)}
              pageId={pageId}
              parentCommentId={parentCommentId}
              isEditing={true}
              initialComment={comment.content}
            />
          ) : (
            <Typography variant="body1" sx={{
              mb: 2,
              lineHeight: 1.6,
              fontSize: '15px'
            }}>
              {comment.content}
            </Typography>
          )}

          {/* Show/Hide Reply Button */}
          {!comment.parentCommentId && (
            <Button
              variant="text"
              onClick={() => setIsShowingRepliesCommentId(comment.id)}
              startIcon={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: `1px solid ${mintColor1}`, p: 0.25 }}>
                  {isShowingRepliesCommentId === comment.id ? <RemoveIcon sx={iconStyle} /> : <AddIcon sx={iconStyle} />}
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
              {isShowingRepliesCommentId === comment.id ? 'Hide' : comment.comments && comment.comments.length > 0 ? `${comment.comments.length} replies` : 'Show'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Render nested replies */}
      {isShowingRepliesCommentId === comment.id && comment.comments && (
        <Box sx={{ ml: 6, mb: 2 }}>
          <RepliesSection
            replies={comment.comments}
            pageId={pageId}
            parentCommentId={comment.id}
          />
        </Box>
      )}

      {isShowingRepliesCommentId === comment.id && !isBeingEditedCommentId && !isBeingEditedReplyId && (
        <Box sx={{ mb: 4 }}>
          <LeaveComments isReply={isShowingRepliesCommentId === comment.id} onCancel={() => setIsShowingRepliesCommentId(null)} pageId={pageId} commentsCount={0} parentCommentId={parentCommentId} canInteract={canInteract} />
        </Box>
      )}
      {!isLastComment && <Divider sx={{ bgcolor: '#333', mb: 4 }} />}
    </Box>
  )
}