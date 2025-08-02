import React, { useEffect, useRef, useState } from 'react';
import { getViewportSize } from './utils/viewportsizeUtils';
import HeaderForAddaSubNoteSidebar from './common/components/Header';
import { getNoteTitle } from '@/services/firebase';
import MarkdownEditor from '../MarkdownEditor';
import MiniMarkdownToolbar from '../markdown/MiniMarkdownToolbar';
import { useAddaSubNoteSidebarStore } from '@/store/AddaSubNoteSidebarStore';
import EmojiPickerModal from '../EmojiPickerModal';
import { handleEmojiSelect } from '../utils/emojiUtils';
import { EditorView } from '@codemirror/view';
import Image from 'next/image';
import ImagePickerModal from './ImagePickerModal';

interface AddaSubNoteSidebarProps {
  selectedNoteId: string;
  onClose: () => void;
}

export default function AddaSubNoteSidebar({ selectedNoteId, onClose }: AddaSubNoteSidebarProps) {
  const { width, height } = getViewportSize();
  const [title, setTitle] = useState('');
  const [left, setLeft] = useState(() => (width - (width * 0.8)) / 2);
  const AddaSubNotesidebarRef = useRef<HTMLDivElement>(null);
  const { isAddIconOn, setIsAddIconOn, setContent, isAddImageOn, imageUrl, setImageUrl, setIsAddImageOn } = useAddaSubNoteSidebarStore();
  const pickerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorView | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchNoteTitle = async () => {
      const title = await getNoteTitle(selectedNoteId);
      setTitle(title);
    };

    const updateLeft = () => {
      setLeft((width - (width * 0.8)) / 2);
    };

    fetchNoteTitle();
    updateLeft();

    window.addEventListener('resize', updateLeft);
    return () => window.removeEventListener('resize', updateLeft);
  }, [selectedNoteId, width]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (AddaSubNotesidebarRef.current && !AddaSubNotesidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsAddIconOn(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, setIsAddIconOn]);

  return (
    <div ref={AddaSubNotesidebarRef} className='flex flex-col box-border gap-6 fixed z-[9999] overflow-hidden dark:bg-[#262626] shadow-lg rounded-md' style={{ left: `${left}px`, top: `${height * 0.125}px`, width: `${width * 0.8}px`, height: `${height * 0.75}px` }} id='adda-sub-note-sidebar'>
      {/* Top Bar */}
      <HeaderForAddaSubNoteSidebar title={title} callbacks={{ onZoomOut: () => {} }} />
      {isAddImageOn && imageUrl ? (<Image src={imageUrl} alt='add-image' width={width * 0.8} className='overflow-x-visible' height={height * 0.75 * 0.3} />) : <div className={`w-full h-[${height * 0.75 * 0.3}px] bg-gray-200`} />}
      {/* Mini markdown editor utility Toolbar */}
      <MiniMarkdownToolbar fileRef={fileRef} />
      {/* Content Area */}
      <div className='flex px-32 w-full overflow-y-hidden h-[calc(100%-80px)]'>
        <MarkdownEditor
          pageId={selectedNoteId}
          onSaveTitle={setTitle}
          onBlockCommentsChange={() => {}}
          isPublic={false}
          isPublished={false}
          isSubNote={true}
        />
      </div>
      <div className='p-4 h-10 w-full bg-transparent'>
      </div>
      {isAddIconOn && <EmojiPickerModal pickerRef={pickerRef} handleEmojiSelect={(emojiData) => handleEmojiSelect(emojiData, editorRef, setContent, setIsAddIconOn)} isDarkMode={true} />}
      {isAddImageOn && <ImagePickerModal pickerRef={pickerRef} onClose={() => setIsAddImageOn(false)} imageUrl={imageUrl} setImageUrl={setImageUrl} />}
    </div>
  )
}
