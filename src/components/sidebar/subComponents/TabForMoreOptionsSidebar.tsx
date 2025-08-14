import React from 'react'
import { useSidebarStore } from '@/store/sidebarStore';

interface TabForMoreOptionsSidebarProps {
  selectedNoteId: string;
  selectedSubNoteId?: string;
  title: string;
  icon: React.ReactNode[];
  onClick: () => void;
  isInFavorites?: boolean;
  isSubNote?: boolean;
  allSubNotesTrashed?: boolean; // New prop to track if all sub-notes are trashed
}

const TabForMoreOptionsSidebar: React.FC<TabForMoreOptionsSidebarProps> = ({ title, icon, onClick, isInFavorites = false, selectedSubNoteId, allSubNotesTrashed = false }) => {
  const isDelete = title === 'Delete';
  const isDeleteSubNote = isDelete && selectedSubNoteId;
  const isDeleteAllSubNotes = title === 'Move all sub-notes to Trash';
  // const isDeleteAllSubNotes = title === 'Move all sub-notes to Trash' && selectedSubNoteId;
  const isMoveToFolder = (title.includes('Move to the') && title.includes('folder')) && selectedSubNoteId;
  const { spreadSubNoteList, hasSubNotes } = useSidebarStore();

  // if the selectedSubNoteId is not equal to null, then don't show the 'Move all sub-notes to Trash' and 'Move to the folder'
  if (selectedSubNoteId && (isDeleteAllSubNotes || isMoveToFolder || isDeleteSubNote)) {
    return null;
  }
  // if the note doesn't have any sub-notes, then don't show the 'Move all sub-notes to Trash'.
  if (!hasSubNotes && isDeleteAllSubNotes) {
    return null;
  }

  if (allSubNotesTrashed && isDeleteAllSubNotes) {
    return null;
  }

  // if not all the sub-notes moved to the trash, then don't show the 'Move all sub-notes to Trash'.

  return (
    <div className='w-full p-1 flex items-center gap-2 bg-transparent hover:bg-gray-700/80 rounded-md z-[9999] cursor-pointer' onClick={onClick}>
      {title.includes('Favorites') ? (isInFavorites ? icon[0] : icon[1]) : icon[0]}
      <span className='text-xs'>{title}</span>
      {/* <span className='text-xs'>{hasSubNotes ? 'has sub-notes' : 'no sub-notes'}</span> */}
    </div>
  );
}

export default TabForMoreOptionsSidebar;