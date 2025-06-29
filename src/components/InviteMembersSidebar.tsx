'use client';
import React, { useState, useEffect } from 'react';
import { 
  sendWorkspaceInvitation
} from '@/services/firebase';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

interface Props {
  open: boolean;
  onClose: () => void;
}

const InviteMembersSidebar: React.FC<Props> = ({ open, onClose }) => {
  const { currentWorkspace } = useModalStore();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [isInviting, setIsInviting] = useState(false);

  // Click outside to close sidebar
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.invite-members-sidebar-content') && !target.closest('#bottom-section1')) {
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

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (!currentWorkspace?.id) {
      toast.error('No workspace selected');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsInviting(true);
    try {
      await sendWorkspaceInvitation(currentWorkspace.id, inviteEmail.trim(), inviteRole);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setInviteRole('editor');
    } catch (error) {
      console.error('Error sending invitation:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to send invitation');
      }
    } finally {
      setIsInviting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isInviting) {
      handleInvite();
    }
  };

  if (!open) return null;

  return (
    <div className="w-[400px] h-[500px] p-4 rounded-lg absolute left-60 bottom-4 bg-[#262626] text-white shadow-lg z-50 text-sm invite-members-sidebar-content">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
        <h2 className="text-lg font-bold">
          👥 Invite Members
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1"
          title="Close invitation sidebar"
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100% - 80px)' }}>
        <div className="bg-blue-900/30 p-3 rounded-lg">
          <h3 className="font-semibold text-blue-100 mb-2 text-sm">
            Invite New Members
          </h3>
          <p className="text-xs text-blue-300 mb-3">
            Send invitations to collaborate on this workspace. Members can be assigned different roles:
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <EditIcon className="text-blue-400" fontSize="inherit" />
              <span><strong>Editor:</strong> Can create, edit, and delete notes</span>
            </div>
            <div className="flex items-center gap-2">
              <VisibilityIcon className="text-green-400" fontSize="inherit" />
              <span><strong>Viewer:</strong> Can only view and comment on notes</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter email address..."
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-2 text-xs border border-gray-600 rounded bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isInviting}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
              className="w-full px-2 py-2 text-xs border border-gray-600 rounded bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isInviting}
              title="Select member role"
            >
              <option value="editor">Editor - Can create, edit, and delete</option>
              <option value="viewer">Viewer - Can only view and comment</option>
            </select>
          </div>

          <button
            onClick={handleInvite}
            disabled={isInviting || !inviteEmail.trim()}
            className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs transition-colors flex items-center justify-center gap-2"
          >
            <PersonAddIcon fontSize="inherit" />
            {isInviting ? 'Sending...' : 'Send Invitation'}
          </button>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            💡 <strong>Tip:</strong> Invited members will receive an email notification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InviteMembersSidebar; 