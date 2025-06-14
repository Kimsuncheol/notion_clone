'use client';
import React, { useState, useRef, useEffect, ReactNode } from 'react';
import BlockHoverMenu from './BlockHoverMenu';
import { BlockType } from '@/types/blocks';
import { Comment } from '@/types/comments';

interface BlockWrapperProps {
  blockId: string;
  blockType: BlockType;
  children: ReactNode;
  onConvertBlock: (blockId: string, newType: BlockType) => void;
  onConvertStyled: (blockId: string, className: string) => void;
  comments: Comment[];
  onAddComment: (blockId: string, text: string) => void;
  onDeleteComment: (blockId: string, commentId: string) => void;
}

const BlockWrapper: React.FC<BlockWrapperProps> = ({
  blockId,
  blockType,
  children,
  onConvertBlock,
  onConvertStyled,
  comments,
  onAddComment,
  onDeleteComment,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const blockRef = useRef<HTMLDivElement>(null);

  const updateMenuPosition = () => {
    if (blockRef.current) {
      const rect = blockRef.current.getBoundingClientRect();
      setMenuPosition({
        x: rect.left,
        y: rect.top + rect.height / 2 - 20, // Center vertically on the block
      });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    updateMenuPosition();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Update position on scroll or resize
  useEffect(() => {
    if (isHovered) {
      const handleScroll = () => updateMenuPosition();
      const handleResize = () => updateMenuPosition();

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isHovered]);

  return (
    <>
      <div
        ref={blockRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative group"
      >
        {children}
      </div>
      
      <BlockHoverMenu
        blockId={blockId}
        blockType={blockType}
        isVisible={isHovered}
        position={menuPosition}
        onConvertBlock={onConvertBlock}
        onConvertStyled={onConvertStyled}
        comments={comments}
        onAddComment={onAddComment}
        onDeleteComment={onDeleteComment}
      />
    </>
  );
};

export default BlockWrapper; 