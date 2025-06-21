'use client';
import React, { useState, useEffect } from 'react';
import { 
  getWorkspaceMembers, 
  changeMemberRole, 
  removeMemberFromWorkspace, 
  type WorkspaceMember 
} from '@/services/firebase';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';
import CloseIcon from '@mui/icons-material/Close';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ManageMembersModal: React.FC<Props> = ({ open, onClose }) => {
  const { currentWorkspace } = useModalStore();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load workspace members when modal opens
  useEffect(() => {
    if (open && currentWorkspace?.id) {
      loadMembers();
    }
  }, [open, currentWorkspace?.id]);

  // Click outside to close modal
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.manage-members-modal-content')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!open) return;

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [open, onClose]);

  const loadMembers = async () => {
    if (!currentWorkspace?.id) return;
    
    setIsLoading(true);
    try {
      const membersList = await getWorkspaceMembers(currentWorkspace.id);
      setMembers(membersList);
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Failed to load members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: 'editor' | 'viewer') => {
    if (!currentWorkspace?.id) return;

    try {
      await changeMemberRole(currentWorkspace.id, memberId, newRole);
      toast.success('Member role updated');
      await loadMembers();
    } catch (error) {
      console.error('Error changing member role:', error);
      toast.error('Failed to update member role');
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!currentWorkspace?.id) return;

    if (!window.confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) {
      return;
    }

    try {
      await removeMemberFromWorkspace(currentWorkspace.id, memberId);
      toast.success(`${memberName} has been removed from the workspace`);
      await loadMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <AdminPanelSettingsIcon className="text-red-500" fontSize="small" />;
      case 'editor':
        return <EditIcon className="text-blue-500" fontSize="small" />;
      case 'viewer':
        return <VisibilityIcon className="text-green-500" fontSize="small" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'editor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'viewer':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-hidden manage-members-modal-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            👥 Manage Workspace Members
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
            title="Close member management"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">👥</div>
                <p className="text-gray-500 dark:text-gray-400">No members found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Invite members to start collaborating</p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {member.name}
                          </h4>
                          {getRoleIcon(member.role)}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {member.email}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Joined {member.joinedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                      
                      {member.role !== 'owner' && (
                        <>
                          <select
                            value={member.role}
                            onChange={(e) => handleChangeRole(member.id, e.target.value as 'editor' | 'viewer')}
                            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            title={`Change role for ${member.name}`}
                          >
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          
                          <button
                            onClick={() => handleRemoveMember(member.id, member.name)}
                            className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Remove member"
                          >
                            <PersonRemoveIcon fontSize="small" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            💡 <strong>Tip:</strong> Only workspace owners can manage member roles and remove members from the workspace.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManageMembersModal; 