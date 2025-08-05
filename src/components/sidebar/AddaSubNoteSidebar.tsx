import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getViewportSize } from './utils/viewportsizeUtils';
import HeaderForAddaSubNoteSidebar from './common/components/Header';
import { deleteSubNotePage, getNoteTitle } from '@/services/firebase';
import MarkdownEditor from '../MarkdownEditor';
import MiniMarkdownToolbar from '../markdown/MiniMarkdownToolbar';
import { useAddaSubNoteSidebarStore } from '@/store/AddaSubNoteSidebarStore';
import Image from 'next/image';
import ImagePickerModal from './ImagePickerModal';
import AddaComment from '../markdown/AddaComment';
import GetStartedWith from './subComponents/GetStartedWith';
import SelectNoteModal from './subComponents/SelectNoteModal';
import toast from 'react-hot-toast';

interface AddaSubNoteSidebarProps {
  selectedNoteIdFromParent: string;
  onClose: () => void;
}

export default function AddaSubNoteSidebar({ selectedNoteIdFromParent, onClose }: AddaSubNoteSidebarProps) {
  const { width, height } = getViewportSize();
  const [title, setTitle] = useState<string>('');
  const [left, setLeft] = useState<number>(() => (width - (width * 0.8)) / 2);
  const AddaSubNotesidebarRef = useRef<HTMLDivElement>(null);
  const [isClickedImage, setIsClickedImage] = useState<boolean>(false);
  const {
    setIsAddIconOn,
    isAddImageOn,
    imageUrl,
    isAddCommentOn,
    content,
    isSelectNoteModalOpen,
    subNoteId,
    setImageUrl,
    setIsAddImageOn,
    setIsAddCommentOn,
    setIsSelectNoteModalOpen,
    selectedNoteId,
    selectedNoteTitle,
    setContent
  } = useAddaSubNoteSidebarStore();
  const pickerRef = useRef<HTMLDivElement>(null);
  const commentRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [start, setStart] = useState<{ mx: number, my: number, x: number, y: number }>({ mx: 0, my: 0, x: 50, y: 50 });
  const [pos, setPos] = useState<{ x: number, y: number }>({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [startReposition, setStartReposition] = useState<boolean>(false);

  const deleteEmptySubNote = useCallback(async () => {
    if (!selectedNoteIdFromParent || !subNoteId) return;

    const isContentEmpty = !content || content.trim().length === 0;

    if (isContentEmpty) {
      try {
        await deleteSubNotePage(selectedNoteIdFromParent, subNoteId);
        toast.success('Empty sub note deleted successfully');
      } catch (error) {
        console.error('Failed to delete empty sub note:', error);
        toast.error('Failed to delete empty sub note');
      } finally {
        setIsAddIconOn(false);
      }
    }
  }, [selectedNoteIdFromParent, subNoteId, content, setIsAddIconOn]);

  useEffect(() => {
    const fetchNoteTitle = async () => {
      const title = await getNoteTitle(selectedNoteIdFromParent);
      setTitle(title);
    };

    const updateLeft = () => {
      setLeft((width - (width * 0.8)) / 2);
    };

    fetchNoteTitle();
    updateLeft();

    window.addEventListener('resize', updateLeft);
    return () => window.removeEventListener('resize', updateLeft);
  }, [selectedNoteId, width, selectedNoteIdFromParent]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (AddaSubNotesidebarRef.current && !AddaSubNotesidebarRef.current.contains(event.target as Node)) {
        deleteEmptySubNote();
        setContent('');
        onClose();
      }
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsAddIconOn(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsAddIconOn, onClose, deleteEmptySubNote, setContent]);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isDragging) return;
      const dx = e.clientX - start.mx;
      const dy = e.clientY - start.my;
      const { width, height } = imageContainerRef.current?.getBoundingClientRect() || { width: 0, height: 0 };
      setPos({
        x: Math.min(100, Math.max(0, start.x + (dx / width) * 100)),
        y: Math.min(100, Math.max(0, start.y + (dy / height) * 100)),
      });
    }
    function onMouseUp() { setIsDragging(false); }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
  }, [isDragging, start]);

  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    const { clientX: mx, clientY: my } = e;
    setStart({ mx, my, x: pos.x, y: pos.y });
    setIsDragging(true);
  }

  return (
    <>
      {/* Dark overlay backdrop */}
      <div className='fixed inset-0 bg-black/50 z-[9998]' onClick={() => setIsAddImageOn(false)} />
      <div ref={AddaSubNotesidebarRef} className='flex flex-col box-border fixed z-[9999] overflow-y-hidden bg-[#262626] shadow-lg rounded-md' style={{ left: `${left}px`, top: `${height * 0.125}px`, width: `${width * 0.8}px`, height: `${height * 0.75}px` }} id='adda-sub-note-sidebar'>
        {/* <div ref={AddaSubNotesidebarRef} className='flex flex-col box-border fixed z-[9999] overflow-y-auto dark:bg-[#262626] shadow-lg rounded-md no-scrollbar' style={{ left: `${left}px`, top: `${height * 0.125}px`, width: `${width * 0.8}px`, height: `${height * 0.75}px` }} id='adda-sub-note-sidebar'> */}
        {/* Top Bar */}
        <HeaderForAddaSubNoteSidebar title={selectedNoteTitle || title} isSelectNoteModalOpen={isSelectNoteModalOpen} setIsSelectNoteModalOpen={setIsSelectNoteModalOpen} callbacks={{ onZoomOut: () => { } }} />
        {isSelectNoteModalOpen && <SelectNoteModal title={title} isOpen={isSelectNoteModalOpen} selectedNoteId={selectedNoteId} onClose={() => setIsSelectNoteModalOpen(false)} />}
        <div className='flex flex-col gap-6 pt-6' id='main-content-of-adda-sub-note-sidebar'>
          {imageUrl && (
            <div className={`w-full h-[200px] relative overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`} ref={imageContainerRef} onClick={() => setIsClickedImage(true)} onMouseDown={(e) => {
              if (!startReposition) return;
              onMouseDown(e);
            }}>
              <Image
                src={imageUrl}
                alt='add-image'
                layout='fill'
                objectFit='cover'
                sizes='100vw'
                style={{ objectPosition: `${pos.x}% ${pos.y}%` }}
              />
              {isClickedImage && (
                <div className='absolute top-2.5 h-1/5 bg-black/50 flex items-center justify-center gap-4 px-4 rounded-md' style={{ left: 'calc(70%)' }}>
                  {/* Save position after clicking the Reposition button */}
                  {startReposition && (
                    <div className='text-white text-sm border-r border-white/50 pr-4' onClick={() => {
                      setStartReposition(false);
                      setIsAddImageOn(true);
                    }}>Save position</div>
                  )}
                  {!startReposition && (
                    <div className='text-white text-sm border-r border-white/50 pr-4' onClick={() => setIsAddImageOn(true)}>Change over</div>
                  )}
                  {/* Cancel after clicking the Reposition button */}
                  {startReposition && (
                    <div className='text-white text-sm' onClick={() => {
                      // TODO: Save position to database
                      // TODO: Save image to database
                      // TODO: Get back to the previous position
                      setStartReposition(false);
                      setIsAddImageOn(true);
                    }}>Cancel</div>
                  )}
                  {!startReposition && (
                    <div className='text-white text-sm' onClick={() => setStartReposition(true)}>Reposition</div>
                  )}
                </div>
              )}
            </div>
          )}
          {/* Mini markdown editor utility Toolbar */}
          <MiniMarkdownToolbar fileRef={fileRef} />
          {isAddCommentOn && <AddaComment onClose={() => setIsAddCommentOn(false)} selectedNoteId={selectedNoteId} ref={commentRef} />}
          {/* Content Area */}
          <div className={`flex px-20 w-full overflow-y-hidden`} style={{ height: `${height * 0.75 - 120}px` }}>
            <MarkdownEditor
              pageId={selectedNoteId}
              onSaveTitle={setTitle}
              onBlockCommentsChange={() => { }}
              isPublic={false}
              isPublished={false}
              isSubNote={true}
              parentId={selectedNoteIdFromParent}
            />
          </div>
          <GetStartedWith />
          {isAddImageOn && <ImagePickerModal pickerRef={pickerRef} onClose={() => setIsAddImageOn(false)} imageUrl={imageUrl} setImageUrl={setImageUrl} />}
        </div>
      </div>
    </>
  )
}
