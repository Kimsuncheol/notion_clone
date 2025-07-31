import React, { useEffect, useState } from 'react';
import { getViewportSize } from './utils/viewportsizeUtils';
import HeaderForAddaSubNoteSidebar from './common/components/Header';
import { getNoteTitle } from '@/services/firebase';
import MarkdownEditor from '../MarkdownEditor';

interface AddaSubNoteSidebarProps {
  selectedNoteId: string;
  onClose: () => void;
  offsetY: number;
}

export default function AddaSubNoteSidebar({ selectedNoteId, onClose, offsetY }: AddaSubNoteSidebarProps) {
  const { width, height } = getViewportSize();
  const [title, setTitle] = useState('');
  const [left, setLeft] = useState(() => (width - (width * 0.8)) / 2);

  useEffect(() => {
    const fetchNoteTitle = async () => {
      const title = await getNoteTitle(selectedNoteId);
      setTitle(title);
    };

    const updateLeft = () => {
      setLeft((width - (width * 0.8)) / 2);
      // setLeft((offsetX - (width * 0.7)) / 2 + 240);
    };

    fetchNoteTitle();
    updateLeft();

    window.addEventListener('resize', updateLeft);
    return () => window.removeEventListener('resize', updateLeft);
  }, [selectedNoteId, width]);

  return (
    <div className='p-4 box-border fixed z-[9999] overflow-hidden dark:bg-[#262626] shadow-lg rounded-md' style={{ left: `${left}px`, top: `${height * 0.125}px`, width: `${width * 0.8}px`, height: `${height * 0.75}px` }}>
      {/* Top Bar */}
      <HeaderForAddaSubNoteSidebar title={title} callbacks={{ onClose, onZoomOut: () => {} }} />
      {/* Content Area */}
      <div className='flex mt-4  w-full overflow-y-hidden h-[calc(100%-80px)]'>
        <MarkdownEditor
          pageId={selectedNoteId}
          onSaveTitle={setTitle}
          onBlockCommentsChange={() => {}}
          isPublic={false}
          isPublished={false}
          isSubNote={true}
        />
      </div>
      <div className='h-10 w-full bg-transparent'>
      </div>
    </div>
  )
}
