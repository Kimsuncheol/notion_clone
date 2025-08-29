import React, { useState, useCallback, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { grayColor2 } from '@/constants/color';
import AddToSeriesWidget from './AddToSeriesWidget';
import PublishScreenRightSide from './PublishScreenRightSide';
import PublishScreenLeftSide from './PublishScreenLeftSide';

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
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [isPublicHover, setIsPublicHover] = useState<boolean>(false);
  const [isPrivateHover, setIsPrivateHover] = useState<boolean>(false);
  const [isPublishHover, setIsPublishHover] = useState<boolean>(false);
  const [isAddToSeriesHover, setIsAddToSeriesHover] = useState<boolean>(false);
  const [isAddToSeriesWidgetOpen, setIsAddToSeriesWidgetOpen] = useState<boolean>(false);
  const [selectedSeries, setSelectedSeries] = useState<string>('');
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
          <PublishScreenLeftSide
            thumbnailUrl={thumbnailUrl}
            isActive={isActive}
            isDragOver={isDragOver}
            dropRef={dropRef}
            description={description}
            setDescription={setDescription}
            handleFileInputChange={handleFileInputChange} />

          {/* Right Side - Settings */}
          {isAddToSeriesWidgetOpen ? (
            <AddToSeriesWidget
              setIsAddToSeriesWidgetOpen={setIsAddToSeriesWidgetOpen}
              onSelectSeries={setSelectedSeries}
            />
          ) : (
            <PublishScreenRightSide
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
