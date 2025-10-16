'use client';

import React from 'react';
// import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { grayColor2 } from '@/constants/color';

import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import RssFeedRoundedIcon from '@mui/icons-material/RssFeedRounded';
import AssistantOutlinedIcon from '@mui/icons-material/AssistantOutlined';

import TrendingTabbarModal from './TrendingTabbarModal';
import TrendingTabbarMoreOptionsModal from '../TrendingTabbarMoreOptionsModal';
import { useAuth } from '@/contexts/AuthContext';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { User } from 'firebase/auth';
import { useShowSignInUpModalStore } from '@/store/showSignInUpModal';

interface TabLinkProps {
  user: User | null;
  router: AppRouterInstance;
  href: string;
  children: React.ReactNode;
  isActive: boolean;
  setShowSignInModal: (value: boolean) => void;
}

const TabLink = ({ user, router, href, children, isActive, setShowSignInModal }: TabLinkProps) => (
  <div
    onClick={() => {
      if (!isActive) {
        if (href === '/ai' && !user) {
          setShowSignInModal(true);
          return;
        }
        router.push(href);
      }
    }}
    className={`px-4 py-2 flex items-center gap-2 font-medium transition-colors ${isActive
      ? 'border-b-2 border-white'
      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
  >
    {children}
  </div>
);

export default function TrendingTabbar() {
  const pathname = usePathname();
  const router = useRouter();
  // const auth = getAuth(firebaseApp);
  const auth = useAuth();
  const user = auth.currentUser;
  const { setShowSignInModal } = useShowSignInUpModalStore();


  const knownTabs = ['trending', 'recent', 'feed', 'ai'];
  const timeframeOptions = ['day', 'week', 'month', 'year'];

  const segments = pathname.split('/').filter(Boolean);
  const tabIndex = segments.findIndex((segment) => knownTabs.includes(segment));
  const tab = tabIndex >= 0 ? segments[tabIndex] : '';
  const timeframeCandidate = tabIndex >= 0 ? segments[tabIndex + 1] : undefined;
  const timeframe = timeframeCandidate && timeframeOptions.includes(timeframeCandidate)
    ? timeframeCandidate
    : undefined;

  const path = (targetPath: string) => {
    const base = user ? `/${user.email}` : '';
    if (!targetPath || targetPath === '/') {
      return base || '/';
    }
    if (targetPath.startsWith('/')) {
      return `${base}${targetPath}`;
    }
    return `${base}/${targetPath}`;
  };

  const navbarList = [
    { label: 'Trending', value: 'trending', path: [path(`trending/${tab === 'trending' && timeframe ? timeframe : 'week'}`), path('/')], icon: <TrendingUpOutlinedIcon sx={{ fontSize: 20 }} /> },
    { label: 'Recent', value: 'recent', path: [path('recent')], icon: <AccessTimeRoundedIcon sx={{ fontSize: 20 }} /> },
    { label: 'Feed', value: 'feed', path: [path('feed')], icon: <RssFeedRoundedIcon sx={{ fontSize: 20 }} /> },
    { label: 'AI', value: 'ai', path: [path('ai')], icon: <AssistantOutlinedIcon sx={{ fontSize: 20 }} /> },
  ];

  return (
    <div className="flex justify-between items-center flex-wrap p-2" style={{ backgroundColor: grayColor2 }}>
      <nav className="flex space-x-2 items-center flex-wrap">
        {navbarList.map((item) => (
          <TabLink user={user} router={router} href={item.path[0]} isActive={item.path[0] === pathname || item.path[1] === pathname} key={item.value} setShowSignInModal={setShowSignInModal}>
            {item.icon}
            {item.label}
          </TabLink>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <TrendingTabbarModal
          options={[{ label: 'Day', value: 'day', path: `${user?.email || ''}/trending/day` },
          { label: 'Week', value: 'week', path: `${user?.email || ''}/trending/week` },
          { label: 'Month', value: 'month', path: `${user?.email || ''}/trending/month` },
          { label: 'Year', value: 'year', path: `${user?.email || ''}/trending/year` }]}
          router={router}
          timeframe={timeframe}
          userEmail={user?.email || ''}
        />
        <TrendingTabbarMoreOptionsModal />
      </div>
    </div>
  );
}
