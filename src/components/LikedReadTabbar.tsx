import React from 'react';
import Link from 'next/link';
import { grayColor2 } from '@/constants/color';

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

interface LikedReadTabbarProps {
  userEmail: string;
  currentPath: string;
}

export default function LikedReadTabbar({ userEmail, currentPath }: LikedReadTabbarProps) {

  const navbarList = [
    { label: 'Liked Posts', value: 'liked', path: `/${userEmail}/lists/liked`},
    { label: 'Recent Read Posts', value: 'recent', path: `/${userEmail}/lists/read` },
  ];

  return (
    <div className="flex justify-between items-center p-2" style={{ backgroundColor: grayColor2 }}>
      <nav className="flex space-x-2">
        {navbarList.map((item) => (
          <TabLink href={item.path} isActive={currentPath === item.path} key={item.value}>
            {item.label}
          </TabLink>
        ))}
      </nav>
    </div>
  );
}
