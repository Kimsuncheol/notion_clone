import React from 'react';

export default function InboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-[80%] mx-auto">
      {children}
    </div>
  );
}
