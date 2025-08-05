import React from 'react'

interface TabForMoreOptionsSidebarProps {
  selectedNoteId: string;
  selectedSubNoteId?: string;
  title: string;
  icon: React.ReactNode[];
  onClick: () => void;
  isInFavorites?: boolean;
}

const TabForMoreOptionsSidebar: React.FC<TabForMoreOptionsSidebarProps> = ({ title, icon, onClick, isInFavorites = false }) => {
  return (
    <div className='w-full p-1 flex items-center gap-2 bg-transparent hover:bg-gray-700/80 rounded-md z-[9999] cursor-pointer' onClick={onClick}>
      {isInFavorites? icon[0] : icon[1]}
      <span className='text-xs'>{title}</span>
    </div>
  );
}

export default TabForMoreOptionsSidebar;