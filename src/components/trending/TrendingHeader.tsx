'use client'
import { modalBgColor2, trendingPageBgColor, trendingPageSelectionColor, trendingPageTextColor, trendingPageWidgetColor } from '@/constants/color'
import { Avatar, IconButton, Select, MenuItem, Box } from '@mui/material'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import React from 'react'
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { useRouter } from 'next/navigation';
import { addNewNoteHandler } from '@/utils/write';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useMarkdownEditorContentStore } from '@/store/markdownEditorContentStore';
import Link from 'next/link';
import Image from 'next/image';

export default function TrendingHeader() {
  const { setContent, setTitle, setViewMode } = useMarkdownEditorContentStore();
  const dispatch = useAppDispatch();
  const { folders } = useAppSelector((state) => state.sidebar);
  const { content, title } = useMarkdownEditorContentStore();
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  const router = useRouter();

  const options = [
    // { label: 'Profile', value: 'profile', path: `/my-post/${user?.email}`, icon: 'profile' },
    { label: 'My Notes', value: 'my-notes', path: `/my-post/${user?.email}/posts`, icon: 'notes' },
    { label: 'Settings', value: 'settings', path: '/settings', icon: 'settings' },
    { label: 'Sign Out', value: 'sign-out', path: '/trending/week', icon: 'signout' },
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

  const handleSelectChange = (value: string) => {
    const selectedOption = options.find(option => option.value === value);
    if (selectedOption) {
      if (value === 'sign-out') {
        // Handle sign out logic here
        auth.signOut().then(() => {
          router.push('/trending/week');
        });
      } else {
        router.push(selectedOption.path);
      }
    }
  };

  return (
    <header className="flex justify-between items-center px-2 py-3 relative" style={{ backgroundColor: trendingPageBgColor }}>
      <Link href="/dashboard" className="text-2xl font-bold cursor-pointer">
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
        <TrendingHeaderAvatarSelect 
          options={options}
          userPhotoURL={user?.photoURL || ''}
          onSelectionChange={handleSelectChange}
        />
      </div>
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

function TrendingHeaderAvatarSelect({ 
  options, 
  userPhotoURL, 
  onSelectionChange 
}: { 
  options: { label: string, value: string, path: string, icon: string }[], 
  userPhotoURL: string,
  onSelectionChange: (value: string) => void 
}) {
  const [selectedValue, setSelectedValue] = React.useState('profile');

  const menuItemStyle = {
    fontSize: 14,
    minWidth: '160px',
    color: trendingPageTextColor,
    backgroundColor: trendingPageWidgetColor,
    '&:hover': {
      backgroundColor: trendingPageSelectionColor,
      color: trendingPageTextColor,
    },
    '&.Mui-selected': {
      backgroundColor: trendingPageSelectionColor,
      color: trendingPageTextColor,
    },
    '&.Mui-selected:hover': {
      backgroundColor: trendingPageSelectionColor,
      color: trendingPageTextColor,
    },
  }

  return (
    <Select
      variant='standard'
      disableUnderline
      value={selectedValue}
      onChange={(e) => {
        const newValue = e.target.value as string;
        setSelectedValue(newValue);
        onSelectionChange(newValue);
      }}
      renderValue={() => (
        <Box sx={{ display: 'flex' }}>
          <Avatar 
            src={userPhotoURL} 
            sx={{ width: 32, height: 32 }} 
          />
        </Box>
      )}
      sx={{
        color: 'white',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '20px',
        '& .MuiSelect-icon': { color: 'white' },
        '& .MuiSelect-select': { padding: '0px' },
        '& .MuiSelect-select:hover': { backgroundColor: 'transparent' },
        '& .MuiOutlinedInput-root': {
          border: 'none',
          '& fieldset': { border: 'none' },
          '&:hover fieldset': { border: 'none' },
          '&.Mui-focused fieldset': { border: 'none' },
        },
        '&:hover': { backgroundColor: 'transparent', '& .MuiSelect-select': { color: 'black' }, '& svg': { color: 'black' } },
      }}
      MenuProps={{
        PaperProps: {
          sx: {
            backgroundColor: trendingPageWidgetColor,
            color: trendingPageTextColor,
            padding: '8px',
            marginTop: '8px',
            borderRadius: '12px',
            minWidth: '160px',
          },
        },
      }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value} sx={menuItemStyle}>
          <span>{option.label}</span>
        </MenuItem>
      ))}
    </Select>
  )
}
