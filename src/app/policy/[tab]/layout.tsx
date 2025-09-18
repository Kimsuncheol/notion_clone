'use client'
import TrendingHeader from '@/components/trending/TrendingHeader';
import { grayColor2 } from '@/constants/color';

interface PolicyLayoutProps {
  children: React.ReactNode;
}

export default function PolicyLayout({ children }: PolicyLayoutProps) {
  return (
    <div className={`h-screen text-[color:var(--foreground)]`} style={{
      backgroundColor: grayColor2
    }}>
      {children}
    </div>
  );
}
