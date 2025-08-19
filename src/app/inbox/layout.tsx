import TrendingHeader from '@/components/trending/TrendingHeader';
import React from 'react';

export default function InboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-7xl mx-auto">
      <TrendingHeader />
      {children}
    </div>
  );
}
