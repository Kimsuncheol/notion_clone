import CloseIcon from '@mui/icons-material/Close';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import StarBorderIcon from '@mui/icons-material/StarBorder';
// import StarIcon from '@mui/icons-material/Star';
import React from 'react'
import ShareIcon from '@mui/icons-material/Share';

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
      <div className='flex items-center gap-[10px]'>
        <ShareIcon style={{ fontSize: '16px', cursor: 'pointer' }} />
        <StarBorderIcon style={{ fontSize: '16px', cursor: 'pointer' }} />
        <CloseIcon style={{ fontSize: '16px', cursor: 'pointer' }} onClick={callbacks.onClose} />
      </div>
    </div>
  )
}
