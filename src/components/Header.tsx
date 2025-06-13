'use client';
import React from 'react';

interface Props {
  onOpenManual: () => void;
}

const Header: React.FC<Props> = ({ onOpenManual }) => (
  <header className="w-full flex items-center justify-end px-6 py-2 border-b border-black/10 dark:border-white/10 bg-[color:var(--background)] sticky top-0 z-30">
    <button
      onClick={onOpenManual}
      className="rounded px-3 py-1 text-sm bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20"
    >
      📖 Manual
    </button>
  </header>
);

export default Header; 