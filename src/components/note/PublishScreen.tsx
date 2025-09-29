import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { grayColor2 } from '@/constants/color';
import AddToSeriesWidget from './AddToSeriesWidget';
import PublishScreenRightSide from './PublishScreenRightSide';
import PublishScreenLeftSide from './PublishScreenLeftSide';
import { MySeries } from '@/types/firebase';
import { useMarkdownStore } from '@/store/markdownEditorContentStore';

interface PublishScreenProps {
  // title: string;
  url: string;
  isOpen: boolean;
  description: string;
  pageId?: string | null;
  isPublished?: boolean | null;
  existingSeries?: MySeries | null;
  setDescription: (description: string) => void;
  onUploadThumbnail: (file: File) => void;
  onCancel: () => void;
  onPublish: (visibility: 'public' | 'private') => void;
}

const PublishScreen = ({
  // title,
  url,
  isOpen,
  onUploadThumbnail,
  description,
  isPublished,
  setDescription,
  pageId,
  existingSeries,
  onCancel,
  onPublish
}: PublishScreenProps) => {
  const { setThumbnailUrl, thumbnailUrl, setVisibility, visibility, content } = useMarkdownStore();
  const [isPublishHover, setIsPublishHover] = useState<boolean>(false);
  const [isAddToSeriesHover, setIsAddToSeriesHover] = useState<boolean>(false);
  const [isAddToSeriesWidgetOpen, setIsAddToSeriesWidgetOpen] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  // when unmount, set visibility to public
  useEffect(() => {
    return () => {
      setVisibility('public');
    }
  }, [setVisibility]);
  const dropRef = useRef<HTMLDivElement>(null);

  // Handle file drop
  const handleDrop = useCallback((item: { files: File[] }) => {
    const files = item.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check if it's an image file
      if (file.type.startsWith('image/')) {
        // Create preview URL for immediate feedback
        const previewUrl = URL.createObjectURL(file);
        console.log('previewUrl in handleDrop: ', previewUrl);
        setThumbnailUrl(previewUrl);
        
        // Upload the actual file
        onUploadThumbnail(file);
      }
    }
    setIsDragOver(false);
  }, [onUploadThumbnail, setThumbnailUrl]);

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
    console.log('event in handleFileInputChange', event);
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Create preview URL for immediate feedback
      const previewUrl = URL.createObjectURL(file);
      console.log('previewUrl in handleFileInputChange', previewUrl);
      setThumbnailUrl(previewUrl);
      
      // Upload the actual file
      onUploadThumbnail(file);
    }
  };

  const isActive = isOver && canDrop;

  return (
    <div className={`min-h-screen w-full text-white flex items-center justify-center p-4 ${isOpen ? 'fixed inset-0 z-50' : 'hidden'}`} style={{ backgroundColor: grayColor2 }}>
      <div className="w-full max-w-4xl mx-auto">
      <div className="text-white text-sm mb-4">
        {thumbnailUrl}
      </div>
        {/* Main Content Area */}
        <div className="flex gap-8 items-start">
          {/* Left Side - Post Preview */}
          <PublishScreenLeftSide
            isActive={isActive}
            isDragOver={isDragOver}
            dropRef={dropRef}
            description={description}
            content={content}
            setDescription={setDescription}
            handleFileInputChange={handleFileInputChange} 
          />

          {/* Right Side - Settings */}
          {isAddToSeriesWidgetOpen ? (
            <AddToSeriesWidget setIsAddToSeriesWidgetOpen={setIsAddToSeriesWidgetOpen}/>
          ) : (
            <PublishScreenRightSide
              pageId={pageId || undefined}
              isPublished={isPublished || undefined}
              existingSeries={existingSeries || null}
              url={url}
              visibility={visibility}
              isPublishHover={isPublishHover}
              isAddToSeriesHover={isAddToSeriesHover}
              setVisibility={setVisibility}
              setIsPublishHover={setIsPublishHover}
              setIsAddToSeriesHover={setIsAddToSeriesHover}
              setIsAddToSeriesWidgetOpen={setIsAddToSeriesWidgetOpen}
              onCancel={onCancel}
              onPublish={() => onPublish(visibility)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PublishScreen;
