'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { firebaseApp } from '@/constants/firebase';
import { getAuth } from 'firebase/auth';

import ViewAllCommentsSidebar from './ViewAllCommentsSidebar';
import { useModalStore } from '@/store/modalStore';

import { addNoteComment, getNoteComments, addCommentReply, deleteNoteComment, realTimeFavoriteStatus, removeFromFavorites, addToFavorites, realTimePublicStatus } from '@/services/firebase';
// import { useAppDispatch } from '@/store/hooks';

import CommentIcon from '@mui/icons-material/Comment';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SecurityIcon from '@mui/icons-material/Security';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import toast from 'react-hot-toast';
import LoginIcon from '@mui/icons-material/Login';
import { useMarkdownEditorContentStore } from '@/store/markdownEditorContentStore';
import MoreoptionsModal from './MoreoptionsModal';
import Image from 'next/image';
import { grayColor2 } from '@/constants/color';

interface Props {
  blockComments?: Record<string, Array<{ id: string; text: string; author: string; timestamp: Date }>>;
  getBlockTitle?: (blockId: string) => string;
  isPublic?: boolean;
  onTogglePublic?: () => void;
  userRole?: 'owner' | 'editor' | 'viewer' | null;
  onFavoriteToggle?: () => void;
}

const Header: React.FC<Props> = ({ blockComments = {}, getBlockTitle, onFavoriteToggle }) => {
  const pathname = usePathname();
  const auth = getAuth(firebaseApp);
  const { viewMode, setViewMode } = useMarkdownEditorContentStore();
  // const dispatch = useAppDispatch();
  
  // Safely get edit mode context - default to false if not available

  
  const [captureProtectionEnabled, setCaptureProtectionEnabled] = useState(false);
  const captureProtectionRef = useRef(false); // tracks current protection state
  
  // Modal state
  const {
    showViewAllComments,
    setShowViewAllComments
  } = useModalStore();
  
  // Note comments state
  const [noteComments, setNoteComments] = useState<Array<{
    id: string;
    text: string;
    author: string;
    authorEmail: string;
    timestamp: Date;
    comments?: Array<{
      id: string;
      text: string;
      author: string;
      authorEmail: string;
      timestamp: Date;
    }>;
  }>>([]);

  // Check if we're on a note page
  const isNotePage = pathname.startsWith('/note/') && pathname !== '/note';
  // Robustly extract base noteId for both /note/[id] and /note/[id]/subnote/[id]
  const pathAfterNote = pathname.startsWith('/note/') ? pathname.slice('/note/'.length) : '';
  const noteId = pathAfterNote ? pathAfterNote.split('/')[0] : '';

  // Calculate total comments count (including note comments and replies)
  const totalCommentsCount = React.useMemo(() => {
    const blockCommentsCount = Object.values(blockComments).reduce((total, comments) => total + comments.length, 0);
    const noteCommentsCount = noteComments.reduce((total, comment) => {
      return total + 1 + (comment.comments?.length || 0);
    }, 0);
    return blockCommentsCount + noteCommentsCount;
  }, [blockComments, noteComments]);

  // Favorites state
  const [isFavorite, setIsFavorite] = useState(false);
  const [, setNoteIsPublic] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

  // More options state
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const moreOptionsRef = useRef<HTMLDivElement>(null);
  const user = auth.currentUser;
  const { authorEmail } = useMarkdownEditorContentStore();

  // Load favorite status when on note page
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (isNotePage && noteId && auth.currentUser) {
        setIsLoadingFavorite(true);

        try {
          const unsubscribe = await realTimeFavoriteStatus(noteId, (status) => {
            setIsFavorite(status);
            setIsLoadingFavorite(false);
          });
          return () => {
            if (unsubscribe) {
              unsubscribe();
            }
          }
        } catch (error) {
          console.error('Error loading favorite status:', error);
        }
      }
    };

    loadFavoriteStatus();
  }, [isNotePage, noteId, auth.currentUser]);

  // Load public status when on note page
  useEffect(() => {
    const loadPublicStatus = async () => {
      if (isNotePage && noteId && auth.currentUser) {

        try {
          const unsubscribe = await realTimePublicStatus(noteId, (status) => {
            setNoteIsPublic(status);
          });
          return () => {
            if (unsubscribe) {
              unsubscribe();
            }
          }
        } catch (error) {
          console.error('Error loading public status:', error);
        }
      }
    };
    loadPublicStatus();
  }, [isNotePage, setNoteIsPublic, noteId, auth.currentUser]);

  // Load note comments when on note page
  useEffect(() => {
    const loadNoteComments = async () => {
      if (isNotePage && noteId) {
        try {
          const comments = await getNoteComments(noteId);
          setNoteComments(comments);
        } catch (error) {
          console.error('Error loading note comments:', error);
          setNoteComments([]);
        }
      }
    };

    loadNoteComments();
  }, [isNotePage, noteId]);

  // Handle toggle favorite
  const handleToggleFavorite = async () => {
    if (!noteId || !auth.currentUser) return;

    setIsLoadingFavorite(true);
    try {
      if (isFavorite) {
        await removeFromFavorites(noteId);
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await addToFavorites(noteId);
        setIsFavorite(true);
        toast.success('Added to favorites');
      }

      // Notify parent component to refresh sidebar favorites
      if (onFavoriteToggle) {
        onFavoriteToggle();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update favorites';
      toast.error(errorMessage);
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreOptionsRef.current && !moreOptionsRef.current.contains(event.target as Node)) {
        setShowMoreOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCaptureProtection = () => {
    setCaptureProtectionEnabled(!captureProtectionEnabled);
    captureProtectionRef.current = !captureProtectionEnabled;

    if (!captureProtectionEnabled) {
      console.log('Enabling capture prevention');
      // Enable capture prevention
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      (document.body.style as unknown as Record<string, string>).mozUserSelect = 'none';
      (document.body.style as unknown as Record<string, string>).msUserSelect = 'none';

      // Disable right click
      document.addEventListener('contextmenu', preventDefaultAction);
      // Disable certain keyboard shortcuts
      document.addEventListener('keydown', preventKeyboardShortcuts);
      // Add blur overlay on focus out
      window.addEventListener('blur', addBlurOverlay);

      toast.success('Screen capture protection enabled');
    } else {
      // Disable capture prevention
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      (document.body.style as unknown as Record<string, string>).mozUserSelect = '';
      (document.body.style as unknown as Record<string, string>).msUserSelect = '';

      document.removeEventListener('contextmenu', preventDefaultAction);
      document.removeEventListener('keydown', preventKeyboardShortcuts);
      window.removeEventListener('blur', addBlurOverlay);
      removeBlurOverlay();

      toast.success('Screen capture protection disabled');
    }
  };

  const preventDefaultAction = (e: Event) => {
    e.preventDefault();
    return false;
  };

  const preventKeyboardShortcuts = (e: KeyboardEvent) => {
    // Prevent F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Ctrl+Shift+C, etc.
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
      (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) ||
      (e.metaKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
      (e.metaKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S'))
    ) {
      e.preventDefault();
      return false;
    }
  };

  const addBlurOverlay = () => {
    // Guard: if protection is disabled, do nothing
    if (!captureProtectionRef.current) return;

    if (document.getElementById('capture-protection-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'capture-protection-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: bold;
      z-index: 999999;
      pointer-events: none;
    `;
    overlay.textContent = 'Content Protected - Focus Required';
    document.body.appendChild(overlay);

    // Remove overlay when window regains focus
    const removeOnFocus = () => {
      removeBlurOverlay();
      window.removeEventListener('focus', removeOnFocus);
    };
    window.addEventListener('focus', removeOnFocus);
  };

  const removeBlurOverlay = () => {
    const overlay = document.getElementById('capture-protection-overlay');
    if (overlay) {
      overlay.remove();
    }
  };

  // Handle adding a reply to a comment
  const handleAddReply = async (parentCommentId: string, text: string) => {
    if (noteId) {
      try {
        await addCommentReply(noteId, parentCommentId, text);
        toast.success('Reply added successfully!');
        // Refresh note comments
        const updatedComments = await getNoteComments(noteId);
        setNoteComments(updatedComments);
      } catch (error) {
        console.error('Error adding reply:', error);
        toast.error('Failed to add reply');
      }
    }
  };

  // Handle deleting a comment or reply
  const handleDeleteComment = async (commentId: string, parentCommentId?: string) => {
    if (noteId) {
      try {
        await deleteNoteComment(noteId, commentId, parentCommentId);
        toast.success('Comment deleted successfully!');
        // Refresh note comments
        const updatedComments = await getNoteComments(noteId);
        setNoteComments(updatedComments);
      } catch (error) {
        console.error('Error deleting comment:', error);
        toast.error('Failed to delete comment');
      }
    }
  };

  return (
    <header className="w-full flex items-center justify-between px-6 py-2 border-b border-black/10 dark:border-white/10 sticky top-0 z-30" style={{ backgroundColor: grayColor2 }}>
      {/* Public/Private Toggle - only show on note pages for owners in edit mode */}
      <div className="flex items-center">
        {/* Home Button */}
        <Link href="/dashboard">
          <Image src="/note_logo.png" alt="Home" width={24} height={24} />
        </Link>

      </div>
      <div className="flex items-center">
        {/* Screen Capture Prevention - only show on note pages */}
        {isNotePage && (
          // Don't touch below code
          <button
            onClick={toggleCaptureProtection}
            className={`rounded px-3 py-1 text-sm flex items-center gap-1 mx-2 ${captureProtectionEnabled
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            title={captureProtectionEnabled ? 'Disable Capture Protection' : 'Enable Capture Protection'}
          >
            {captureProtectionEnabled ? (
              <SecurityIcon fontSize="small" />
            ) : (
              <CenterFocusStrongIcon fontSize="small" />
            )}
          </button>
        )}
        {/* Please don't touch below code */}
        {!auth.currentUser && (
          <Link href="/signin" className="rounded px-3 py-1 text-sm bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 flex items-center gap-1">
            <LoginIcon fontSize="small" />
            <span className="sr-only">Sign In</span>
          </Link>
        )}

        <button
          className='text-sm text-white border-none outline-none bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 rounded-md px-2.5 py-1'
          onClick={(e) => {
            e.stopPropagation();
            if (viewMode === 'preview' && user?.email === authorEmail) {
              setViewMode('split');
            } else {
              setViewMode('preview');
            }
          }}>
          {viewMode === 'preview' ? 'Edit' : 'Preview'}
        </button>
        {/* Favorites Button - only show on note pages */}
        {isNotePage && auth.currentUser && (
          <button
            onClick={handleToggleFavorite}
            disabled={isLoadingFavorite}
            className="rounded px-3 py-1 text-sm bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 ml-2 flex items-center gap-1 disabled:opacity-50"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? (
              <StarIcon fontSize="small" className="text-yellow-500" />
            ) : (
              <StarBorderIcon fontSize="small" />
            )}
          </button>
        )}

        {/* View All Comments Button - only show on note pages */}
        {isNotePage && (
          <button
            onClick={() => setShowViewAllComments(true)}
            className="relative rounded px-3 py-1 text-sm bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 ml-2 flex items-center gap-1"
            title="View all comments in this note"
          >
            <CommentIcon fontSize="small" />
            {/* <span>Comments</span> */}
            {totalCommentsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {totalCommentsCount > 99 ? '99+' : totalCommentsCount}
              </span>
            )}
          </button>
        )}



        {/* More Options Button - only show on note pages */}
        {isNotePage && (
          <div className="relative ml-2" ref={moreOptionsRef}>
            <button
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="rounded px-3 py-1 text-sm bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 flex items-center gap-1"
              title="More options"
            >
              <MoreHorizIcon fontSize="small" />
            </button>

            {/* More Options Dropdown */}
            {showMoreOptions && (
              <MoreoptionsModal noteId={noteId} setShowMoreOptions={setShowMoreOptions} />
            )}
          </div>
        )}
      </div>

      {/* View All Comments Sidebar */}
      <ViewAllCommentsSidebar
        open={showViewAllComments}
        onClose={() => setShowViewAllComments(false)}
        blockComments={blockComments}
        noteComments={noteComments}
        getBlockTitle={getBlockTitle}
        onAddComment={async (text: string) => {
          if (noteId) {
            try {
              await addNoteComment(noteId, text);
              toast.success('Comment added successfully!');
              // Refresh note comments
              const updatedComments = await getNoteComments(noteId);
              setNoteComments(updatedComments);
            } catch (error) {
              console.error('Error adding comment:', error);
              toast.error('Failed to add comment');
            }
          }
        }}
        onAddReply={handleAddReply}
        onDeleteComment={handleDeleteComment}
      />
    </header>
  );
};

export default Header; 