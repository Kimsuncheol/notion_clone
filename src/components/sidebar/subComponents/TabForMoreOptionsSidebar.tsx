import React from 'react'

interface TabForMoreOptionsSidebarProps {
  selectedNoteId: string;
  title: string;
  icon: React.ReactNode[];
  onClick: () => void;
}

const TabForMoreOptionsSidebar: React.FC<TabForMoreOptionsSidebarProps> = ({ selectedNoteId, title, icon, onClick }) => {
  return (
    <div className='w-full p-1 flex items-center gap-2 bg-black/10 rounded-md z-[9999]' onClick={onClick}>
      {icon.map((icon, index) => (
        <div key={index}>{icon}</div>
      ))}
      <span className='text-sm'>{title}</span>
    </div>
  );
}

export default TabForMoreOptionsSidebar;