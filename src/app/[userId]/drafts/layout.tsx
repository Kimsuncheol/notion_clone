import TrendingHeader from '@/components/trending/TrendingHeader';
import React from 'react';

export default function SavesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-[80%] mx-auto">
      <TrendingHeader />
      {children}
    </div>
  );
}
