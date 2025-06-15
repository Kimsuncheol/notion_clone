'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  onOpenManual: () => void;
}

const Header: React.FC<Props> = ({ onOpenManual }) => {
  const pathname = usePathname();

  return (
    <header className="w-full flex items-center justify-end px-6 py-2 border-b border-black/10 dark:border-white/10 bg-[color:var(--background)] sticky top-0 z-30">
      {
        pathname !== '/dashboard' && (
          <Link href="/dashboard" className="rounded px-3 py-1 text-sm bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 flex items-center gap-1 mr-2">
            <span>🌐</span>
            <span>Dashboard</span>
          </Link>
        )
      }

      <Link href="/signin" className="rounded px-3 py-1 text-sm bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 flex items-center gap-1">
        <span>🔑</span>
        <span className="sr-only">Sign In</span>
      </Link>

      <button
        onClick={onOpenManual}
        className="rounded px-3 py-1 text-sm bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 ml-2"
      >
        📖 Manual
      </button>
    </header>
  );
};

export default Header; 