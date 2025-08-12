'use client';

import React, { useEffect, useState } from 'react';
import { getSubNoteComments } from '@/services/firebase';
import { toast } from 'react-hot-toast';
import { useAddaSubNoteSidebarStore } from '@/store/AddaSubNoteSidebarStore';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton } from '@mui/material';

interface CommentListProps {
  parentId: string;
  subNoteId: string;
}

const CommentList: React.FC<CommentListProps> = ({ parentId, subNoteId }) => {
  const { comments, setComments } = useAddaSubNoteSidebarStore();
  const [isHoveredCommentId, setIsHoveredCommentId] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      if (!parentId || !subNoteId) return;
      try {
        const list = await getSubNoteComments(parentId, subNoteId);
        setComments(list);
      } catch (e) {
        // noop
        console.error('Error getting sub-note comments:', e);
        toast.error('Error getting sub-note comments');
      }
    };
    load();
  }, [parentId, subNoteId]);

  if (!comments.length) return null;

  return (
    <div className="px-20 pt-2 space-y-3">
      {comments.map((c) => (
        <div key={c.id} className="text-xs text-gray-200"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            // Leave comment
          }}
          onMouseEnter={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsHoveredCommentId(c.id);
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsHoveredCommentId('');
          }}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold">{c.author}</span>
            <span className="opacity-60" id='comment-timestamp'>{c.timestamp.toLocaleString()}</span>
            {/* trash icon */}
            {isHoveredCommentId === c.id && (
              <>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('edit comment');
                  }}
                  sx={{
                    backgroundColor: 'transparent',
                    p: 0,
                }}>
                  <EditIcon
                    sx={{
                      fontSize: '14px',
                      color: 'white',
                      '&:hover': {
                        color: 'skyblue',
                        cursor: 'pointer',
                      },
                    }} />
                </IconButton>
                <IconButton sx={{
                  backgroundColor: 'transparent',
                  p: 0,
                }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('delete comment');
                  }}
                >
                  <DeleteOutlineIcon
                    sx={{
                      fontSize: '14px',
                      color: 'white',
                      '&:hover': {
                        color: 'red',
                        cursor: 'pointer',
                      },
                    }} />
                </IconButton>
              </>
            )}
          </div>
          <div className="mt-1">{c.text}</div>
          {c.comments && c.comments.length > 0 && (
            <div className="ml-4 mt-1 space-y-1">
              {c.comments.map((r) => (
                <div key={r.id} className="text-[11px] opacity-90">
                  <span className="font-semibold">{r.author}</span> {r.text}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentList;


