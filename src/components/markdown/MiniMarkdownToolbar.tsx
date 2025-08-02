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
  const { isAddIconOn, setIsAddIconOn, isAddImageOn, setIsAddImageOn, isAddCommentOn, setIsAddCommentOn, isMiniMarkdownToolbarOn, setIsMiniMarkdownToolbarOn } = useAddaSubNoteSidebarStore();

  return (
    <div className={`flex items-center px-28 hover:text-white/60 h-5 ${isMiniMarkdownToolbarOn ? 'flex' : 'text-transparent'}`}
      onMouseEnter={() => setIsMiniMarkdownToolbarOn(true)}
      onMouseLeave={() => setIsMiniMarkdownToolbarOn(false)}
    >
      <MiniMarkdownToolbarItem icon={<EmojiEmotionsIcon style={{ fontSize: iconSize }} />} text="Add icon" onClick={() => setIsAddIconOn(!isAddIconOn)} commonStyle={commonStyle} />
      <MiniMarkdownToolbarItem icon={<ImageIcon style={{ fontSize: iconSize }} />} text="Add image" onClick={() => setIsAddImageOn(!isAddImageOn)} commonStyle={commonStyle} />
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

// function FileUpload({ fileRef, iconSize, isMiniMarkdownToolbarOn }: { fileRef: React.RefObject<HTMLInputElement | null>, iconSize: string, isMiniMarkdownToolbarOn: boolean }) {
//   const iconButtonRef = useRef<HTMLButtonElement>(null);
//   const [inputWidth, setInputWidth] = useState(0);
//   const [inputHeight, setInputHeight] = useState(0);
//   useEffect(() => {
//     if (iconButtonRef.current) {
//       setInputWidth(iconButtonRef.current.offsetWidth);
//       setInputHeight(iconButtonRef.current.offsetHeight);
//     }
//   }, [isMiniMarkdownToolbarOn]);
//   return (
//     <div className='hover:bg-gray-600/70 rounded-md relative'>
//       <IconButton
//         ref={iconButtonRef}
//         sx={{
//           color: isMiniMarkdownToolbarOn ? 'white' : 'transparent',
//           opacity: isMiniMarkdownToolbarOn ? 0.6 : 0,
//           padding: '4px 8px',
//         }}
//         aria-label='file-upload'
//         className='flex items-center gap-1'
//       >
//         <ImageIcon style={{ fontSize: iconSize }} />
//         <span className='text-sm'>Add image</span>
//       </IconButton>
//       <input type='file' id='file-upload' className='absolute top-0 left-0' ref={fileRef} accept='image/*' aria-label='file-upload' style={{ width: inputWidth, height: inputHeight }} />
//     </div>
//   )
// }