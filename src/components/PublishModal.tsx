'use client';
import React, { useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { uploadFile } from '@/services/firebase';
import { useNoteContent } from '@/contexts/NoteContentContext';
import toast from 'react-hot-toast';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  thumbnailUrl: string;
  onPublish: (thumbnailUrl?: string, isPublished?: boolean, publishTitle?: string, publishContent?: string) => void;
}

const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  title,
  thumbnailUrl,
  onPublish,
}) => {
  // Get existing publishContent from context
  const { publishContent: existingPublishContent } = useNoteContent();
  
  const [publishThumbnailUrl, setPublishThumbnailUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [publishTitle, setPublishTitle] = useState<string>('');
  const [publishContent, setPublishContent] = useState<string>('');
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const [thumbnailWidth, setThumbnailWidth] = useState<number>(0);

  // Initialize modal fields when it opens
  React.useEffect(() => {
    if (isOpen) {
      setPublishTitle(title || 'Untitled');
      setPublishThumbnailUrl(thumbnailUrl || '');
      // Don't touch below.
      if (thumbnailRef.current) {
        setThumbnailWidth(thumbnailRef.current.offsetWidth);
      }
      // Use existing publishContent if it has content, otherwise start with empty string
      setPublishContent(existingPublishContent && existingPublishContent.length > 0 ? existingPublishContent : '');
    }
  }, [isOpen, title, existingPublishContent, thumbnailUrl]);

  // Drag and drop functionality
  const [{ isOver }, drop] = useDrop(() => ({
    accept: [NativeTypes.FILE],
    drop: (item: { files: File[] }) => {
      if (item.files && item.files.length > 0) {
        handleFileUpload(item.files[0]);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const downloadUrl = await uploadFile(file, (progress) => {
        setUploadProgress(progress.progress);
      });
      setPublishThumbnailUrl(downloadUrl);
      toast.success('Thumbnail uploaded successfully');
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      toast.error('Failed to upload thumbnail');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Don't touch this.
  const handleSaveAsDraft = () => {
    onPublish(publishThumbnailUrl, false, publishTitle, publishContent);
    // onPublish(thumbnailUrl, false, publishTitle, publishContent);
    onClose();
  };

  // Don't touch this.
  const handlePublish = () => {
    onPublish(publishThumbnailUrl, true, publishTitle, publishContent);
    // onPublish(thumbnailUrl, true, publishTitle, publishContent);
    onClose();
  };

  if (!isOpen) return null;

  console.log('PublishModal is rendering with isOpen:', isOpen);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="p-4 bg-[#262626] text-sm max-w-md w-full mx-4 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Publish Note</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            title="Close modal"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* Drag and drop thumbnail upload zone */}
        <div
          ref={drop as unknown as React.LegacyRef<HTMLDivElement>}
          className={`border-2 border-dashed rounded-lg p-4 mb-4 transition-colors ${
            isOver
              ? 'border-blue-400 bg-blue-400/10'
              : 'border-gray-600 hover:border-gray-500'
          }`}
        >
          {publishThumbnailUrl ? (
            <div className="relative" ref={thumbnailRef}>
              {/* <img
                src={publishThumbnailUrl}
                alt="Thumbnail"
                className="w-full h-24 object-cover rounded"
              /> */}
              <Image
                src={publishThumbnailUrl}
                alt="Thumbnail"
                width={thumbnailWidth}
                height={96}
                objectFit="cover"
                quality={100}
                priority={true}
              />
              <button
                onClick={() => setPublishThumbnailUrl('')}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                title="Remove thumbnail"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <ImageIcon className="mx-auto text-gray-400 mb-2" fontSize="large" />
              <p className="text-gray-400 mb-2">
                {isUploading ? `Uploading... ${uploadProgress}%` : 'Drag & drop thumbnail here'}
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="thumbnail-upload"
              />
              <label
                htmlFor="thumbnail-upload"
                className="inline-block px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 cursor-pointer"
              >
                Browse Files
              </label>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-gray-400 mb-1">Title</label>
          <input
            type="text"
            value={publishTitle}
            onChange={(e) => setPublishTitle(e.target.value)}
            placeholder="Enter title for your published note"
            className="w-full text-white bg-gray-700/50 p-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Content Description */}
        <div className="mb-6">
          <label className="block text-gray-400 mb-1">Description</label>
          <textarea
            value={publishContent}
            onChange={(e) => setPublishContent(e.target.value)}
            placeholder="Write a description or summary about your note..."
            rows={4}
            className="w-full text-gray-300 bg-gray-700/50 p-2 rounded text-xs leading-relaxed border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSaveAsDraft}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Save as Draft
          </button>
          <button
            onClick={handlePublish}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishModal; 