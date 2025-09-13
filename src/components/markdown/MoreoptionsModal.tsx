import { grayColor4 } from '@/constants/color';
import { deleteComment, deleteReply, } from '@/services/markdown/firebase';
import { useMarkdownStore } from '@/store/markdownEditorContentStore';
import React, { useEffect } from 'react'

interface MoreoptionsModalProps {
  noteId: string;
  commentId?: string;
  replyId?: string;
  onClose: () => void;
}

// Delete comment
// Delete reply
// Edit comment
// Edit reply
// Report comment
// Report reply
export default function MoreoptionsModal({ noteId, commentId, replyId, onClose, setShowEditComment, setShowEditReply }: MoreoptionsModalProps) {
  // const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState<boolean>(false);
  const { handleEditStateSetter } = useMarkdownStore();
  const CommentFunctionList = [
    {
      title: 'Edit comment',
      action: () => {
        handleEditStateSetter(commentId!, null);
        onClose();
      }
    },
    {
      title: 'Delete comment',
      action: () => {
        deleteComment(noteId, commentId!);
        onClose();
      }
    },
  ]

  const ReplyFunctionList = [
    {
      title: 'Edit reply',
      action: () => {
        handleEditStateSetter(null, replyId!);
        onClose();
      }
    },
    {
      title: 'Delete reply',
      action: () => {
        deleteReply(noteId, replyId!);
        onClose();
      }
    },
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!event.target) return;
      const target = event.target as HTMLElement;
      const modal = document.querySelector('#more-options-modal');
      if (modal && !modal.contains(target) && !target.closest('#more-options-modal-trigger')) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [onClose]);
  
  return (
    <div className='absolute top-6 right-6 rounded-lg w-fit z-[9999] flex flex-col' style={{ backgroundColor: grayColor4 }} id='more-options-modal'>
      {(commentId && !replyId) && CommentFunctionList.map((item) => (
        <div key={item.title} onClick={item.action} className='text-white text-sm cursor-pointer hover:bg-gray-700/40 px-4 py-2' >
          {item.title}
        </div>
      ))}
      {replyId && ReplyFunctionList.map((item) => (
        <div key={item.title} onClick={item.action} className='text-white text-sm cursor-pointer hover:bg-gray-700/40 px-4 py-2' >
          {item.title}
        </div>
      ))}
    </div>
  )
}

