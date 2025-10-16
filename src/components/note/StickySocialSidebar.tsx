import React, { useState, useEffect } from 'react';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ShareIcon from '@mui/icons-material/Share';

import { updateLikeCount } from '@/services/markdown/firebase';
import { getCurrentUserId } from '@/services/common/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/constants/firebase';

import toast from 'react-hot-toast';
import ShareBubbles from './ShareBubbles';


interface StickySocialSidebarProps {
  pageId: string;
  authorId: string;
  likeCount: number;
  setLikeCount: (likeCount: number) => void;
  isInLikeUsers: boolean;
  canInteract?: boolean;
}

export default function StickySocialSidebar({ pageId, authorId, likeCount, setLikeCount, isInLikeUsers, canInteract = true }: StickySocialSidebarProps) {
  const [likes, setLikes] = useState<number>(likeCount);
  const [isLiked, setIsLiked] = useState<boolean>(isInLikeUsers);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [showBorder, setShowBorder] = useState<boolean>(false);
  const [shareBubbleState, setShareBubbleState] = useState<'hidden' | 'visible' | 'closing'>('hidden');

  console.log('authorId in StickySocialSidebar', authorId);

  // Initialize state from props
  useEffect(() => {
    setLikes(likeCount);
    setIsLiked(isInLikeUsers);
  }, [likeCount, isInLikeUsers]);

  // Firebase snapshot listener for real-time updates
  useEffect(() => {
    if (!pageId) {
      console.warn('No pageId provided for snapshot listener');
      return;
    }

    const userId = getCurrentUserId();
    
    // Create reference to the note document
    const noteRef = doc(db, 'notes', pageId);

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      noteRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          
          // Update likeCount from snapshot
          if (typeof data.likeCount === 'number') {
            setLikes(data.likeCount);
            setLikeCount(data.likeCount);
            console.log('Snapshot update - likeCount:', data.likeCount);
          }

          // Update isLiked based on likeUsers array
          if (userId && Array.isArray(data.likeUsers)) {
            const isUserInLikes = data.likeUsers.some(
              (likedUser: { uid: string }) => likedUser.uid === userId
            );
            setIsLiked(isUserInLikes);
            console.log('Snapshot update - isInLikeUsers:', isUserInLikes);
          }
        } else {
          console.warn('Note document does not exist:', pageId);
        }
      },
      (error) => {
        console.error('Error in snapshot listener:', error);
        // Don't show error toast for permission issues on public notes
        if (error.code !== 'permission-denied') {
          toast.error('Failed to sync like status');
        }
      }
    );

    // Cleanup listener on unmount
    return () => {
      console.log('Cleaning up snapshot listener for:', pageId);
      unsubscribe();
    };
  }, [pageId, setLikeCount]);

  const handleLike = async () => {
    if (isUpdating) return;

    if (!canInteract) {
      toast.error('Please sign in to like this note');
      return;
    }

    if (!pageId) {
      console.error('pageId is undefined');
      toast.error('Unable to like post - invalid post ID');
      return;
    }

    const userId = getCurrentUserId();
    const newIsLiked = !isLiked;

    // Show border immediately
    setShowBorder(true);

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
      setLikes(previousLikes);
      setIsLiked(previousIsLiked);
      console.error('Error updating like:', error);
      toast.error('Failed to update like. Please try again.');
    } finally {
      setIsUpdating(false);
      setTimeout(() => setShowBorder(false), 600);
    }
  };

  const disabled = isUpdating || !canInteract;

  const isShareBubbleRendered = shareBubbleState !== 'hidden';
  const isShareBubbleOpen = shareBubbleState === 'visible';

  const handleShareToggle = () => {
    setShareBubbleState((prev) => {
      if (prev === 'visible') {
        return 'closing';
      }
      return 'visible';
    });
  };

  const handleShareCollapseComplete = () => {
    setShareBubbleState((prev) => (prev === 'closing' ? 'hidden' : prev));
  };

  const handleShareRequestClose = () => {
    setShareBubbleState('closing');
  };

  return (
    <div className="sticky top-24 mr-4 h-fit self-start backdrop-blur-sm bg-gray-800/90 rounded-full p-2.5 flex flex-col items-center gap-3 shadow-lg border border-gray-200/20" style={{ zIndex: 1001 }} id='sticky-social-sidebar'>
      <div className='relative'>
        {/* Like Button */}
        <div className="flex flex-col items-center">
          <div
            onClick={canInteract ? handleLike : undefined}
            role="button"
            aria-label="Like this note"
            title="Like this note"
            className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-600 transition-all duration-300 group ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${showBorder ? 'border-2 border-red-500 scale-110' : ''}`}
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
        <div
          onClick={handleShareToggle}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors duration-200 group mt-2"
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
        {/* Share bubbles */}
        {isShareBubbleRendered && (
          <ShareBubbles
            isOpen={isShareBubbleOpen}
            onCloseComplete={handleShareCollapseComplete}
            onRequestClose={handleShareRequestClose}
          />
        )}
      </div>
    </div>
  );
}
