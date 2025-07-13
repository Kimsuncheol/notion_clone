import React from 'react';
import WorkspaceHeader from './WorkspaceHeader';
import SidebarMenu from './items/SidebarMenu';

interface TopSectionProps {
  // Props for WorkspaceHeader
  showProfile: boolean;
  setShowProfile: (show: boolean) => void;
  addNewNoteHandler: (mode: 'markdown') => void;
  isLoading: boolean;

  // Props for SidebarMenu
  setShowSearchModal: (show: boolean) => void;
  setShowInbox: (show: boolean) => void;
  unreadNotificationCount: number;
}

const TopSection: React.FC<TopSectionProps> = (props) => {
  return (
    <div className='flex flex-col gap-2'>
      <WorkspaceHeader
        showProfile={props.showProfile}
        setShowProfile={props.setShowProfile}
        addNewNoteHandler={props.addNewNoteHandler}
        isLoading={props.isLoading}
      />
      <SidebarMenu
        setShowSearchModal={props.setShowSearchModal}
        setShowInbox={props.setShowInbox}
        unreadNotificationCount={props.unreadNotificationCount}
      />
    </div>
  );
};

export default TopSection; 