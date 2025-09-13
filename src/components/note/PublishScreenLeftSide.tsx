import { TextField } from '@mui/material'
import Image from 'next/image';
import React from 'react'
import ImageIcon from '@mui/icons-material/Image';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useMarkdownStore } from '@/store/markdownEditorContentStore';

interface PublishScreenLeftSideProps {
  isActive: boolean;
  isDragOver: boolean;
  dropRef: React.RefObject<HTMLDivElement | null>;
  description: string;
  setDescription: (description: string) => void;
  handleFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PublishScreenLeftSide({ 
  isActive, 
  isDragOver, 
  dropRef, 
  description, 
  setDescription,
  handleFileInputChange
 }: PublishScreenLeftSideProps) {
  const { setThumbnailUrl, thumbnailUrl } = useMarkdownStore();
  return (
    <div className="flex-1 max-w-md">
      <h2 className="text-lg font-bold mb-4">Preview Post</h2>

      {/* Thumbnail Upload Area with React DnD */}
      <div
        ref={dropRef}
        className={`
                bg-gray-800 h-[288px] flex items-center justify-center flex-col border-2 border-dashed rounded-lg ${thumbnailUrl ? 'p-0' : 'p-8'} mb-4 text-center relative transition-all duration-200 cursor-pointer
                ${isActive ? 'border-green-400 bg-green-900/20' : 'border-gray-600'}
                ${isDragOver ? 'border-blue-400 bg-blue-900/20' : ''}
                hover:border-gray-500 hover:bg-gray-700/50
              `}
        onClick={() => document.getElementById('thumbnail-upload')?.click()}
      >
        {thumbnailUrl ? (
          <div className="relative w-full h-full">
            <Image
              width={dropRef.current?.clientWidth || 288}
              height={288}
              src={thumbnailUrl}
              alt="Thumbnail preview"
              style={{ width: dropRef.current?.clientWidth || 288, height: 288, objectFit: 'cover', borderRadius: '8px' }}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg">
              <CloudUploadIcon sx={{ fontSize: 32, color: 'white' }} />
              <span className="text-white ml-2">Change thumbnail</span>
            </div>
          </div>
        ) : (
          <>
            <ImageIcon sx={{ fontSize: 64, color: 'gray', opacity: 0.5, marginBottom: '16px', marginX: 'auto' }} />
            <div className="text-green-400 text-sm hover:text-green-300 transition-colors">
              {isActive ? 'Drop image here' : 'Drag & drop image or click to upload'}
            </div>
            <div className="text-gray-500 text-xs mt-2">
              Supports: JPG, PNG, GIF, WebP
            </div>
          </>
        )}

        {/* Hidden file input */}
        <input
          id="thumbnail-upload"
          type="file"
          accept="image/*"
          onChange={(e) => {
            console.log('e', e);
            setThumbnailUrl(null);
            handleFileInputChange(e);
          }}
          className="hidden"
          aria-label="Upload thumbnail image"
        />
      </div>

      {/* Description */}
      <div className="mb-1">
        <TextField
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          fullWidth
          rows={4}
          sx={{
            '& .MuiInputBase-root': {
              backgroundColor: 'transparent',
              border: '1px solid #333',
              borderRadius: '4px',
              color: 'white',
              fontSize: '14px',
              padding: '8px',
            },
            '& .MuiInputBase-input': {
              color: 'white',
            },
          }}
          placeholder="Give a brief introduction to your post..."
        />
      </div>

      {/* Character Count */}
      <div className="text-right">
        <span className="text-gray-500 text-xs">{description.length}/150</span>
      </div>
    </div>
  )
}
