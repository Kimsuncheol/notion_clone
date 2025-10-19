import React from 'react';

interface HandwritingLayoutProps {
  children: React.ReactNode;
}

export default function HandwritingLayout({ children }: HandwritingLayoutProps) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full h-full">
        {children}
      </div>
    </div>
  );
}
