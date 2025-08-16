'use client'
import { trendingPageBgColor } from '@/constants/color'
import { Avatar, IconButton } from '@mui/material'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import React from 'react'
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { useRouter } from 'next/navigation';
import TrendingHeaderModal from './TrendingHeaderModal';
import { useTrendingStore } from '@/store/trendingStore';
import { addNewNoteHandler } from '@/utils/write';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useMarkdownEditorContentStore } from '@/store/markdownEditorContentStore';

export default function TrendingHeader() {
  const { isTrendingHeaderModalOpen, setIsTrendingHeaderModalOpen } = useTrendingStore();
  const dispatch = useAppDispatch();
  const { folders } = useAppSelector((state) => state.sidebar);
  const { content, setContent, title, setTitle } = useMarkdownEditorContentStore();
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  const router = useRouter();
  
  const options = [
    { label: 'My Notes', value: 'my-notes', path: `/my-post/${user?.email}` },
    { label: 'Settings', value: 'settings', path: '/settings' },
    { label: 'Sign Out', value: 'sign-out', path: '/trending/day' },
  ]

  const handleNewPostClick = async () => {
    await addNewNoteHandler({
      mode: 'markdown',
      folders,
      dispatch,
      onSelectPage: (pageId: string) => {
        // The navigation is handled inside addNewNoteHandler
        console.log('New note created with ID:', pageId);
      },
      router,
      setContent,
      setTitle,
      content,
      title
    });
  };

  return (
    <header className="flex justify-between items-center px-2 py-3 relative" style={{ backgroundColor: trendingPageBgColor }}>
      <div className="text-2xl font-bold text-white" onClick={() => { router.push('/dashboard', { scroll: false }) }}>{user?.displayName || 'User'}&apos;s Note</div>
      <div className='flex items-center gap-4'>
        {/* Ring */}
        <TrendingHeaderItemWithIcon icon={<NotificationsNoneRoundedIcon sx={{ fontSize: 24 }} />} onClick={() => { }} />
        {/* Search Icon */}
        <TrendingHeaderItemWithIcon icon={<SearchOutlinedIcon sx={{ fontSize: 24 }} />} onClick={() => { }} />
        {/* New Post Icon */}
        <TrendingHeaderItemWithLabel label="New Post" onClick={handleNewPostClick} />
        {/* Avatar */}
        <TrendingHeaderItemWithAvatar src={user?.photoURL || ''} onClick={() => { setIsTrendingHeaderModalOpen(!isTrendingHeaderModalOpen) }} />
      </div>
      {/* if users click the avatar, show the modal */}
      {isTrendingHeaderModalOpen && <TrendingHeaderModal options={options} onClose={() => setIsTrendingHeaderModalOpen(false)} router={router} />}
    </header>
  )
}

function TrendingHeaderItemWithIcon({ icon, onClick }: { icon?: React.ReactNode, onClick?: () => void }) {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        color: 'white',
        backgroundColor: 'transparent',
        padding: '6px',
        '&:hover': {
          backgroundColor: '#e5e7eb',
          color: 'black',
        },
      }}
    >
      {icon}
    </IconButton>
  )
}

function TrendingHeaderItemWithLabel({ label, onClick }: { label: string, onClick?: () => void }) {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        color: 'white',
        backgroundColor: 'transparent',
        fontSize: 16,
        fontWeight: 500,
        borderRadius: '16px',
        padding: '4px 12px',
        border: '1px solid #e5e7eb',
        '&:hover': {
          backgroundColor: '#e5e7eb',
          color: 'black',
        },
      }}
    >
      {label}
    </IconButton>
  )
}

function TrendingHeaderItemWithAvatar({ src, onClick }: { src: string, onClick?: () => void }) {
  const { isTrendingHeaderModalOpen, setIsTrendingHeaderModalOpen } = useTrendingStore();
  return (
    <IconButton
      className='trending-header-item-with-avatar'
      onClick={() => {
        setIsTrendingHeaderModalOpen(!isTrendingHeaderModalOpen);
        onClick?.();
      }}
      sx={{
        color: 'white',
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      <Avatar src={src} sx={{ width: 40, height: 40 }} />
      <ArrowDropDownIcon sx={{ fontSize: 24, transform: isTrendingHeaderModalOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease-in-out' }} />
    </IconButton>
  )
}
