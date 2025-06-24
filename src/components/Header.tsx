'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { firebaseApp } from '@/constants/firebase';
import { getAuth } from 'firebase/auth';

import ViewAllCommentsModal from './ViewAllCommentsModal';
import { useModalStore } from '@/store/modalStore';

import { addToFavorites, removeFromFavorites, isNoteFavorite, duplicateNote, moveToTrash } from '@/services/firebase';
import { useAppDispatch } from '@/store/hooks';
import { movePageToTrash } from '@/store/slices/sidebarSlice';
import { useEditMode } from '@/contexts/EditModeContext';

import CommentIcon from '@mui/icons-material/Comment';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import toast from 'react-hot-toast';

interface Props {
  onOpenManual: () => void;
  blockComments?: Record<string, Array<{ id: string; text: string; author: string; timestamp: Date }>>;
  getBlockTitle?: (blockId: string) => string;
  isPublic?: boolean;
  onTogglePublic?: () => void;
  userRole?: 'owner' | 'editor' | 'viewer' | null;
}

const Header: React.FC<Props> = ({ onOpenManual, blockComments = {}, getBlockTitle, isPublic = false, onTogglePublic, userRole }) => {
  const pathname = usePathname();
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const dispatch = useAppDispatch();
  
  // Safely get edit mode context - default to false if not available
  let isEditMode = false;
  try {
    const editModeContext = useEditMode();
    isEditMode = editModeContext.isEditMode;
  } catch {
    // Not in EditModeProvider context, default to false
    isEditMode = false;
  }
  
  const [captureProtectionEnabled, setCaptureProtectionEnabled] = useState(false);
  const captureProtectionRef = useRef(false); // tracks current protection state
  
  // Modal state
  const { 
    showViewAllComments,
    setShowViewAllComments
  } = useModalStore();
  


  // Check if we're on a note page
  const isNotePage = pathname.startsWith('/note/') && pathname !== '/note';
  const noteId = pathname.startsWith('/note/') ? pathname.split('/note/')[1] : '';
  
  // Calculate total comments count
  const totalCommentsCount = React.useMemo(() => {
    return Object.values(blockComments).reduce((total, comments) => total + comments.length, 0);
  }, [blockComments]);
  
  // Favorites state
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

  // More options state
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const moreOptionsRef = useRef<HTMLDivElement>(null);

  // Load favorite status when on note page
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (isNotePage && noteId && auth.currentUser) {
        try {
          const favoriteStatus = await isNoteFavorite(noteId);
          setIsFavorite(favoriteStatus);
        } catch (error) {
          console.error('Error loading favorite status:', error);
        }
      }
    };

    loadFavoriteStatus();
  }, [isNotePage, noteId, auth.currentUser]);

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
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    } finally {
      setIsLoadingFavorite(false);
    }

    // Note: Favorites are managed locally in the sidebar component
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

  // More options functionality
  const handleCopyNoteLink = async () => {
    if (!noteId) return;
    
    const noteUrl = `${window.location.origin}/note/${noteId}`;
    try {
      await navigator.clipboard.writeText(noteUrl);
      toast.success('Note link copied to clipboard!');
      setShowMoreOptions(false);
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error('Failed to copy link');
    }
  };

  

  const handleDuplicateNote = async () => {
    if (!noteId) return;
    
    try {
      await duplicateNote(noteId);
      toast.success('Note duplicated successfully!');
      setShowMoreOptions(false);
      
      // Note: Sidebar state is updated via Redux, no manual refresh needed
    } catch (error) {
      console.error('Error duplicating note:', error);
      toast.error('Failed to duplicate note');
    }
  };

  const handleMoveToTrash = async () => {
    if (!noteId) return;
    
    try {
      await moveToTrash(noteId);
      
      // Update the sidebar to move the note to trash folder
      dispatch(movePageToTrash({ 
        pageId: noteId, 
        title: 'Note' // We'll get the actual title from the note if needed
      }));
      
      toast.success('Note moved to trash');
      setShowMoreOptions(false);
      
      // Navigate to dashboard when note is moved to trash
      router.push('/dashboard');
    } catch (error) {
      console.error('Error moving note to trash:', error);
      toast.error('Failed to move note to trash');
    }
  };

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

  return (
    <header className="w-full flex items-center justify-between px-6 py-2 border-b border-black/10 dark:border-white/10 bg-[color:var(--background)] sticky top-0 z-30">
      {/* Public/Private Toggle - only show on note pages for owners in edit mode */}
      <div className="flex items-center">
        {isNotePage && isEditMode && userRole === 'owner' && onTogglePublic && (
          <button
            onClick={onTogglePublic}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              isPublic 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            title={isPublic ? 'Note is public - click to make private' : 'Note is private - click to make public'}
          >
            {isPublic ? '🌐 Public' : '🔒 Private'}
          </button>
        )}
        
        {/* Public/private indicator for non-owners */}
        {isNotePage && userRole && userRole !== 'owner' && (
          <span className={`px-3 py-1 text-sm rounded ${
            isPublic 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
          }`}>
            {isPublic ? '🌐 Public' : '🔒 Private'}
          </span>
        )}
      </div>

      <div className="flex items-center">
        {/* Screen Capture Prevention - only show on note pages */}
        {isNotePage && (
          <button
            onClick={toggleCaptureProtection}
            className={`rounded px-3 py-1 text-sm flex items-center gap-1 mr-2 ${
              captureProtectionEnabled
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
            title={captureProtectionEnabled ? 'Disable Capture Protection' : 'Enable Capture Protection'}
          >
            <span>{captureProtectionEnabled ? '🔒' : '🔓'}</span>
            <span>{captureProtectionEnabled ? 'Protected' : 'Unprotected'}</span>
          </button>
        )}
        {/* Please don't touch below code */}      
        {!auth.currentUser && (
          <Link href="/signin" className="rounded px-3 py-1 text-sm bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 flex items-center gap-1">
            <span>🔑</span>
            <span className="sr-only">Sign In</span>
          </Link>
        )}

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

        <button
          onClick={onOpenManual}
          className="rounded px-3 py-1 text-sm bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 ml-2"
        >
          📖 Manual
        </button>

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
              <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg py-2 min-w-48 z-50">
                <button
                  onClick={handleCopyNoteLink}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center gap-3"
                >
                  <span>🔗</span>
                  <span>Copy note link</span>
                </button>
                
                <button
                  onClick={handleDuplicateNote}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center gap-3"
                >
                  <span>📋</span>
                  <span>Duplicate note</span>
                </button>

                <button
                  onClick={handleMoveToTrash}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-white hover:text-red-600 flex items-center gap-3"
                  title="Move to trash"
                >
                  <DeleteOutlineIcon fontSize="small" />
                  <span>Move to trash</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>



      {/* View All Comments Modal */}
      <ViewAllCommentsModal
        open={showViewAllComments}
        onClose={() => setShowViewAllComments(false)}
        blockComments={blockComments}
        getBlockTitle={getBlockTitle}
      />
    </header>
  );
};

export default Header; 