import { trendingPageBgColor } from '@/constants/color';
import React from 'react';

interface TrendingLayoutProps {
  children: React.ReactNode;
}

export default function TrendingLayout({ children }: TrendingLayoutProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: trendingPageBgColor }}>
      <div className="w-[80%] mx-auto">
        {children}
      </div>
    </div>
  );
}
