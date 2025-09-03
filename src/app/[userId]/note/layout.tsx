'use client'
import TrendingHeader from '@/components/trending/TrendingHeader';
import { grayColor2 } from '@/constants/color';

interface NoteLayoutProps {
  children: React.ReactNode;
}

export default function NoteLayout({ children }: NoteLayoutProps) {
  return (
    <div className={`w-[90%] mx-auto h-screen text-[color:var(--foreground)]`} style={{
      backgroundColor: grayColor2
    }}>
      <TrendingHeader />
      {children}
    </div>
  );
}
