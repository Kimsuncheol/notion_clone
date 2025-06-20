'use client';
import React from 'react';
import toast from 'react-hot-toast';

interface Props {
  noteId: string;
  onClose: () => void;
}

const SocialShareDropdown: React.FC<Props> = ({ noteId, onClose }) => {
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
      className="flex items-center gap-2 text-xs bg-gray-800 hover:bg-gray-900 w-40 p-2 text-white"
      title={`Share on ${name}`}
    >
      <span>{icon}</span>
      <span>{name}</span>
    </button>
  );

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
      <div className="flex flex-col" id="social-media-sharing">
        <Item icon="🐦" name="Twitter" onClick={() => handleShare('twitter')} />
        <Item icon="📘" name="Facebook" onClick={() => handleShare('facebook')} />
        <Item icon="💼" name="LinkedIn" onClick={() => handleShare('linkedin')} />
        <Item icon="🤖" name="Reddit" onClick={() => handleShare('reddit')} />
        <Item icon="🔗" name="Copy Link" onClick={handleCopyLink} />
      </div>
    </div>
  );
};

export default SocialShareDropdown; 