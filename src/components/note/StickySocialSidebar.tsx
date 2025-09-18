import React, { useState, useEffect } from 'react';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ShareIcon from '@mui/icons-material/Share';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SmartToyTwoToneIcon from '@mui/icons-material/SmartToyTwoTone';

import { updateLikeCount } from '@/services/markdown/firebase';
import { getCurrentUserId } from '@/services/common/firebase';

import toast from 'react-hot-toast';

import { useMarkdownStore } from '@/store/markdownEditorContentStore';

interface StickySocialSidebarProps {
  pageId: string;
  authorId: string;
  likeCount: number;
  setLikeCount: (likeCount: number) => void;
  isInLikeUsers: boolean;
}

export default function StickySocialSidebar({ pageId, authorId, likeCount, setLikeCount, isInLikeUsers }: StickySocialSidebarProps) {
  const [likes, setLikes] = useState(likeCount);
  const [isLiked, setIsLiked] = useState(isInLikeUsers);
  const [isUpdating, setIsUpdating] = useState(false);
  const { setShowChatModal, setShowQRCodeModalForMarkdownEditor } = useMarkdownStore();

  console.log('authorId in StickySocialSidebar', authorId);
  useEffect(() => {
    setLikes(likeCount);
  }, [likeCount]);

  useEffect(() => {
    setIsLiked(isInLikeUsers);
  }, [isInLikeUsers]);

  const handleLike = async () => {
    if (isUpdating) return; // Prevent multiple simultaneous updates

    // Validate required data
    if (!pageId) {
      console.error('pageId is undefined');
      toast.error('Unable to like post - invalid post ID');
      return;
    }

    const userId = getCurrentUserId();

    const newIsLiked = !isLiked;

    // Optimistic update
    const previousLikes = likes;
    const previousIsLiked = isLiked;

    if (newIsLiked) {
      setLikes(likes + 1);
      setIsLiked(true);
    } else {
      setLikes(likes - 1);
      setIsLiked(false);
    }

    setIsUpdating(true);

    try {
      const updatedNote = await updateLikeCount(pageId, userId, newIsLiked, authorId);

      if (updatedNote) {
        setLikes(updatedNote.likeCount || 0);
        setLikeCount(updatedNote.likeCount || 0);
        setIsLiked(updatedNote.likeUsers?.some(likedUser => likedUser.uid === userId) || false);
      }
    } catch (error) {
      // Revert optimistic update on error
      setLikes(previousLikes);
      setIsLiked(previousIsLiked);
      console.error('Error updating like:', error);
      toast.error('Failed to update like. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShare = () => {
    // Share functionality - could integrate with Web Share API or copy link
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="sticky top-24 mr-4 z-40 h-fit self-start backdrop-blur-sm bg-gray-800/90 rounded-full p-3 flex flex-col items-center gap-3 shadow-lg border border-gray-200/20" id='sticky-social-sidebar'>
      {/* Like Button */}
      <div className="flex flex-col items-center">
        <div
          onClick={handleLike}
          className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors duration-200 group ${isUpdating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          <FavoriteBorderOutlinedIcon
            sx={{
              transition: 'color 0.2s, fill 0.2s',
              ...(isLiked
                ? { fill: 'red', color: 'red' }
                : {
                  color: 'grey.400',
                  '@media (hover: hover)': {
                    '.group:hover &': {
                      color: 'white'
                    }
                  }
                }
              )
            }}
          />
        </div>
        <span className="text-white text-sm font-medium mt-2">{likes}</span>
      </div>

      {/* AI chat button */}
      <div className="flex flex-col items-center">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors duration-200 group"
          onClick={() => setShowChatModal(true)}
        >
          <SmartToyTwoToneIcon />
        </div>
      </div>

      {/* Share Button */}
      <div className="flex flex-col items-center gap-3">
        <div
          onClick={handleShare}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors duration-200 group"
        >
          <ShareIcon
            sx={{
              color: 'grey.400',
              transition: 'color 0.2s',
              '@media (hover: hover)': {
                '.group:hover &': {
                  color: 'white'
                }
              }
            }}
          />
        </div>
        <div className='w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors duration-200 group' onClick={() => setShowQRCodeModalForMarkdownEditor(true)}>
          <QrCodeScannerIcon
            sx={{
              color: 'grey.400',
              transition: 'color 0.2s',
              '@media (hover: hover)': {
                '.group:hover &': {
                  color: 'white'
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
