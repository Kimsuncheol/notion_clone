import { ReactNode, useEffect, useState } from 'react';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

import { useMarkdownStore } from '@/store/markdownEditorContentStore';
import toast from 'react-hot-toast';

interface ShareBubblesProps {
  isOpen: boolean;
  onCloseComplete?: () => void;
  onRequestClose?: () => void;
}

interface BubbleConfig {
  id: string;
  label: string;
  x: number;
  y: number;
  icon: ReactNode;
  onClick: () => void;
}

const EXIT_ANIMATION_MS = 460;

export default function ShareBubbles({ isOpen, onCloseComplete, onRequestClose }: ShareBubblesProps) {
  const iconFontSize = 20;
  const ratio: number = 40;
  const squareRootOfThree: number = 2.2360679774998;
  // const squareRootOfThree: number = 1.7320508075689;
  const { setShowQRCodeModalForMarkdownEditor } = useMarkdownStore();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let frameId: number | null = null;
    let exitTimer: ReturnType<typeof setTimeout> | null = null;

    if (isOpen) {
      frameId = requestAnimationFrame(() => setIsExpanded(true));
    } else {
      setIsExpanded(false);
      exitTimer = setTimeout(() => {
        onCloseComplete?.();
      }, EXIT_ANIMATION_MS);
    }

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      if (exitTimer !== null) {
        clearTimeout(exitTimer);
      }
    };
  }, [isOpen, onCloseComplete]);

  const handleLinkShare = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  const handleShareOnFacebook = () => {
    if (typeof window === 'undefined') return;
    const shareUrl = encodeURIComponent(window.location.href);
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`; // https://developers.facebook.com/docs/sharing/reference/share-dialog
    window.open(facebookShareUrl, '_blank', 'noopener,noreferrer,width=680,height=640');
  };

  const handleShareOnTwitter = () => {
    if (typeof window === 'undefined') return;
    const shareUrl = encodeURIComponent(window.location.href);
    const shareText = encodeURIComponent(document.title || 'Check this out');
    const twitterIntentUrl = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`; // https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/overview
    window.open(twitterIntentUrl, '_blank', 'noopener,noreferrer,width=680,height=640');
  };

  const bubbleConfigs: BubbleConfig[] = [
    {
      id: 'facebook',
      label: 'Share on Facebook',
      x: ratio * squareRootOfThree,
      y: -ratio,
      icon: <FacebookIcon sx={{ fontSize: iconFontSize }} />,
      onClick: handleShareOnFacebook
    },
    {
      id: 'twitter',
      label: 'Share on X',
      x: ratio,
      y: -ratio * squareRootOfThree,
      icon: <TwitterIcon sx={{ fontSize: iconFontSize }} />,
      onClick: handleShareOnTwitter
    },
    {
      id: 'attach',
      label: 'Copy link',
      x: ratio * squareRootOfThree,
      y: ratio,
      icon: <AttachFileIcon sx={{ fontSize: iconFontSize, rotate: 45 }} />,
      onClick: handleLinkShare
    },
    {
      id: 'qr-code',
      label: 'Show QR code',
      x: ratio,
      y: ratio * squareRootOfThree,
      icon: <QrCodeScannerIcon sx={{ fontSize: iconFontSize }} />,
      onClick: () => setShowQRCodeModalForMarkdownEditor(true)
    }
  ];

  return (
    <div id="share-bubbles" className="pointer-events-none">
      {bubbleConfigs.map(({ id, label, x, y, icon, onClick }, index) => (
        <Bubble
          key={id}
          id={id}
          label={label}
          x={x}
          y={y}
          icon={icon}
          onClick={() => {
            onClick();
            onRequestClose?.();
          }}
          isExpanded={isExpanded}
          delay={index * 60}
        />
      ))}
    </div>
  );
}

interface BubbleProps {
  id: string;
  label: string;
  x: number;
  y: number;
  icon: ReactNode;
  onClick: () => void;
  isExpanded: boolean;
  delay: number;
}

function Bubble({ id, label, x, y, icon, onClick, isExpanded, delay }: BubbleProps) {
  return (
    <button
      type="button"
      id={`share-bubble-${id}`}
      aria-label={label}
      title={label}
      onClick={onClick}
      className="pointer-events-auto absolute top-[76px] left-0 flex h-11 w-11 items-center justify-center rounded-full border-2 border-gray-500/40 bg-gray-800 text-white shadow transition-colors duration-200 hover:border-gray-400 hover:bg-gray-700"
      style={{
        transform: isExpanded ? `translate(${x}px, ${y}px)` : 'translate(0, 0)',
        opacity: isExpanded ? 1 : 0,
        pointerEvents: isExpanded ? 'auto' : 'none',
        transition: `transform 220ms cubic-bezier(0.22, 0.61, 0.36, 1) ${delay}ms, opacity 180ms ease ${delay}ms`
      }}
    >
      {icon}
    </button>
  );
}
