import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import StarIcon from '@mui/icons-material/Star';
import React, { useEffect, useState, useRef } from 'react'
import ShareIcon from '@mui/icons-material/Share';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// import EditIcon from '@mui/icons-material/Edit';
import { useAddaSubNoteSidebarStore } from '@/store/AddaSubNoteSidebarStore';
import { isNoteFavorite, realTimeFavoriteStatus, addToFavorites, removeFromFavorites, createOrUpdateSubNotePage } from '@/services/firebase';
import toast from 'react-hot-toast';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import SocialShareDropdown from '@/components/SocialShareDropdown';

interface HeaderForAddaSubNoteSidebarProps {
  title: string;
  isSelectNoteModalOpen: boolean;
  setIsSelectNoteModalOpen: (isOpen: boolean) => void;
  parentId?: string;
  subNoteId?: string | null;
  callbacks: {
    onZoomOut: () => void;
  };
}

export default function HeaderForAddaSubNoteSidebar({ title, /* isSelectNoteModalOpen */ setIsSelectNoteModalOpen, callbacks, parentId /*, subNoteId*/ }: HeaderForAddaSubNoteSidebarProps) {
  const { viewMode, setViewMode } = useAddaSubNoteSidebarStore();
  const [isShowEditButton, setIsShowEditButton] = useState(false);
  const { authorEmail, selectedNoteId, setShowMoreOptionsModalForSubnote, content, setSelectedSubNoteId, selectedNoteTitle } = useAddaSubNoteSidebarStore();
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const shareRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (user && user.email === authorEmail) {
      setIsShowEditButton(true);
    } else {
      setIsShowEditButton(false);
    }
  }, [user, authorEmail, viewMode]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const run = async () => {
      if (!selectedNoteId || !parentId) return;
      const fav = await isNoteFavorite(parentId, selectedNoteId);
      setIsFavorite(fav);
      try {
        unsubscribe = await realTimeFavoriteStatus(parentId, (status) => setIsFavorite(status), selectedNoteId);
      } catch {
        // ignore
      }
    };
    run();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedNoteId, parentId]);

  // Close share dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setShowShareDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFavorite = async () => {
    try {
      if (!parentId) return;
      const subId = selectedNoteId;
      if (!subId && !content?.trim()) {
        toast.error('Cannot add an empty sub-note to favorites.');
        return;
      }

      if (isFavorite) {
        if (!subId) return; // nothing to remove
        await removeFromFavorites(parentId, subId);
        setIsFavorite(false);
        toast.success('Sub-note removed from favorites');
        return;
      }

      // Ensure sub-note document exists and has non-empty content before favoriting
      const user = auth.currentUser;
      if (!user) {
        toast.error('Please sign in');
        return;
      }
      const trimmedContent = (content || '').trim();
      if (!trimmedContent) {
        toast.error('Cannot add an empty sub-note to favorites.');
        return;
      }

      const ensuredSubId = await createOrUpdateSubNotePage(
        parentId,
        { title: selectedNoteTitle || '', content: trimmedContent },
        user.uid,
        user.displayName || user.email?.split('@')[0] || 'Anonymous',
        subId && subId.trim() !== '' ? subId : undefined
      );
      if (!subId || subId !== ensuredSubId) {
        setSelectedSubNoteId(ensuredSubId);
      }

      await addToFavorites(parentId, ensuredSubId);
      setIsFavorite(true);
      toast.success('Sub-note added to favorites');
    } catch (e) {
      console.error('Error toggling favorite:', e);
      toast.error(e instanceof Error ? e.message : 'Failed to update favorites');
    }
  };

  return (
    <div className='w-full flex items-center justify-between px-4 pt-4 pb-2'>
      <div className='flex items-center gap-2'>
        <ZoomOutMapIcon style={{ fontSize: '16px', cursor: 'pointer' }} onClick={callbacks.onZoomOut} />
        <div className='text-sm font-semibold ml-5 flex items-center gap-[6px]' onClick={() => setIsSelectNoteModalOpen(true)}>
          <span className=''>Add to</span>
          <TextSnippetIcon style={{ fontSize: '16px' }} />
          <span className=''>{title}</span>
          <KeyboardArrowDownIcon style={{ fontSize: '16px' }} />
        </div>
      </div>
      <div className='flex items-center'>
        {isShowEditButton && <HeaderItemForAddaSubNoteSidebar title={viewMode === 'split' ? 'Preview' : 'Edit'} onClick={() => setViewMode(viewMode === 'split' ? 'preview' : 'split')} />}
        {/* Share Button with Dropdown */}
        <div className='relative' ref={shareRef}>
          <HeaderItemForAddaSubNoteSidebar 
            icon={<ShareIcon style={{ fontSize: '16px', cursor: 'pointer' }} />} 
            title='Share' 
            onClick={() => setShowShareDropdown((prev) => !prev)} 
          />
          {showShareDropdown && parentId && (
            <div className='absolute right-0 top-full mt-1'>
              <SocialShareDropdown noteId={parentId} onClose={() => setShowShareDropdown(false)} />
            </div>
          )}
        </div>
        <HeaderItemForAddaSubNoteSidebar icon={isFavorite ? <StarIcon style={{ fontSize: '16px', cursor: 'pointer' }} /> : <StarBorderIcon style={{ fontSize: '16px', cursor: 'pointer' }} />} title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'} onClick={toggleFavorite} />
        <HeaderItemForAddaSubNoteSidebar icon={<MoreHorizIcon style={{ fontSize: '16px', cursor: 'pointer' }} />} title='More' onClick={() => { setShowMoreOptionsModalForSubnote(true) }} />
      </div>
    </div>
  )
}

function HeaderItemForAddaSubNoteSidebar({ icon, title, onClick }: { icon?: React.ReactNode, title?: string, onClick: () => void }) {
  return (
    <div className='hover:bg-gray-600/50 hover:text-white/60 px-2 py-1 rounded-md cursor-pointer' onClick={onClick} title={title || ''}>
      {icon && icon}
      {(title && !icon) && <span className='text-sm'>{title}</span>}
    </div>
  )
}
