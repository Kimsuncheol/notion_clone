import React from 'react';

interface RecentLayoutProps {
  children: React.ReactNode;
}

export default function RecentLayout({ children }: RecentLayoutProps) {
  return (
    <div className="min-h-screen bg-[#262626]">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}
