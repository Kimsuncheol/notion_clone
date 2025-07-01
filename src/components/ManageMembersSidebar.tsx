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

const ManageMembersSidebar: React.FC<Props> = ({ open, onClose }) => {
  const { currentWorkspace } = useModalStore();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load workspace members when sidebar opens
  useEffect(() => {
    if (open && currentWorkspace?.id) {
      loadMembers();
    }
  }, [open, currentWorkspace?.id]);

  // Click outside to close sidebar
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.manage-members-sidebar-content') && !target.closest('#bottom-section1')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  // Handle Escape key to close sidebar
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
        return <AdminPanelSettingsIcon className="text-red-400" fontSize="inherit" />;
      case 'editor':
        return <EditIcon className="text-blue-400" fontSize="inherit" />;
      case 'viewer':
        return <VisibilityIcon className="text-green-400" fontSize="inherit" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-red-900/30 text-red-300';
      case 'editor':
        return 'bg-blue-900/30 text-blue-300';
      case 'viewer':
        return 'bg-green-900/30 text-green-300';
      default:
        return 'bg-gray-900/30 text-gray-300';
    }
  };

  if (!open) return null;

  return (
    <div className="w-[500px] h-[600px] p-4 rounded-lg fixed left-60 bottom-4 bg-[#262626] text-white shadow-lg z-50 text-sm manage-members-sidebar-content">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
        <h2 className="text-lg font-bold">
          👥 Manage Members
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1"
          title="Close member management"
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100% - 120px)' }}>
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-2xl mb-2">👥</div>
              <p className="text-gray-400 text-xs">No members found</p>
              <p className="text-gray-500 text-xs">Invite members to start collaborating</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <h4 className="font-medium text-white truncate text-xs">
                          {member.name}
                        </h4>
                        {getRoleIcon(member.role)}
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {member.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        Joined {member.joinedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                      {member.role}
                    </span>
                    
                    {member.role !== 'owner' && (
                      <>
                        <select
                          value={member.role}
                          onChange={(e) => handleChangeRole(member.id, e.target.value as 'editor' | 'viewer')}
                          className="px-1 py-1 text-xs border border-gray-600 rounded bg-gray-700 text-white"
                          title={`Change role for ${member.name}`}
                        >
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        
                        <button
                          onClick={() => handleRemoveMember(member.id, member.name)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                          title="Remove member"
                        >
                          <PersonRemoveIcon fontSize="inherit" />
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
      <div className="mt-4 pt-3 border-t border-gray-700">
        <p className="text-xs text-gray-400 text-center">
          💡 <strong>Tip:</strong> Only workspace owners can manage member roles and remove members.
        </p>
      </div>
    </div>
  );
};

export default ManageMembersSidebar; 