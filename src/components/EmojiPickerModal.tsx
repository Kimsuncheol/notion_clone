import { useMarkdownStore } from '@/store/markdownEditorContentStore';
import EmojiPicker, { EmojiClickData, Theme as EmojiTheme } from 'emoji-picker-react'
import { useEffect, useRef } from 'react';

interface EmojiPickerModalProps {
  // pickerRef: React.RefObject<HTMLDivElement | null>;
  handleEmojiSelect: (emojiData: EmojiClickData) => void;
  isDarkMode: boolean;
}

export default function EmojiPickerModal({ handleEmojiSelect, isDarkMode }: EmojiPickerModalProps) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const { showEmojiPicker, setShowEmojiPicker } = useMarkdownStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker, setShowEmojiPicker]);
  return (
    <div ref={pickerRef} className="absolute z-10 bg-[#262626] rounded-lg shadow-xl top-[50px] right-5">
      <EmojiPicker
        onEmojiClick={handleEmojiSelect}
        skinTonesDisabled
        searchDisabled
        previewConfig={{ showPreview: false }}
        height={350}
        width={300}
        theme={isDarkMode ? EmojiTheme.DARK : EmojiTheme.LIGHT}
        lazyLoadEmojis
      />
    </div>
  )
}
