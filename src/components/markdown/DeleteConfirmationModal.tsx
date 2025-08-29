import { grayColor1, mintColor1 } from '@/constants/color';
import { deleteNote } from '@/services/markdown/firebase';
import { useMarkdownEditorContentStore } from '@/store/markdownEditorContentStore';
import { useRouter } from 'next/navigation';
import React from 'react'

interface DeleteConfirmationModalProps {
  pageId: string;
}

export default function DeleteConfirmationModal({ pageId }: DeleteConfirmationModalProps) {
  const { setShowDeleteConfirmation } = useMarkdownEditorContentStore();
  const router = useRouter();
  // The modal should move to the center of the screen from the bottom of the screen
  return (
    <div className='fixed inset-0 bg-black/50 flex justify-center items-center z-50'>
      <div className='p-6 rounded-md' style={{ backgroundColor: grayColor1 }}>
        <h1 className='text-white text-xl font-bold mb-2'  >Delete Note</h1>
        <p className='text-white'>Are you sure you want to delete this note?</p>
        <p className='text-white mb-10'>This action cannot be undone.</p>
        <div className='flex justify-end gap-2 mt-4'>
          <button className='text-white font-bold hover:bg-gray-600 px-4 py-2 rounded-md cursor-pointer' onClick={() => setShowDeleteConfirmation(false)}>Cancel</button>
          <button className='text-black font-bold px-4 py-2 rounded-md cursor-pointer'
            style={{ backgroundColor: mintColor1 }}
            onClick={() => {
              deleteNote(pageId);
              setShowDeleteConfirmation(false);
              router.push('/trending/week');
            }}>Delete</button>
        </div>
      </div>
    </div>
  )
}
