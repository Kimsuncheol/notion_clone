import React, { useEffect, useState } from 'react';
import { getViewportSize } from './utils/viewportsizeUtils';
import HeaderForAddaSubNoteSidebar from './common/components/Header';
import { getNoteTitle } from '@/services/firebase';

interface AddaSubNoteSidebarProps {
  selectedNoteId: string;
  onClose: () => void;
  offsetY: number;
}

export default function AddaSubNoteSidebar({ selectedNoteId, onClose, offsetY }: AddaSubNoteSidebarProps) {
  const { width, height } = getViewportSize();
  const [title, setTitle] = useState('');

  useEffect(() => {
    const fetchNoteTitle = async () => {
      const title = await getNoteTitle(selectedNoteId);
      setTitle(title);
    };
    fetchNoteTitle();
  }, [selectedNoteId]);

  return (
    <div className='p-2 fixed left-60 z-[9999] dark:bg-[#262626] shadow-lg rounded-md' style={{ top: `${offsetY}px`, width: `${width * 0.7}px`, height: `${height * 0.9 - offsetY}px` }}>
      {/* Top Bar */}
      <HeaderForAddaSubNoteSidebar title={title} callbacks={{ onClose, onZoomOut: () => {} }} />
      {/* Content Area */}
      <div className=''></div>
    </div>
  )
}
