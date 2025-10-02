'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { grayColor2 } from '@/constants/color';

import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import RssFeedRoundedIcon from '@mui/icons-material/RssFeedRounded';
import AssistantOutlinedIcon from '@mui/icons-material/AssistantOutlined';

import TrendingTabbarModal from './TrendingTabbarModal';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import TrendingTabbarMoreOptionsModal from '../TrendingTabbarMoreOptionsModal';

interface TabLinkProps {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
}

const TabLink = ({ href, children, isActive }: TabLinkProps) => (
  <Link
    href={href}
    className={`px-4 py-2 flex items-center gap-2 font-medium transition-colors ${isActive
      ? 'border-b-2 border-white'
      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
  >
    {children}
  </Link>
);

export default function TrendingTabbar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  const url = window.location.href;
  console.log('url: ', url);
  const tab = url.split('/').slice(4, -1).join('/');
  // homepage
  const homeTab = url.split('/').slice(3, -1).join('/');
  console.log('homeTab: ', homeTab);
  const timeframe = url.split('/').pop();
  console.log('tab: ', tab);
  console.log('timeframe: ', timeframe);
  const path = (pathname: string) => {
    if (user) {
      return `/${user.email}/${pathname}`;
    }
    return `/${pathname}`;
  }

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
          <TabLink href={item.path[0]} isActive={item.path[0] === pathname || item.path[1] === pathname} key={item.value}>
          {/* <TabLink href={item.path} isActive={pathname === item.path} key={item.value}> */}
            {item.icon}
            {item.label}
          </TabLink>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <TrendingTabbarModal
          options={[{ label: 'Day', value: 'day', path: `/${user?.email}/trending/day` },
          { label: 'Week', value: 'week', path: `${user?.email}/trending/week` },
          { label: 'Month', value: 'month', path: `/${user?.email}/trending/month` },
          { label: 'Year', value: 'year', path: `/${user?.email}/trending/year` }]}
          router={router}
          tab={tab}
          timeframe={timeframe}
          userEmail={user?.email || ''}
        />
        <TrendingTabbarMoreOptionsModal />
      </div>
    </div>
  );
}
