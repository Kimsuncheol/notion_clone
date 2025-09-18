import React from 'react';

interface ReadLayoutProps {
  children: React.ReactNode;
}

export default function ReadLayout({ children }: ReadLayoutProps) {
  return (
    <div className="min-h-screen bg-[#262626]">
      <div className="w-[80%] mx-auto">
        {children}
      </div>
    </div>
  );
}
