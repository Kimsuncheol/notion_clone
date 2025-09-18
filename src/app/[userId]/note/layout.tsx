'use client'
import { grayColor2 } from '@/constants/color';

interface NoteLayoutProps {
  children: React.ReactNode;
}

export default function NoteLayout({ children }: NoteLayoutProps) {
  return (
    <div className={`w-[80%] mx-auto h-screen text-[color:var(--foreground)]`} style={{
      backgroundColor: grayColor2
    }}>
      {children}
    </div>
  );
}
