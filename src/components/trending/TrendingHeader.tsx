'use client'

import { grayColor2 } from '@/constants/color'
import { Avatar, IconButton, Box } from '@mui/material'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import React, { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { usePathname, useRouter } from 'next/navigation';

import Link from 'next/link';
import Image from 'next/image';
import { useTrendingStore } from '@/store/trendingStore';
import TrendingHeaderModal from './TrendingHeaderModal';
import TrendingNewPostModal from './TrendingNewPostModal';
import SignInModal from '../SignInModal';
import SignUpModal from '../SignUpModal';
import { useMarkdownStore } from '@/store/markdownEditorContentStore';
import { fetchUserProfile } from '@/services/my-post/firebase';
import toast from 'react-hot-toast';
import { useShowSignInUpModalStore } from '@/store/showSignInUpModal';
import { NOTE_NAVIGATION_BLOCK_MESSAGE, shouldBlockNoteNavigation } from '@/utils/noteNavigation';

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
  const pathname = usePathname();
  const { isTrendingHeaderModalOpen, setIsTrendingHeaderModalOpen } = useTrendingStore();
  const { showSignInModal, setShowSignInModal, showSignUpModal, setShowSignUpModal } = useShowSignInUpModalStore();
  const { avatar, setAvatar, setDisplayName, title, content, viewMode } = useMarkdownStore();
  const shouldPreventNavigation = shouldBlockNoteNavigation(pathname, viewMode, title, content);
  const showBlockedNavigationToast = () => toast.error(NOTE_NAVIGATION_BLOCK_MESSAGE);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState<boolean>(false);
  const [shouldShowHandwritingModal, setShouldShowHandwritingModal] = useState<boolean>(false);

  const handleGuardedNavigation = (
    event: React.MouseEvent,
    navigate: () => void,
  ) => {
    if (shouldPreventNavigation) {
      event.preventDefault();
      event.stopPropagation();
      showBlockedNavigationToast();
      return;
    }
    navigate();
  };

  useEffect(() => {
    const fetchUserProfileFromFirebase = async () => {
      const userProfile = await fetchUserProfile(user?.email || '');
      if (userProfile) {
        setAvatar(userProfile.avatar!);
        setDisplayName(userProfile.displayName!);
      } else {
        setAvatar(user?.photoURL || '');
        setDisplayName(user?.displayName || '');
      }
    }
    fetchUserProfileFromFirebase();
  }, [user, setAvatar, setDisplayName]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = window.navigator.userAgent.toLowerCase();
    const isIPad =
      ua.includes('ipad') ||
      (ua.includes('macintosh') && window.navigator.maxTouchPoints > 1);
    const isGalaxyTab = ua.includes('sm-t') || ua.includes('galaxy tab');
    const isGalaxyBookPro360 = ua.includes('galaxy book pro 360');

    setShouldShowHandwritingModal(isIPad || isGalaxyTab || isGalaxyBookPro360);
  }, []);

  const options: MenuItem[] = [
    { label: 'My Notes', value: 'my-notes', path: `/${user?.email}/posts/all`, icon: 'notes' },
    { label: 'Drafts', value: 'drafts', path: `/${user?.email}/drafts`, icon: 'drafts' },
    { label: 'Reading list', value: 'reading-list', path: `/${user?.email}/lists/liked`, icon: 'reading-list' },
    { label: 'Settings', value: 'settings', path: `/${user?.email}/settings`, icon: 'settings' },
    { label: 'Sign Out', value: 'sign-out', path: `/${user?.email}/trending/week`, icon: 'signout' },
  ]

  const handleNewPostClick = async () => {
    const auth = getAuth(firebaseApp);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      // Handle non-authenticated users - redirect to sign in
      setShowSignInModal(true);
      return;
    }

    const isOnNoteRoute = pathname?.includes('/note');
    if (isOnNoteRoute && (!title.trim() || !content.trim())) {
      toast.error('Please add a title and content before creating another note.');
      return;
    }

    if (shouldShowHandwritingModal) {
      setIsNewPostModalOpen(true);
      return;
    }

    router.push(`/${currentUser.email}/note`);
  };

  const handleCreateMarkdownNote = () => {
    const currentEmail = auth.currentUser?.email;
    if (!currentEmail) return;
    setIsNewPostModalOpen(false);
    router.push(`/${currentEmail}/note`);
  };

  const handleCreateHandwritingNote = () => {
    const currentEmail = auth.currentUser?.email;
    if (!currentEmail) return;
    setIsNewPostModalOpen(false);
    router.push(`/${currentEmail}/handwriting`);
  };

  return (
    <header className="flex justify-between items-center px-2 py-4 relative" style={{ backgroundColor: grayColor2 }}>
      <Link
        href={`/${user?.email}/trending/week`}
        className="text-2xl font-bold cursor-pointer"
        onClick={(event) => {
          if (!shouldPreventNavigation) return;
          event.preventDefault();
          event.stopPropagation();
          showBlockedNavigationToast();
        }}
      >
        {/* ratio 24 : 9 */}
        <Image src="/note_logo.png" alt="logo" width={150} height={100} style={{ objectFit: 'cover', aspectRatio: '2/1' }} />
      </Link>
      <div className='flex items-center gap-4'>
        {/* Ring */}
        <TrendingHeaderItemWithIcon
          icon={<NotificationsNoneRoundedIcon sx={{ fontSize: 24 }} />}
          onClick={(event) =>
            handleGuardedNavigation(event, () => router.push(`/${user?.email}/inbox`))
          }
        />
        {/* Search Icon */}
        <TrendingHeaderItemWithIcon
          icon={<SearchOutlinedIcon sx={{ fontSize: 24 }} />}
          onClick={(event) =>
            handleGuardedNavigation(event, () => router.push(`/${user?.email}/search`))
          }
        />
        {/* New Post Icon */}
        <TrendingHeaderItemWithLabel label="New Post" onClick={handleNewPostClick} />
        {/* Avatar Select */}
        {/* If user is not logged in, show login text button */}
        {user ? (
          <TrendingHeaderItemWithIcon
            icon={
              <Box sx={{ display: 'flex', marginRight: '4px' }}>
                <Avatar
                  src={avatar || ''}
                  sx={{ width: 32, height: 32 }}
                />
              </Box>
            }
            onClick={() => { setIsTrendingHeaderModalOpen(!isTrendingHeaderModalOpen) }}
            className='trending-header-item-with-icon'
          />
        ) : (
          <TrendingHeaderItemWithLabel label="Login" onClick={() => {
            setShowSignInModal(true);
            setShowSignUpModal(false);
          }} />
        )}
      </div>
      {isTrendingHeaderModalOpen && (
         <TrendingHeaderModal
          options={options}
          onClose={() => setIsTrendingHeaderModalOpen(false)}
          router={router}
          shouldPreventNavigation={shouldPreventNavigation}
          onBlockedNavigation={showBlockedNavigationToast}
        />
      )}
      {isNewPostModalOpen && (
        <TrendingNewPostModal
          onClose={() => setIsNewPostModalOpen(false)}
          onCreateMarkdown={handleCreateMarkdownNote}
          onCreateHandwriting={handleCreateHandwritingNote}
        />
      )}
      {showSignInModal && (
        <SignInModal
          onClose={() => {
            setShowSignInModal(false);
            setShowSignUpModal(false);
          }}
          onSignUp={() => {
            setShowSignInModal(false);
            setShowSignUpModal(true);
          }} />
      )}
      {showSignUpModal && (
        <SignUpModal
          onClose={() => {
            setShowSignInModal(false);
            setShowSignUpModal(false);
          }}
          onSignIn={() => {
            setShowSignInModal(true);
            setShowSignUpModal(false);
          }} />
      )}
    </header>
  )
}

function TrendingHeaderItemWithIcon({
  icon,
  onClick,
  className,
}: {
  icon?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}) {
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
  );
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
