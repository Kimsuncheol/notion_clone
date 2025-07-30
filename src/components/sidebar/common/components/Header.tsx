import CloseIcon from '@mui/icons-material/Close';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import React from 'react'

interface HeaderForAddaSubNoteSidebarProps {
  title: string;
  callbacks: {
    onZoomOut: () => void;
    onClose: () => void;
  };
}

export default function HeaderForAddaSubNoteSidebar({ title, callbacks }: HeaderForAddaSubNoteSidebarProps) {
  return (
    <div className='w-full flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <ZoomOutMapIcon style={{ fontSize: '16px', cursor: 'pointer' }} onClick={callbacks.onZoomOut} />
        <div className='text-sm font-semibold ml-5 flex items-center gap-[6px]'>
          <span className=''>Add to</span>
          <TextSnippetIcon style={{ fontSize: '16px' }} />
          <span className=''>{title}</span>
        </div>
      </div>
      <CloseIcon style={{ fontSize: '16px', cursor: 'pointer' }} onClick={callbacks.onClose} />
    </div>
  )
}
