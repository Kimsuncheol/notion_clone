'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import TitleInput from './TitleInput';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Block, BlockType } from '@/types/blocks';
import type { StyledTextBlock as StyledBlockType } from '@/types/blocks';
import { fetchNoteContent, updateNoteContent } from '@/services/firebase';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';
import {
  TextBlock as TextBlockComponent,
  StyledTextBlock,
  ListBlock,
  TableBlock,
  ChartBlock,
  ImageBlock,
  PdfBlock,
} from './blocks';

// Simple id generator to avoid external dependency
const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const createTextBlock = (): Block => ({ id: generateId(), type: 'text', content: '' });

interface Props { 
  pageId: string;
  onSaveTitle: (title: string) => void; 
}

const Editor: React.FC<Props> = ({ pageId, onSaveTitle }) => {
  const [blocks, setBlocks] = useState<Block[]>([createTextBlock()]);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const auth = getAuth(firebaseApp);
  const titleRef = useRef<string>('');
  const blocksRef = useRef<Block[]>([]);

  // Update refs when state changes
  useEffect(() => {
    titleRef.current = title;
    blocksRef.current = blocks;
  }, [title, blocks]);

  // Load note content when pageId changes
  useEffect(() => {
    const loadNoteContent = async () => {
      if (!pageId || !auth.currentUser) return;

      setIsLoading(true);
      try {
        const noteContent = await fetchNoteContent(pageId);
        if (noteContent) {
          setTitle(noteContent.title);
          setBlocks(noteContent.blocks.length > 0 ? noteContent.blocks : [createTextBlock()]);
        } else {
          // New page - start with empty content
          setTitle('');
          setBlocks([createTextBlock()]);
        }
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Error loading note content:', error);
        toast.error('Failed to load note content');
      } finally {
        setIsLoading(false);
      }
    };

    loadNoteContent();
  }, [pageId, auth.currentUser]);

  // Save function
  const saveNote = useCallback(async (showToast = true) => {
    if (!pageId || !auth.currentUser) return;

    try {
      await updateNoteContent(pageId, titleRef.current, blocksRef.current);
      setHasUnsavedChanges(false);
      if (showToast) {
        toast.success('Note saved');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      if (showToast) {
        toast.error('Failed to save note');
      }
    }
  }, [pageId, auth.currentUser]);

  // Auto-save when user stops typing (debounced)
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      saveNote(false); // Don't show toast for auto-save
    }, 2000); // Save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [hasUnsavedChanges, saveNote, title, blocks]);

  // Keyboard shortcut for save (Cmd+S / Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveNote(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [saveNote]);

  // Helper to find block index by id
  const findIndexById = (id: string) => blocks.findIndex((b) => b.id === id);

  const focusBlock = useCallback((index: number, selector: string = 'input') => {
    if (index < 0 || index >= blocks.length) return;
    setTimeout(() => {
      const el = document.querySelector<HTMLElement>(`[data-block-index="${index}"] ${selector}`);
      el?.focus();
    }, 0);
  }, [blocks]);

  const addTextAfter = useCallback((id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const newBlocks = [...prev];
      newBlocks.splice(idx + 1, 0, createTextBlock());
      // After state update, focus new block
      setTimeout(() => focusBlock(idx + 1), 0);
      return newBlocks;
    });
    setHasUnsavedChanges(true);
  }, [blocks, focusBlock]);

  const removeBlock = useCallback((id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx <= 0) return prev; // don't remove first block
      const newBlocks = [...prev];
      newBlocks.splice(idx, 1);
      // focus previous block
      setTimeout(() => focusBlock(idx - 1), 0);
      return newBlocks;
    });
    setHasUnsavedChanges(true);
  }, [focusBlock]);

  const listToText = useCallback((id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const newBlocks = [...prev];
      newBlocks[idx] = { id, type: 'text', content: '' } as Block;
      setTimeout(() => focusBlock(idx), 0);
      return newBlocks;
    });
    setHasUnsavedChanges(true);
  }, [focusBlock]);

  const moveFocusPrev = useCallback((id: string) => {
    const idx = findIndexById(id);
    focusBlock(idx - 1);
  }, [blocks, focusBlock]);

  const moveFocusNext = useCallback((id: string) => {
    const idx = findIndexById(id);
    focusBlock(idx + 1);
  }, [blocks, focusBlock]);

  const updateBlockContent = useCallback((id: string, content: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id && (b.type === 'text' || b.type === 'styled') ? { ...b, content } : b)));
    setHasUnsavedChanges(true);
  }, []);

  const convertBlock = useCallback((id: string, component: BlockType) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const newBlocks = [...prev];
      newBlocks[idx] = { id, type: component } as Block;
      newBlocks.splice(idx + 1, 0, createTextBlock());
      // focus new block below
      setTimeout(() => focusBlock(idx + 1), 0);
      return newBlocks;
    });
    setHasUnsavedChanges(true);
  }, [focusBlock]);

  const convertStyled = useCallback((id: string, className: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const newBlocks = [...prev];
      newBlocks[idx] = { id, type: 'styled', className, content: '' } as Block;
      newBlocks.splice(idx + 1, 0, createTextBlock());
      setTimeout(() => focusBlock(idx + 1), 0);
      return newBlocks;
    });
    setHasUnsavedChanges(true);
  }, [focusBlock]);

  const handleTitleSave = useCallback((newTitle: string) => {
    setTitle(newTitle);
    setHasUnsavedChanges(true);
    onSaveTitle(newTitle);
  }, [onSaveTitle]);

  const renderBlock = (block: Block, index: number) => {
    switch (block.type) {
      case 'text':
        return (
          <div key={block.id} data-block-index={index}>
            <TextBlockComponent
              block={block}
              onUpdate={updateBlockContent}
              onConvert={convertBlock}
              onAddBelow={addTextAfter}
              onArrowPrev={moveFocusPrev}
              onArrowNext={moveFocusNext}
              onRemove={removeBlock}
              onConvertStyled={convertStyled}
            />
          </div>
        );
      case 'list':
        return (
          <div key={block.id} data-block-index={index}>
            <ListBlock
              onArrowPrevBlock={() => focusBlock(index - 1)}
              onArrowNextBlock={() => focusBlock(index + 1)}
              toTextBlock={() => listToText(block.id)}
            />
          </div>
        );
      case 'table':
        return (
          <div key={block.id} data-block-index={index}>
            <TableBlock
              onArrowPrevBlock={() => focusBlock(index - 1)}
              onArrowNextBlock={() => focusBlock(index + 1)}
            />
          </div>
        );
      case 'chart':
        return (
          <div key={block.id} data-block-index={index}>
            <ChartBlock />
          </div>
        );
      case 'image':
        return (
          <div key={block.id} data-block-index={index}>
            <ImageBlock />
          </div>
        );
      case 'pdf':
        return (
          <div key={block.id} data-block-index={index}>
            <PdfBlock />
          </div>
        );
      case 'styled':
        return (
          <div key={block.id} data-block-index={index}>
            <StyledTextBlock
              block={block as StyledBlockType}
              onUpdate={updateBlockContent}
              onArrowPrev={moveFocusPrev}
              onArrowNext={moveFocusNext}
              onConvertToText={listToText}
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <DndProvider backend={HTML5Backend}>
        <main className="flex-1 flex flex-col items-center justify-center overflow-y-auto py-10">
          <div className="text-gray-500">Loading note...</div>
        </main>
      </DndProvider>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <main className="flex-1 flex flex-col items-center overflow-y-auto py-10">
        <article className="w-full max-w-3xl px-6 space-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <TitleInput onSave={handleTitleSave} initialValue={title} />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {hasUnsavedChanges && (
                <span className="text-orange-500">Unsaved changes</span>
              )}
              <button
                onClick={() => saveNote(true)}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={!hasUnsavedChanges}
              >
                Save (⌘S)
              </button>
            </div>
          </div>
          {blocks.map((b, idx) => renderBlock(b, idx))}
        </article>
      </main>
    </DndProvider>
  );
};

export default Editor; 