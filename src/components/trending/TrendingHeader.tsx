'use client'
import { grayColor2, grayColor3, grayColor5 } from '@/constants/color'
import { Avatar, IconButton, Select, MenuItem, Box } from '@mui/material'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import React, { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { useRouter } from 'next/navigation';
import { addNewNoteHandler } from '@/utils/write';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useMarkdownEditorContentStore } from '@/store/markdownEditorContentStore';
import Link from 'next/link';
import Image from 'next/image';
import { useTrendingStore } from '@/store/trendingStore';
import TrendingHeaderModal from './TrendingHeaderModal';

interface MenuItem {
  label: string;
  value: string;
  path: string;
  icon: string;
}

export default function TrendingHeader() {
  const { setContent, setTitle, setViewMode, content, title } = useMarkdownEditorContentStore();
  const dispatch = useAppDispatch();
  const { folders } = useAppSelector((state) => state.sidebar);
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  const router = useRouter();
  const [isClickedOther, setIsClickedOther] = useState<boolean>(false);
  const { isTrendingHeaderModalOpen, setIsTrendingHeaderModalOpen } = useTrendingStore();

  const options: MenuItem[] = [
    { label: 'My Notes', value: 'my-notes', path: `/my-post/${user?.email}/posts`, icon: 'notes' },
    { label: 'Drafts', value: 'drafts', path: '/drafts', icon: 'drafts' },
    { label: 'Settings', value: 'settings', path: '/settings', icon: 'settings' },
    { label: 'Sign Out', value: 'sign-out', path: '/trending/week', icon: 'signout' },
    { label: 'Others', value: 'others', path: '/others', icon: 'others' },

    { label: 'Templates', value: 'templates', path: '/templates', icon: 'templates' },
    { label: 'Invite Members', value: 'invite-members', path: '/invite-members', icon: 'invite-members' },
    { label: 'Manage Members', value: 'manage-members', path: '/manage-members', icon: 'manage-members' },
    { label: 'Help & Contact', value: 'help-contact', path: '/help-contact', icon: 'help-contact' },
  ]

  const handleNewPostClick = async () => {
    await addNewNoteHandler({
      mode: 'markdown',
      folders,
      dispatch,
      onSelectPage: (pageId: string) => {
        console.log('New note created with ID:', pageId);
      },
      router,
      setContent,
      setTitle,
      content,
      title,
      setViewMode: () => {
        setViewMode('split');
      }
    });
  };

  return (
    <header className="flex justify-between items-center px-2 py-3 relative" style={{ backgroundColor: grayColor2 }}>
      <Link href="/trending/week" className="text-2xl font-bold cursor-pointer">
        <Image src="/note_logo.png" alt="logo" width={32} height={32} />
      </Link>
      <div className='flex items-center gap-4'>
        {/* Ring */}
        <TrendingHeaderItemWithIcon icon={<NotificationsNoneRoundedIcon sx={{ fontSize: 24 }} />} onClick={() => { router.push('/inbox') }} />
        {/* Search Icon */}
        <TrendingHeaderItemWithIcon icon={<SearchOutlinedIcon sx={{ fontSize: 24 }} />} onClick={() => { router.push('/search') }} />
        {/* New Post Icon */}
        <TrendingHeaderItemWithLabel label="New Post" onClick={handleNewPostClick} />
        {/* Avatar Select */}
        <TrendingHeaderItemWithIcon
          icon={
            <Box sx={{ display: 'flex', marginRight: '4px' }}>
              <Avatar
                src={user?.photoURL || ''}
                sx={{ width: 32, height: 32 }}
              />
            </Box>
          }
          onClick={() => { setIsTrendingHeaderModalOpen(!isTrendingHeaderModalOpen) }}
          className='trending-header-item-with-icon'
        />
      </div>
      {isTrendingHeaderModalOpen && (
        <TrendingHeaderModal
          options={options.slice(0, 5)}
          subOptions={options.slice(5)}
          onClose={() => setIsTrendingHeaderModalOpen(false)}
          router={router}
          isClickedOther={isClickedOther}
          setIsClickedOther={setIsClickedOther} />
      )}
    </header>
  )
}

function TrendingHeaderItemWithIcon({ icon, onClick, className }: { icon?: React.ReactNode, onClick?: () => void, className?: string }) {
  return (
    <IconButton
      onClick={onClick}
      className={className}
      sx={{
        color: 'white',
        backgroundColor: 'transparent',
        padding: '6px',
        '&:hover': {
          backgroundColor: className === 'trending-header-item-with-icon' ? 'transparent' : '#e5e7eb',
          color: className === 'trending-header-item-with-icon' ? 'white' : 'black',
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

