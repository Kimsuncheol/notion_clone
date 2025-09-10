'use client'
import TrendingHeader from '@/components/trending/TrendingHeader';
import { grayColor2 } from '@/constants/color';

interface TagsLayoutProps {
  children: React.ReactNode;
}

export default function TagsLayout({ children }: TagsLayoutProps) {
  return (
    <div className={`h-screen text-[color:var(--foreground)]`} style={{
      backgroundColor: grayColor2
    }}>
      <div className='w-[90%] mx-auto'>
        <TrendingHeader />
      </div>
      {children}
    </div>
  );
}
