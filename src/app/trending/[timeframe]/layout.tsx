import TrendingHeader from '@/components/trending/TrendingHeader';
import { grayColor2} from '@/constants/color';
import React from 'react';

interface TrendingLayoutProps {
  children: React.ReactNode;
}

export default function TrendingLayout({ children }: TrendingLayoutProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: grayColor2 }}>
      <div className="w-[80%] mx-auto">
        <TrendingHeader />
        {children}
      </div>
    </div>
  );
}
