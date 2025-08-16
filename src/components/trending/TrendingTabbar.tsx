"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { bgColor } from '@/constants/color';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import RssFeedRoundedIcon from '@mui/icons-material/RssFeedRounded';
import { useTrendingStore } from '@/store/trendingStore';
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
  const { selectedTimeframe, setSelectedTimeframe } = useTrendingStore();

  return (
    <div className="flex justify-between items-center p-2" style={{ backgroundColor: bgColor }}>
      <nav className="flex space-x-2">
        <TabLink href={`/trending/${selectedTimeframe}`} isActive={pathname === `/trending/${selectedTimeframe}`}>
          <TrendingUpOutlinedIcon sx={{ fontSize: 20 }} />
          Trending
        </TabLink>
        <TabLink href="/recent" isActive={pathname === '/recent'}>
          <AccessTimeRoundedIcon sx={{ fontSize: 20 }} />
          Recent
        </TabLink>
        <TabLink href="/feed" isActive={pathname === '/feed'}>
          <RssFeedRoundedIcon sx={{ fontSize: 20 }} />
          Feed
        </TabLink>
      </nav>

      <div className="flex items-center gap-2">
        <TrendingTabbarModal
          options={[{ label: 'Day', value: 'day', path: '/trending/day' },
          { label: 'Week', value: 'week', path: '/trending/week' },
          { label: 'Month', value: 'month', path: '/trending/month' },
          { label: 'Year', value: 'year', path: '/trending/year' }]}
          selectedValue={selectedTimeframe}
          setSelectedValue={setSelectedTimeframe}
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
