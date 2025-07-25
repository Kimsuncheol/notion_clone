import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchIcon from '@mui/icons-material/Search';
import InboxIcon from '@mui/icons-material/Inbox';
import HomeIcon from '@mui/icons-material/Home';

interface SidebarMenuProps {
  setShowSearchModal: (show: boolean) => void;
  setShowInbox: (show: boolean) => void;
  unreadNotificationCount: number;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({
  setShowSearchModal,
  setShowInbox,
  unreadNotificationCount,
}) => {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (menuRef.current) {
      const height = menuRef.current.offsetHeight;
      console.log(`SidebarMenu height: ${height}px`);
    }
  }, [unreadNotificationCount]);

  return (
    <nav className="flex flex-col gap-1" ref={menuRef}>
      {/* Search Bar */}
      <div className="flex items-center px-2 py-1 text-sm font-semibold tracking-wide text-white" onClick={() => setShowSearchModal(true)}>
        <SearchIcon />
        <span>Search</span>
      </div>

      {/* Home Section */}
      <div className="">
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-left"
        >
          <span className="flex items-center">
            <HomeIcon className="text-green-400 text-sm mr-2" style={{ fontSize: '16px' }} />
            Dashboard
          </span>
        </button>
      </div>

      {/* Inbox Section */}
      <div className="mb-4">
        <button
          onClick={() => setShowInbox(true)}
          className="w-full flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-left"
        >
          <span className="flex items-center">
            <InboxIcon className="text-blue-400 text-sm mr-2" style={{ fontSize: '16px' }} />
            Inbox
            {unreadNotificationCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadNotificationCount}
              </span>
            )}
          </span>
        </button>
      </div>
    </nav>
  );
};

export default SidebarMenu; 