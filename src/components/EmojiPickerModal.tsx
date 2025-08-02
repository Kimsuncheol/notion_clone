import EmojiPicker, { EmojiClickData, Theme as EmojiTheme } from 'emoji-picker-react'
import React from 'react'

interface EmojiPickerModalProps {
  pickerRef: React.RefObject<HTMLDivElement | null>;
  handleEmojiSelect: (emojiData: EmojiClickData) => void;
  isDarkMode: boolean;
}

export default function EmojiPickerModal({ pickerRef, handleEmojiSelect, isDarkMode }: EmojiPickerModalProps) {
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
