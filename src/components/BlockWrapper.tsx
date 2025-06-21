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
  onRemoveBlock: (blockId: string) => void;
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
  onRemoveBlock,
  comments,
  onAddComment,
  onDeleteComment,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isMenuInteracting, setIsMenuInteracting] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
    updateMenuPosition();
  };

  const handleMouseLeave = () => {
    if (!isMenuInteracting) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovered(false);
      }, 150); // Small delay to allow moving to menu
    }
  };

  const handleMenuMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsMenuInteracting(true);
  };

  const handleMenuMouseLeave = () => {
    setIsMenuInteracting(false);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

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
      
      <div
        onMouseEnter={handleMenuMouseEnter}
        onMouseLeave={handleMenuMouseLeave}
      >
        <BlockHoverMenu
          blockId={blockId}
          blockType={blockType}
          isVisible={isHovered}
          position={menuPosition}
          onConvertBlock={onConvertBlock}
          onConvertStyled={onConvertStyled}
          onRemoveBlock={onRemoveBlock}
          comments={comments}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
        />
      </div>
    </>
  );
};

export default BlockWrapper; 