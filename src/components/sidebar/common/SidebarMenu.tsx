import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import SearchIcon from '@mui/icons-material/Search';
import InboxIcon from '@mui/icons-material/Inbox';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { useModalStore } from '@/store/modalStore';

interface SidebarMenuProps {
  setShowSearchModal: (show: boolean) => void;
  // setShowInbox: (show: boolean) => void;
  unreadNotificationCount: number;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({
  setShowSearchModal,
  // setShowInbox,
  unreadNotificationCount,
}) => {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { showInbox, setShowInbox } = useModalStore();

  return (
    <nav className="flex flex-col gap-[2px]" ref={menuRef}>
      {/* Search Bar */}
      <div className="flex items-center gap-1 px-2 py-1 text-sm font-semibold tracking-wide text-white rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setShowSearchModal(true)}>
        <SearchIcon style={{ fontSize: '20px' }} />
        <span>Search</span>
      </div>

      {/* Trending Section */}

      <div
        onClick={() => router.push('/trending/week')}
        className="w-full flex items-center gap-1 px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-left text-sm"
      >
        <TrendingUpOutlinedIcon className="text-green-400 text-sm" style={{ fontSize: '20px' }} />
        Trending
      </div>

      {/* Inbox Section */}
        <div
          onClick={() => setShowInbox(!showInbox)}
          id="inbox-toggle"
          className="w-full flex items-center gap-[6px] px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-left text-sm"
        >
          <InboxIcon className="text-blue-400 text-sm" style={{ fontSize: '18px' }} />
          Inbox
          {unreadNotificationCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadNotificationCount}
            </span>
        )}
      </div>
    </nav>
  );
};

export default SidebarMenu; 