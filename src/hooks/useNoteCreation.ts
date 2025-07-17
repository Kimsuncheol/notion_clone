import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getFolderByType, loadSidebarData } from '@/store/slices/sidebarSlice';
import { addNotePage } from '@/services/firebase';
import toast from 'react-hot-toast';

export const useNoteCreation = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { folders } = useAppSelector((state) => state.sidebar);

  const createNote = async (title: string, content: string, isUserAuthenticated: boolean) => {
    if (!isUserAuthenticated) {
      toast.error('Please sign in to create notes');
      return;
    }

    try {
      const privateFolder = getFolderByType(folders, 'private');
      if (!privateFolder) {
        toast.error('Private folder not found');
        return;
      }

      const pageId = await addNotePage(privateFolder.id, title || 'Untitled', content);
      toast.success('New note created');
      dispatch(loadSidebarData());
      router.push(`/note/${pageId}`);
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    }
  };

  return {
    createNote
  };
}; 