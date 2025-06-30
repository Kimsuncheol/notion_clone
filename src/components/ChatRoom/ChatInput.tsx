'use client';
import React from 'react';
import { TextField, Button, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EmojiPicker from 'emoji-picker-react';

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: () => void;
  handleKeyPress: (event: React.KeyboardEvent) => void;
  handleFocus: () => void;
  handleBlur: () => void;
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  uploadFileName: string;
  type: 'contact' | 'bug' | 'feedback';
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  onEmojiClick: (emojiData: { emoji: string }) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  message,
  setMessage,
  handleSendMessage,
  handleKeyPress,
  handleFocus,
  handleBlur,
  isLoading,
  isUploading,
  uploadProgress,
  uploadFileName,
  type,
  showEmojiPicker,
  setShowEmojiPicker,
  onEmojiClick,
  fileInputRef,
  handleFileSelect,
}) => {
  return (
    <div className="border-t border-gray-600 pt-3 relative">
      {isUploading && (
        <div className="mb-2">
          <div className="text-xs text-gray-400">
            Uploading {uploadFileName}... {Math.round(uploadProgress)}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
            <div
              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={`Type your ${type} message...`}
          disabled={isLoading || isUploading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: '#374151',
              color: 'white',
              fontSize: '14px',
              '& fieldset': {
                borderColor: '#6B7280',
              },
              '&:hover fieldset': {
                borderColor: '#9CA3AF',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#3B82F6',
              },
            },
            '& .MuiInputBase-input': {
              color: 'white',
              fontSize: '14px',
              '&::placeholder': {
                color: '#9CA3AF',
                opacity: 1,
              },
            },
          }}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || isLoading || isUploading}
          variant="contained"
          sx={{
            minWidth: '44px',
            height: '44px',
            borderRadius: '8px',
            backgroundColor: '#3B82F6',
            '&:hover': {
              backgroundColor: '#2563EB',
            },
            '&:disabled': {
              backgroundColor: '#6B7280',
            },
          }}
        >
          <SendIcon fontSize="small" />
        </Button>
      </div>
      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-1">
          <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)} size="small" disabled={isLoading || isUploading}>
            <InsertEmoticonIcon sx={{ color: '#9CA3AF' }} />
          </IconButton>
          <IconButton onClick={() => fileInputRef.current?.click()} size="small" disabled={isLoading || isUploading}>
            <AttachFileIcon sx={{ color: '#9CA3AF' }} />
          </IconButton>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
            aria-label="File upload"
          />
        </div>
        <div className="text-xs text-gray-400">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-[80px] z-10">
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}
    </div>
  );
};

export default ChatInput; 