import React, { useState, useCallback, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { grayColor2 } from '@/constants/color';
import AddToSeriesWidget from './AddToSeriesWidget';
import PublishScreenRightSide from './PublishScreenRightSide';
import PublishScreenLeftSide from './PublishScreenLeftSide';
import { SeriesType } from '@/types/firebase';
import { useMarkdownEditorContentStore } from '@/store/markdownEditorContentStore';

interface PublishScreenProps {
  // title: string;
  url: string;
  isOpen: boolean;
  description: string;
  pageId?: string | null;
  isPublished?: boolean | null;
  thumbnailUrl: string;
  existingSeries?: SeriesType | null;
  setThumbnailUrl: (thumbnailUrl: string) => void;
  setDescription: (description: string) => void;
  onUploadThumbnail: (file: File) => void;
  onCancel: () => void;
  onPublish: () => void;
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
  thumbnailUrl,
  setThumbnailUrl,
  existingSeries,
  // onSetPublic, 
  // onSetPrivate, 
  // onDelete, 
  onCancel,
  onPublish
}: PublishScreenProps) => {
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [isPublicHover, setIsPublicHover] = useState<boolean>(false);
  const [isPrivateHover, setIsPrivateHover] = useState<boolean>(false);
  const [isPublishHover, setIsPublishHover] = useState<boolean>(false);
  const [isAddToSeriesHover, setIsAddToSeriesHover] = useState<boolean>(false);
  const [isAddToSeriesWidgetOpen, setIsAddToSeriesWidgetOpen] = useState<boolean>(false);
  const { selectedSeries } = useMarkdownEditorContentStore();
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
        {selectedSeries && (
          <div className="text-white text-sm mb-4">
            Selected Series: {selectedSeries.id} {selectedSeries.title}
          </div>
        )}
        {/* Main Content Area */}
        <div className="flex gap-8 items-start">

          {/* Left Side - Post Preview */}
          <PublishScreenLeftSide
            thumbnailUrl={thumbnailUrl}
            setThumbnailUrl={setThumbnailUrl}
            isActive={isActive}
            isDragOver={isDragOver}
            dropRef={dropRef}
            description={description}
            setDescription={setDescription}
            handleFileInputChange={handleFileInputChange} />

          {/* Right Side - Settings */}
          {isAddToSeriesWidgetOpen ? (
            <AddToSeriesWidget setIsAddToSeriesWidgetOpen={setIsAddToSeriesWidgetOpen}/>
          ) : (
            <PublishScreenRightSide
              pageId={pageId || undefined}
              isPublished={isPublished || undefined}
              existingSeries={existingSeries || null}
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
