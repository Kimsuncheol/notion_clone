'use client';
import React, { useState, useEffect } from 'react';
import { fetchWorkspaces, createWorkspace, switchWorkspace, deleteWorkspace, getCurrentWorkspace, type Workspace } from '@/services/firebase';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';

interface Props {
  open: boolean;
  onClose: () => void;
  onWorkspaceChange?: () => void;
}

const WorkspaceModal: React.FC<Props> = ({ open, onClose, onWorkspaceChange }) => {
  const { setCurrentWorkspace: setZustandWorkspace } = useModalStore();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Load workspaces when modal opens
  useEffect(() => {
    if (open) {
      loadWorkspaces();
    }
  }, [open]);

  const loadWorkspaces = async () => {
    setIsLoading(true);
    try {
      const [workspaceList, current] = await Promise.all([
        fetchWorkspaces(),
        getCurrentWorkspace()
      ]);
      setWorkspaces(workspaceList);
      setCurrentWorkspace(current);
    } catch (error) {
      console.error('Error loading workspaces:', error);
      toast.error('Failed to load workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      toast.error('Please enter a workspace name');
      return;
    }

    setIsCreating(true);
    try {
      const workspaceId = await createWorkspace(newWorkspaceName.trim());
      // Update Zustand store with new workspace
      setZustandWorkspace({ id: workspaceId, name: newWorkspaceName.trim() });
      toast.success('Workspace created successfully');
      setNewWorkspaceName('');
      await loadWorkspaces();
      onWorkspaceChange?.();
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast.error('Failed to create workspace');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSwitchWorkspace = async (workspaceId: string) => {
    if (currentWorkspace?.id === workspaceId) return;

    try {
      await switchWorkspace(workspaceId);
      // Find the workspace name and update Zustand store
      const selectedWorkspace = workspaces.find(w => w.id === workspaceId);
      if (selectedWorkspace) {
        setZustandWorkspace({ id: selectedWorkspace.id, name: selectedWorkspace.name });
      }
      toast.success('Switched workspace');
      await loadWorkspaces();
      onWorkspaceChange?.();
      onClose();
    } catch (error) {
      console.error('Error switching workspace:', error);
      toast.error('Failed to switch workspace');
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string, workspaceName: string) => {
    if (workspaces.length <= 1) {
      toast.error('Cannot delete the last workspace');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${workspaceName}"? This will permanently delete all data in this workspace.`)) {
      return;
    }

    try {
      await deleteWorkspace(workspaceId);
      // If we deleted the current workspace, we need to update Zustand with the new current workspace
      if (currentWorkspace?.id === workspaceId) {
        const newCurrentWorkspace = await getCurrentWorkspace();
        if (newCurrentWorkspace) {
          setZustandWorkspace({ id: newCurrentWorkspace.id, name: newCurrentWorkspace.name });
        }
      }
      toast.success('Workspace deleted');
      await loadWorkspaces();
      onWorkspaceChange?.();
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast.error('Failed to delete workspace');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCreating) {
      handleCreateWorkspace();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Manage Workspaces
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
            title="Close workspace manager"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Create New Workspace */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Create New Workspace
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter workspace name..."
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isCreating}
            />
            <button
              onClick={handleCreateWorkspace}
              disabled={isCreating || !newWorkspaceName.trim()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <AddIcon fontSize="small" />
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>

        {/* Workspace List */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Your Workspaces ({workspaces.length})
          </h3>
          
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : workspaces.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🏢</div>
              <p className="text-gray-500 dark:text-gray-400">No workspaces found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Create your first workspace above</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                    currentWorkspace?.id === workspace.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => handleSwitchWorkspace(workspace.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {workspace.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {workspace.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Created {workspace.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {currentWorkspace?.id === workspace.id && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                        <CheckIcon fontSize="small" />
                        Active
                      </div>
                    )}
                    
                    {workspaces.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWorkspace(workspace.id, workspace.name);
                        }}
                        className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Delete workspace"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            💡 <strong>Tip:</strong> Each workspace has its own folders and notes. Switch between them to organize different projects.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceModal; 