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

const InviteMembersModal: React.FC<Props> = ({ open, onClose }) => {
  const { currentWorkspace } = useModalStore();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [isInviting, setIsInviting] = useState(false);

  // Click outside to close modal
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.invite-members-modal-content')) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-hidden invite-members-modal-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            👥 Invite Members
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
            title="Close invitation modal"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Invite New Members
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
              Send invitations to collaborate on this workspace. Members can be assigned different roles:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <EditIcon className="text-blue-500" fontSize="small" />
                <span><strong>Editor:</strong> Can create, edit, and delete notes</span>
              </div>
              <div className="flex items-center gap-2">
                <VisibilityIcon className="text-green-500" fontSize="small" />
                <span><strong>Viewer:</strong> Can only view and comment on notes</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter email address..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isInviting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <PersonAddIcon fontSize="small" />
              {isInviting ? 'Sending Invitation...' : 'Send Invitation'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            💡 <strong>Tip:</strong> Invited members will receive an email notification and can accept the invitation from their notification center.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InviteMembersModal; 