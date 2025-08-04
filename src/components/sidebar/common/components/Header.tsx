import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
// import StarIcon from '@mui/icons-material/Star';
import React from 'react'
import ShareIcon from '@mui/icons-material/Share';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface HeaderForAddaSubNoteSidebarProps {
  title: string;
  isSelectNoteModalOpen: boolean;
  setIsSelectNoteModalOpen: (isOpen: boolean) => void;
  callbacks: {
    onZoomOut: () => void;
  };
}

export default function HeaderForAddaSubNoteSidebar({ title, isSelectNoteModalOpen, setIsSelectNoteModalOpen, callbacks }: HeaderForAddaSubNoteSidebarProps) {
  return (
    <div className='w-full flex items-center justify-between px-4 pt-4 pb-2'>
      <div className='flex items-center gap-2'>
        <ZoomOutMapIcon style={{ fontSize: '16px', cursor: 'pointer' }} onClick={callbacks.onZoomOut} />
        <div className='text-sm font-semibold ml-5 flex items-center gap-[6px]' onClick={() => setIsSelectNoteModalOpen(true)}>
          <span className=''>Add to</span>
          <TextSnippetIcon style={{ fontSize: '16px' }} />
          <span className=''>{title}</span>
          <KeyboardArrowDownIcon style={{ fontSize: '16px' }} />
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
