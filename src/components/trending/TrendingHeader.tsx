'use client'
import { grayColor2 } from '@/constants/color'
import { Avatar, IconButton, MenuItem, Box } from '@mui/material'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import React, { useState } from 'react'
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { useRouter } from 'next/navigation';


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

  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  const router = useRouter();
  const [isClickedOther, setIsClickedOther] = useState<boolean>(false);
  const { isTrendingHeaderModalOpen, setIsTrendingHeaderModalOpen } = useTrendingStore();

  const options: MenuItem[] = [
    { label: 'My Notes', value: 'my-notes', path: `/${user?.email}/posts/all`, icon: 'notes' },
    { label: 'Drafts', value: 'drafts', path: `/${user?.email}/drafts`, icon: 'drafts' },
    { label: 'Reading list', value: 'reading-list', path: `/${user?.email}/lists/liked`, icon: 'reading-list' },
    { label: 'Settings', value: 'settings', path: `/${user?.email}/settings`, icon: 'settings' },
    { label: 'Sign Out', value: 'sign-out', path: `/${user?.email}/trending/week`, icon: 'signout' },
    { label: 'Others', value: 'others', path: `/${user?.email}/others`, icon: 'others' },

    { label: 'Profile', value: 'profile', path: `/${user?.email}/profile/${user?.uid}`, icon: 'profile' },
    { label: 'Templates', value: 'templates', path: `/${user?.email}/templates`, icon: 'templates' },
    { label: 'Help & Contact', value: 'help-contact', path: `/${user?.email}/help-contact`, icon: 'help-contact' },
  ]

  const handleNewPostClick = async () => {
    const auth = getAuth(firebaseApp);
    
    if (!auth.currentUser) {
      // Handle non-authenticated users - redirect to sign in
      router.push('/signin');
      return;
    }

    // Simple navigation to note creation without complex handler
    router.push(`/${user?.email}/note`);
  };

  return (
    <header className="flex justify-between items-center px-2 py-3 relative" style={{ backgroundColor: grayColor2 }}>
      <Link href={`/${user?.email}/trending/week`} className="text-2xl font-bold cursor-pointer">
        <Image src="/note_logo.png" alt="logo" width={32} height={32} />
      </Link>
      <div className='flex items-center gap-4'>
        {/* Ring */}
        <TrendingHeaderItemWithIcon icon={<NotificationsNoneRoundedIcon sx={{ fontSize: 24 }} />} href={`/${user?.email}/inbox`} />
        {/* Search Icon */}
        <TrendingHeaderItemWithIcon icon={<SearchOutlinedIcon sx={{ fontSize: 24 }} />} href={`/${user?.email}/search`} />
        {/* New Post Icon */}
        <TrendingHeaderItemWithLabel label="New Post" onClick={handleNewPostClick} />
        {/* Avatar Select */}
        {/* If user is not logged in, show login text button */}
        {user ? (
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
        ) : (
          <TrendingHeaderItemWithLabel label="Login" onClick={() => { router.push('/signin') }} />
        )}
      </div>
      {isTrendingHeaderModalOpen && (
        <TrendingHeaderModal
          options={options.slice(0, 6)}
          subOptions={options.slice(6)}
          onClose={() => setIsTrendingHeaderModalOpen(false)}
          router={router}
          isClickedOther={isClickedOther}
          setIsClickedOther={setIsClickedOther} />
      )}
    </header>
  )
}

function TrendingHeaderItemWithIcon({ icon, href, onClick, className }: { icon?: React.ReactNode, href?: string, onClick?: () => void, className?: string }) {
  return (
    <Link href={href || ''}>
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
    </Link>
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

