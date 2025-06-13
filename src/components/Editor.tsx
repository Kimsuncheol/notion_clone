'use client';
import React, { useState, useCallback } from 'react';
import TitleInput from './TitleInput';
import BlocksHint from './BlocksHint';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Block, BlockType } from '@/types/blocks';
import {
  TextBlock as TextBlockComponent,
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

const Editor: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([createTextBlock()]);

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
    setBlocks((prev) => prev.map((b) => (b.id === id && b.type === 'text' ? { ...b, content } : b)));
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
  }, [focusBlock]);

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
      default:
        return null;
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <main className="flex-1 flex flex-col items-center overflow-y-auto py-10">
        <article className="w-full max-w-3xl px-6 space-y-4">
          <TitleInput />
          {/* <BlocksHint /> */}
          {blocks.map((b, idx) => renderBlock(b, idx))}
        </article>
      </main>
    </DndProvider>
  );
};

export default Editor; 