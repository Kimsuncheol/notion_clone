import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
// import StarIcon from '@mui/icons-material/Star';
import React from 'react'
import ShareIcon from '@mui/icons-material/Share';

interface HeaderForAddaSubNoteSidebarProps {
  title: string;
  callbacks: {
    onZoomOut: () => void;
  };
}

export default function HeaderForAddaSubNoteSidebar({ title, callbacks }: HeaderForAddaSubNoteSidebarProps) {
  return (
    <div className='w-full flex items-center justify-between p-4'>
      <div className='flex items-center gap-2'>
        <ZoomOutMapIcon style={{ fontSize: '16px', cursor: 'pointer' }} onClick={callbacks.onZoomOut} />
        <div className='text-sm font-semibold ml-5 flex items-center gap-[6px]'>
          <span className=''>Add to</span>
          <TextSnippetIcon style={{ fontSize: '16px' }} />
          <span className=''>{title}</span>
        </div>
      </div>
      <div className='flex items-center'>
        <HeaderItemForAddaSubNoteSidebar icon={<ShareIcon style={{ fontSize: '16px', cursor: 'pointer' }} />} onClick={() => {}} />
        <HeaderItemForAddaSubNoteSidebar icon={<StarBorderIcon style={{ fontSize: '16px', cursor: 'pointer' }} />} onClick={() => {}} />
        <HeaderItemForAddaSubNoteSidebar icon={<MoreHorizIcon style={{ fontSize: '16px', cursor: 'pointer' }} />} onClick={() => {}} />
      </div>
    </div>
  )
}

function HeaderItemForAddaSubNoteSidebar({ icon, onClick }: { icon: React.ReactNode, onClick: () => void }) {
  return (
    <div className='hover:bg-gray-600/50 hover:text-white/60 px-2 py-1 rounded-md cursor-pointer' onClick={onClick}>
      {icon}
    </div>
  )
}
