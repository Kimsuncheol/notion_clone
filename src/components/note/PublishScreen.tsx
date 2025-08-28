import React, { useState, useCallback, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import ImageIcon from '@mui/icons-material/Image';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { grayColor2 } from '@/constants/color';
import { TextField } from '@mui/material';
import Image from 'next/image';
import AddToSeriesWidget from './AddToSeriesWidget';
import SettingsPanel from './SettingPanel';

interface PublishScreenProps {
  title: string;
  url: string;
  thumbnailUrl: string;
  isOpen: boolean;
  onUploadThumbnail: (file: File) => void;
  // onSetPublic: () => void;
  // onSetPrivate: () => void;
  // onDelete: () => void;
  onCancel: () => void;
  onPublish: () => void;
}

const PublishScreen = ({
  title,
  url,
  isOpen,
  onUploadThumbnail,
  // onSetPublic, 
  // onSetPrivate, 
  // onDelete, 
  onCancel,
  onPublish
}: PublishScreenProps) => {
  const [description, setDescription] = useState<string>('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [isPublicHover, setIsPublicHover] = useState<boolean>(false);
  const [isPrivateHover, setIsPrivateHover] = useState<boolean>(false);
  const [isPublishHover, setIsPublishHover] = useState<boolean>(false);
  const [isAddToSeriesHover, setIsAddToSeriesHover] = useState<boolean>(false);
  const [isAddToSeriesWidgetOpen, setIsAddToSeriesWidgetOpen] = useState<boolean>(false);
  const [selectedSeries, setSelectedSeries] = useState<string>('');
  // TODO: add isPublic and isPrivate
  // TODO: add series settings
  // const [isPublic, setIsPublic] = useState<boolean | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Handle file drop
  const handleDrop = useCallback((item: { files: File[] }) => {
    const files = item.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check if it's an image file
      if (file.type.startsWith('image/')) {
        onUploadThumbnail(file);
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setThumbnailUrl(previewUrl);
      }
    }
    setIsDragOver(false);
  }, [onUploadThumbnail]);

  // React DnD drop configuration
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [NativeTypes.FILE],
    drop: handleDrop,
    hover: (item, monitor) => {
      setIsDragOver(monitor.isOver());
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Connect the drop target to the ref
  drop(dropRef);

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onUploadThumbnail(file);
      const previewUrl = URL.createObjectURL(file);
      setThumbnailUrl(previewUrl);
    }
  };

  const isActive = isOver && canDrop;

  return (
    <div className={`min-h-screen w-full text-white flex items-center justify-center p-4 ${isOpen ? 'fixed inset-0 z-50' : 'hidden'}`} style={{ backgroundColor: grayColor2 }}>
      <div className="w-full max-w-4xl mx-auto">
        {/* Main Content Area */}
        <div className="flex gap-8 items-start">

          {/* Left Side - Post Preview */}
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
                onChange={handleFileInputChange}
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

          {/* Right Side - Settings */}
          {isAddToSeriesWidgetOpen ? (
            <AddToSeriesWidget
              setIsAddToSeriesWidgetOpen={setIsAddToSeriesWidgetOpen}
              onSelectSeries={setSelectedSeries}
            />
          ) : (
            <SettingsPanel
              selectedSeries={selectedSeries}
              url={url}
              isPublic={isPublic}
              isPrivate={isPrivate}
              isPublicHover={isPublicHover}
              isPrivateHover={isPrivateHover}
              isPublishHover={isPublishHover}
              isAddToSeriesHover={isAddToSeriesHover}
              setIsPublic={setIsPublic}
              setIsPrivate={setIsPrivate}
              setIsPublicHover={setIsPublicHover}
              setIsPrivateHover={setIsPrivateHover}
              setIsPublishHover={setIsPublishHover}
              setIsAddToSeriesHover={setIsAddToSeriesHover}
              setIsAddToSeriesWidgetOpen={setIsAddToSeriesWidgetOpen}
              setSelectSeries={setSelectedSeries}
              onCancel={onCancel}
              onPublish={onPublish}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PublishScreen;
