import { IconButton, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { ArrowUpward } from '@mui/icons-material';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import Avatar from '../Avatar';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-hot-toast';

interface AddaCommentProps {
  onClose: () => void;
  selectedNoteId: string;
  ref: React.RefObject<HTMLDivElement | null>;
}

export default function AddaComment({ onClose, selectedNoteId, ref }: AddaCommentProps) {
  const userName = getAuth().currentUser?.displayName || getAuth().currentUser?.email?.split('@')[0] || 'Anonymous';
  const [comment, setComment] = useState(''); 
  const [file, setFile] = useState<File | null>(null);
  const [isCommentBoxOn, setIsCommentBoxOn] = useState(false);

  const handleSaveComment = (comment: string) => {
    console.log('Save comment to database:', comment);
    if (comment.length === 0) {
      toast.error('Please enter a comment');
      return;
    }
    setComment('');
    // setFile(null);
  }

  const handleAttachFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setFile(file);
      }
    }
    fileInput.click();
  }
  useEffect(() => {
    console.log('Current comment', comment);
  }, [comment]);

  // If the user clicks outside of the comment box, close the comment box
  // useEffect(() => {
  //   const handleClickOutside = (e: MouseEvent) => {
  //     if (ref.current && !ref.current.contains(e.target as Node)) {
  //       onClose();
  //     }
  //   };
  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, [ref, onClose]);

  return (
    <div ref={ref} className='mx-20 flex items-center justify-between gap-1 border-b border-white/50 relative' onMouseEnter={() => setIsCommentBoxOn(true)} onMouseLeave={() => setIsCommentBoxOn(false)}>
      <Avatar name={userName || ''} size={20} />
      <TextField
        fullWidth
        multiline
        rows={1}
        placeholder='Add a comment...'
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSaveComment(comment);
          }
        }}
        sx={{
          '& .MuiInputBase-root': {
            color: 'white',
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&:focus .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            }
          },
        }}
      />
      <div className={`flex items-center gap-2 ${isCommentBoxOn ? 'flex' : 'hidden'}`}>
        <CommentItemButton onClick={handleAttachFile} icon={<AttachFileIcon sx={{ color: 'white', fontSize: '20px' }} />} iconName='attach-file' />
        <CommentItemButton onClick={() => handleSaveComment(comment)} icon={<AlternateEmailIcon sx={{ color: 'white', fontSize: '20px' }} />} iconName='email' />
        <CommentItemButton onClick={() => handleSaveComment(comment)} icon={<ArrowUpward sx={{ color: 'white', fontSize: '20px' }} />} iconName='arrow-up' />
      </div>
    </div>
  )
}

function CommentItemButton({ onClick, icon, iconName }: { onClick: ((e: React.MouseEvent<HTMLButtonElement>) => void), icon: React.ReactNode, iconName: string }) {
  return (
    <IconButton sx={{
      backgroundColor: iconName === 'arrow-up' ? 'gray' : 'transparent',
      padding: '4px',
      opacity: 0.5,
      '&:hover': {
        backgroundColor: 'highlight',
      },
    }} onClick={onClick}>
      {icon}
    </IconButton>
  )
}