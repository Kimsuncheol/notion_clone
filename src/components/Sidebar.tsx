'use client';
import React from 'react';

interface SidebarButtonProps {
  icon: string;
  label: string;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ icon, label }) => (
  <button className="flex items-center gap-2 rounded px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">
    <span>{icon}</span>
    <span className="truncate">{label}</span>
  </button>
);

const Sidebar: React.FC = () => {
  return (
    <aside className="hidden sm:block w-60 shrink-0 border-r border-black/10 dark:border-white/10 py-6 px-4">
      <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Workspace
      </div>
      <nav className="flex flex-col gap-1">
        <SidebarButton icon="📝" label="Untitled" />
        <SidebarButton icon="➕" label="Add page" />
      </nav>
    </aside>
  );
};

export default Sidebar; 