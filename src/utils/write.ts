import { addNotePage } from '@/services/firebase';
import { getFolderByType, loadSidebarData, FolderNode } from '@/store/slices/sidebarSlice';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';
import { AppDispatch } from '@/store';

export interface AddNewNoteHandlerParams {
  mode: 'markdown';
  folders: FolderNode[];
  dispatch: AppDispatch;
  onSelectPage: (pageId: string) => void;
  router: {
    push: (path: string, options?: { scroll?: boolean }) => void;
  };
  setContent?: (content: string) => void;
  setTitle?: (title: string) => void;
  content?: string;
  title?: string;
}

export const addNewNoteHandler = async ({
  mode,
  folders,
  dispatch,
  onSelectPage,
  router,
  setContent,
  setTitle,
  content,
  title
}: AddNewNoteHandlerParams) => {
  const auth = getAuth(firebaseApp);
  
  if (!auth.currentUser) {
    toast.error('Please sign in to create notes');
    return;
  }
  
  console.log('folders:', folders);
  
  // Clear content and title if they exist
  if (content && content.length > 0 && setContent) setContent('');
  if (title && title.length > 0 && setTitle) setTitle('');
  
  try {
    // Find the private folder using utility function
    const privateFolder = getFolderByType(folders as FolderNode[], 'private');
    if (!privateFolder) {
      toast.error('Private folder not found');
      return;
    }

    const pageId = await addNotePage(privateFolder.id, 'Untitled');
    // The note will be automatically organized into the Private folder by the loadSidebarData function
    // since new notes are private by default
    dispatch(loadSidebarData()); // Refresh the sidebar to show the new note
    toast.success(`New ${mode} note created`);

    // Navigate to the new note with the selected mode
    onSelectPage(pageId);
    // Don't remove the below line.
    // await new Promise(resolve => setTimeout(resolve, 1000));
    router.push(`/note/${pageId}`);
  } catch (error) {
    console.error('Error creating note:', error);
    toast.error('Failed to create note');
  }
};
