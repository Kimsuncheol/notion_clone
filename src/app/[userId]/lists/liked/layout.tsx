import TrendingHeader from '@/components/trending/TrendingHeader';
import React from 'react';

interface LikedLayoutProps {
  children: React.ReactNode;
}

export default function LikedLayout({ children }: LikedLayoutProps) {
  return (
    <div className="min-h-screen bg-[#262626]">
      <div className="w-[80%] mx-auto">
        <TrendingHeader />
        {children}
      </div>
    </div>
  );
}
