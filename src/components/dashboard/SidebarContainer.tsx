'use client';
import React, { useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import Sidebar, { SidebarHandle } from '@/components/Sidebar';
interface SidebarContainerProps {
  user: User | null;
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
  selectedPageId: string;
  onSelectPage: (pageId: string) => void;
}

const SidebarContainer: React.FC<SidebarContainerProps> = ({
  user,
  sidebarVisible,
  setSidebarVisible,
  selectedPageId,
  onSelectPage,
}) => {
  const sidebarRef = useRef<SidebarHandle>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setSidebarVisible(!sidebarVisible);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarVisible, setSidebarVisible]);


  if (!user) {
    return null;
  }

  return (
    <>
      {sidebarVisible && (
        <Sidebar
          ref={sidebarRef}
          selectedPageId={selectedPageId}
          onSelectPage={onSelectPage}
        />
      )}
    </>
  );
};

export default SidebarContainer; 