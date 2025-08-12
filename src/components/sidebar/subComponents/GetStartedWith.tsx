import React, { useState } from 'react'
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import ArticleIcon from '@mui/icons-material/Article';
import ResearchFormModal from '@/components/dashboard/ResearchFormModal';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { NoteCreationProvider } from '@/contexts/NoteCreationContext';

function GetStartedWith() {
  const auth = getAuth(firebaseApp);
  const [openResearch, setOpenResearch] = useState(false);
  const [askText, setAskText] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className='px-20 pt-4 pb-[46px] h-[120px] w-full bg-[#262626] absolute bottom-0 left-0 flex flex-col gap-4'>
      <div className='text-white/50 text-xs font-bold'>Get started with</div>
      <div className='flex gap-2'>
        <GetStartedWithItem title='Research' icon={<AllInclusiveIcon sx={{ color: 'red', fontSize: '16px' }} />} onClick={() => setOpenResearch(true)} />
        <GetStartedWithItem title='Form' icon={<ArticleIcon sx={{ color: 'white', fontSize: '16px' }} />} onClick={() => {}} />
      </div>

      <NoteCreationProvider>
        <ResearchFormModal
          open={openResearch}
          onClose={() => setOpenResearch(false)}
          askText={askText}
          onAskTextChange={setAskText}
          isUserAuthenticated={!!auth.currentUser}
          selectedFiles={files}
          onFilesSelect={setFiles}
        />
      </NoteCreationProvider>
    </div>
  )
}

export default GetStartedWith

function GetStartedWithItem({ title, icon, onClick }: { title: string, icon: React.ReactNode, onClick: () => void }) {
  return (
    <div className='flex items-center gap-[6px] bg-white/10 font-bold rounded-full py-1 px-3' onClick={onClick}>
      {icon}
      <div className='text-white text-sm'>{title}</div>
    </div>
  )
}