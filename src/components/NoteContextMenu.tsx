'use client';
import React from 'react';
import toast from 'react-hot-toast';

interface Props {
  noteId: string;
  onClose: () => void;
}

const NoteContextMenu: React.FC<Props> = ({ noteId, onClose }) => {
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/note/${noteId}` : '';
  const title = 'Check out this note!';

  const handleShare = (platform: string) => {
    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'reddit':
        url = `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`;
        break;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      onClose();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success('Link copied to clipboard!');
      onClose();
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  const Item = ({ icon, name, onClick }: { icon: React.ReactNode; name: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full text-left p-2 rounded hover:bg-gray-900 text-xs"
    >
      <span>{icon}</span>
      <span>{name}</span>
    </button>
  );

  return (
    <div className="w-60 p-4 rounded bg-gray-800 text-white text-xs flex flex-col space-y-1 note-context-menu-content">
      <Item icon="🐦" name="Share to Twitter" onClick={() => handleShare('twitter')} />
      <Item icon="📘" name="Share to Facebook" onClick={() => handleShare('facebook')} />
      <Item icon="💼" name="Share to LinkedIn" onClick={() => handleShare('linkedin')} />
      <Item icon="🤖" name="Share to Reddit" onClick={() => handleShare('reddit')} />
      <Item icon="🔗" name="Copy Link" onClick={handleCopyLink} />
    </div>
  );
};

export default NoteContextMenu; 