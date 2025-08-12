import React from 'react'
// import React, { useEffect, useRef, useState } from 'react'
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ImageIcon from '@mui/icons-material/Image';
import CommentIcon from '@mui/icons-material/Comment';
import { useAddaSubNoteSidebarStore } from '@/store/AddaSubNoteSidebarStore';
// import { IconButton } from '@mui/material';

interface MiniMarkdownToolbarItemProps {
  fileRef: React.RefObject<HTMLInputElement | null>;
}

export default function MiniMarkdownToolbar({ fileRef }: MiniMarkdownToolbarItemProps) {
  const commonStyle = 'p-4 flex gap-1 items-center hover:bg-gray-600/70 px-2 py-1 rounded-md';
  const iconSize = '16px';
  const {
    setShowEmojiPicker,
    isAddImageOn,
    setIsAddImageOn,
    isAddCommentOn,
    setIsAddCommentOn,
    isMiniMarkdownToolbarOn,
    setIsMiniMarkdownToolbarOn,
    imageUrl,
  } = useAddaSubNoteSidebarStore();

  return (
    <div className={`flex items-center px-20 hover:text-white/60 h-5 ${isMiniMarkdownToolbarOn ? 'flex' : 'text-transparent'}`}
      onMouseEnter={() => setIsMiniMarkdownToolbarOn(true)}
      onMouseLeave={() => setIsMiniMarkdownToolbarOn(false)}
    >
      <MiniMarkdownToolbarItem icon={<EmojiEmotionsIcon style={{ fontSize: iconSize }} />} text="Add icon" onClick={() => setShowEmojiPicker(true)} commonStyle={commonStyle} />
      {!imageUrl && <MiniMarkdownToolbarItem icon={<ImageIcon style={{ fontSize: iconSize }} />} text="Add image" onClick={() => setIsAddImageOn(!isAddImageOn)} commonStyle={commonStyle} />}
      {/* <FileUpload fileRef={fileRef} iconSize={iconSize} isMiniMarkdownToolbarOn={isMiniMarkdownToolbarOn} /> */}
      <MiniMarkdownToolbarItem icon={<CommentIcon style={{ fontSize: iconSize }} />} text="Add comment" onClick={() => setIsAddCommentOn(!isAddCommentOn)} commonStyle={commonStyle} />
    </div>
  )
}

function MiniMarkdownToolbarItem({ icon, text, onClick, commonStyle }: { icon: React.ReactNode, text: string, onClick: () => void, commonStyle: string }) {
  return (
    <div className={commonStyle}
      onClick={onClick}
    >
      {icon}
      <span className='text-sm'>{text}</span>
    </div>
  )
}