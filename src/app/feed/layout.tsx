import React from 'react';

interface FeedLayoutProps {
  children: React.ReactNode;
}

export default function FeedLayout({ children }: FeedLayoutProps) {
  return (
    <div className="min-h-screen bg-[#262626]">
      <div className="w-[80%] mx-auto">
        {children}
      </div>
    </div>
  );
}
