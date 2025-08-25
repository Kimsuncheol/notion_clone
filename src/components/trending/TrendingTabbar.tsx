'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { grayColor2 } from '@/constants/color';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import RssFeedRoundedIcon from '@mui/icons-material/RssFeedRounded';
import TrendingTabbarModal from './TrendingTabbarModal';

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

  const navbarList = [
    { label: 'Trending', value: 'trending', path: '/trending/week', icon: <TrendingUpOutlinedIcon sx={{ fontSize: 20 }} /> },
    { label: 'Recent', value: 'recent', path: '/recent', icon: <AccessTimeRoundedIcon sx={{ fontSize: 20 }} /> },
    { label: 'Feed', value: 'feed', path: '/feed', icon: <RssFeedRoundedIcon sx={{ fontSize: 20 }} /> },
  ];

  return (
    <div className="flex justify-between items-center p-2" style={{ backgroundColor: grayColor2 }}>
      <nav className="flex space-x-2">
        {navbarList.map((item) => (
          <TabLink href={item.path} isActive={pathname === item.path} key={item.value}>
            {item.icon}
            {item.label}
          </TabLink>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <TrendingTabbarModal
          options={[{ label: 'Day', value: 'day', path: '/trending/day' },
          { label: 'Week', value: 'week', path: '/trending/week' },
          { label: 'Month', value: 'month', path: '/trending/month' },
          { label: 'Year', value: 'year', path: '/trending/year' }]}
          router={router}
        />
        <button
          className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="More options"
          aria-label="More options"
        >
          <MoreVertIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
}
