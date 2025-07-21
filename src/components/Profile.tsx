'use client';
import React, { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';
import WorkspaceModal from './WorkspaceModal';
import { useModalStore } from '@/store/modalStore';
import { getCurrentWorkspace, initializeDefaultWorkspace, updateWorkspaceName } from '@/services/firebase';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  onClose?: () => void;
  onWorkspaceChange?: () => void;
}

const Profile: React.FC<Props> = ({ onClose, onWorkspaceChange }) => {
  const { 
    showWorkspace, 
    setShowWorkspace,
    currentWorkspace: zustandWorkspace,
    setCurrentWorkspace: setZustandWorkspace,
    updateWorkspaceName: updateZustandWorkspaceName
  } = useModalStore();
  const [isEditingWorkspace, setIsEditingWorkspace] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [isUpdatingWorkspace, setIsUpdatingWorkspace] = useState(false);
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;

  // Use Zustand workspace as primary source, with fallback to local state
  const currentWorkspace = zustandWorkspace;

  // Load current workspace when component mounts or when not available in Zustand
  useEffect(() => {
    const loadWorkspace = async () => {
      if (user && !zustandWorkspace) {
        try {
          await initializeDefaultWorkspace();
          const workspace = await getCurrentWorkspace();
          if (workspace) {
            setZustandWorkspace(workspace);
            setWorkspaceName(workspace.name);
          }
        } catch (error) {
          console.error('Error loading workspace:', error);
        }
      } else if (zustandWorkspace) {
        setWorkspaceName(zustandWorkspace.name);
      }
    };

    loadWorkspace();
  }, [user, zustandWorkspace, setZustandWorkspace]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Successfully signed out');
      onClose?.();
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleNewWorkspace = () => {
    setShowWorkspace(true);
  };

  const handleWorkspaceChange = async () => {
    // Reload current workspace after changes
    try {
      const workspace = await getCurrentWorkspace();
      if (workspace) {
        setZustandWorkspace(workspace);
        setWorkspaceName(workspace.name);
      }
      // Notify parent component (Sidebar) to refresh data
      onWorkspaceChange?.();
    } catch (error) {
      console.error('Error reloading workspace:', error);
    }
  };

  const handleEditWorkspace = () => {
    setIsEditingWorkspace(true);
    setWorkspaceName(currentWorkspace?.name || '');
  };

  const handleSaveWorkspace = async () => {
    if (!currentWorkspace || !workspaceName.trim()) {
      toast.error('Please enter a valid workspace name');
      return;
    }

    if (workspaceName.trim() === currentWorkspace.name) {
      setIsEditingWorkspace(false);
      return;
    }

    setIsUpdatingWorkspace(true);
    try {
      await updateWorkspaceName(currentWorkspace.id, workspaceName.trim());
      // Update Zustand store
      updateZustandWorkspaceName(workspaceName.trim());
      setIsEditingWorkspace(false);
      toast.success('Workspace name updated');
      // Notify parent component to refresh data
      onWorkspaceChange?.();
    } catch (error) {
      console.error('Error updating workspace name:', error);
      toast.error('Failed to update workspace name');
    } finally {
      setIsUpdatingWorkspace(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingWorkspace(false);
    setWorkspaceName(currentWorkspace?.name || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isUpdatingWorkspace) {
      handleSaveWorkspace();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleCreateWorkAccount = () => {
    toast('Create work account functionality coming soon', { icon: 'ℹ️' });
  };

  const handleAddAnotherAccount = () => {
    toast('Add another account functionality coming soon', { icon: 'ℹ️' });
  };



  if (!user) {
    return null;
  }

  const userName = user.displayName || user.email?.split('@')[0] || 'User';

  return (
    <>
      <div className="w-52 aspect-square p-2 rounded-lg bg-gray-800">
        {/* Top Section */}
        <div className="mb-4">
          <div className="group relative mb-3">
            {isEditingWorkspace ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-[80%] px-2 py-1 text-sm font-semibold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isUpdatingWorkspace}
                  placeholder="Enter workspace name"
                  aria-label="Workspace name"
                  autoFocus
                />
                <button
                  onClick={handleSaveWorkspace}
                  disabled={isUpdatingWorkspace}
                  className="p-1 text-green-600 text-xs hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                  title="Save workspace name"
                >
                  <CheckIcon fontSize="inherit" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isUpdatingWorkspace}
                  className="p-1 text-red-600 text-xs hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title="Cancel editing"
                >
                  <CloseIcon fontSize="inherit" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {currentWorkspace?.name || `${userName}'s workspace`}
                </h3>
                <button
                  onClick={handleEditWorkspace}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all"
                  title="Edit workspace name"
                >
                  <EditIcon fontSize="small" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Middle Section */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            {user.email}
          </div>
          
          <div className="flex items-center gap-2 pl-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
            <span className="text-sm">선</span>
            <span className="text-sm font-medium">선철 김&apos;s Notion</span>
            <span className="ml-auto text-green-500">✓</span>
          </div>

          <button
            onClick={handleNewWorkspace}
            className="w-full flex items-center gap-2 pl-2 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <span>➕</span>
            <span>New workspace</span>
          </button>

          <button
            onClick={handleCreateWorkAccount}
            className="w-full flex items-center gap-2 pl-2 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <span>💼</span>
            <span>Create work account</span>
          </button>

          <button
            onClick={handleAddAnotherAccount}
            className="w-full flex items-center gap-2 pl-2 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <span>👤</span>
            <span>Add another account</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 pl-2 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <span>🚪</span>
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* Workspace Modal */}
      {showWorkspace && (
        <WorkspaceModal 
          open={showWorkspace}
          onClose={() => setShowWorkspace(false)}
          onWorkspaceChange={handleWorkspaceChange}
        />
      )}
    </>
  );
};

export default Profile;
