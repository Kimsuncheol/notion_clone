import React, { useState, useEffect } from 'react';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ShareIcon from '@mui/icons-material/Share';
import { updateLikeCount } from '@/services/markdown/firebase';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';


interface StickySocialSidebarProps {
  pageId: string;
  likeCount: number;
  setLikeCount: (likeCount: number) => void;
  isInLikeUsers: boolean;
}

export default function StickySocialSidebar({ pageId, likeCount, setLikeCount, isInLikeUsers }: StickySocialSidebarProps) {
  const [likes, setLikes] = useState(likeCount);
  const [isLiked, setIsLiked] = useState(isInLikeUsers);
  const [isUpdating, setIsUpdating] = useState(false);
  const auth = getAuth(firebaseApp);

  // Sync local state with props when they change
  useEffect(() => {
    setLikes(likeCount);
  }, [likeCount]);

  useEffect(() => {
    setIsLiked(isInLikeUsers);
  }, [isInLikeUsers]);

  const handleLike = async () => {
    if (!auth.currentUser) {
      toast.error('Please sign in to like posts');
      return;
    }

    if (isUpdating) return; // Prevent multiple simultaneous updates

    // Validate required data
    if (!pageId) {
      console.error('pageId is undefined');
      toast.error('Unable to like post - invalid post ID');
      return;
    }

    const userId = auth.currentUser.uid;
    if (!userId) {
      console.error('userId is undefined');
      toast.error('Unable to like post - invalid user ID');
      return;
    }

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
      const updatedNote = await updateLikeCount(pageId, userId, newIsLiked);
      
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
    <div className="sticky top-24 mr-4 z-40 h-fit self-start backdrop-blur-sm bg-gray-800/90 rounded-full p-3 flex flex-col items-center space-y-3 shadow-lg border border-gray-200/20" id='sticky-social-sidebar'>

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

      {/* Share Button */}
      <div className="flex flex-col items-center">
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
      </div>
    </div>
  );
}