import { useRouter } from 'next/navigation';
import { addNotePage } from '@/services/firebase';
import toast from 'react-hot-toast';

export const useNoteCreation = () => {
  const router = useRouter();

  const createNote = async (title: string, content: string, isUserAuthenticated: boolean) => {
    if (!isUserAuthenticated) {
      toast.error('Please sign in to create notes');
      return;
    }

    try {
      // Create note without folder dependency - simplified approach
      const pageId = await addNotePage('default', title || 'Untitled');

      toast.success('New note created');
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