'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { FileBlock as FileBlockType } from '@/types/blocks';
import { uploadFile, deleteFile, isSupportedFileType, FileUploadProgress } from '@/services/firebase';
import toast from 'react-hot-toast';
import { useEditMode } from '@/contexts/EditModeContext';

interface DragItem {
  type: 'file';
  file: File;
}

interface Props {
  block: FileBlockType;
  onUpdate: (blockId: string, content: FileBlockType['content']) => void;
}

const FileBlock: React.FC<Props> = ({ 
  block,
  onUpdate
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isEditMode } = useEditMode();

  // React DND drop handler
  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: 'file',
    drop: (item) => {
      handleFileUpload(item.file);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      drop(containerRef.current);
    }
  }, [drop]);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    if (!isSupportedFileType(file)) {
      toast.error('File type not supported or file too large (max 10MB)');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const downloadUrl = await uploadFile(file, (progress: FileUploadProgress) => {
        setUploadProgress(progress.progress);
        if (progress.error) {
          toast.error(`Upload failed: ${progress.error}`);
          setIsUploading(false);
        }
      });

      // Update block content with file info
      onUpdate(block.id, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        downloadUrl,
        uploadProgress: 100,
      });

      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [block.id, onUpdate]);

  // Handle native drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  // Handle click to open file dialog
  const handleClick = useCallback(() => {
    if (!block.content.fileName && isEditMode) {
      fileInputRef.current?.click();
    }
  }, [block.content.fileName, isEditMode]);

  // Handle file removal
  const handleRemove = useCallback(async () => {
    if (block.content.downloadUrl) {
      try {
        await deleteFile(block.content.downloadUrl);
      } catch (error) {
        console.error('Error deleting file from storage:', error);
      }
    }

    onUpdate(block.id, {
      fileName: null,
      fileSize: undefined,
      fileType: undefined,
      downloadUrl: undefined,
      uploadProgress: undefined,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [block.content.downloadUrl, block.id, onUpdate]);

  // Handle file download
  const handleDownload = useCallback(() => {
    if (block.content.downloadUrl && block.content.fileName) {
      const link = document.createElement('a');
      link.href = block.content.downloadUrl;
      link.download = block.content.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [block.content.downloadUrl, block.content.fileName]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on file type
  const getFileIcon = (fileType?: string): string => {
    if (!fileType) return '📄';
    
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('video')) return '🎬';
    if (fileType.includes('audio')) return '🎵';
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return '🗜️';
    if (fileType.includes('text')) return '📝';
    
    return '📄';
  };

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className={`w-full min-h-[100px] flex items-center justify-center border-2 border-dashed rounded-lg transition-all ${
          isEditMode ? 'cursor-pointer' : 'cursor-default'
        } ${
          isOver || isDragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${block.content.fileName ? 'border-solid' : ''}`}
        onDragOver={isEditMode ? handleDragOver : undefined}
        onDragLeave={isEditMode ? handleDragLeave : undefined}
        onDrop={isEditMode ? handleDrop : undefined}
        onClick={isEditMode ? handleClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="Upload file"
          disabled={!isEditMode}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-3 p-4">
            <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
            <div className="text-center">
              <div className="text-gray-700 dark:text-gray-300 font-medium">Uploading file...</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{Math.round(uploadProgress)}%</div>
              <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : block.content.fileName ? (
          <div className="flex items-center gap-4 p-4 w-full">
            <div className="text-4xl">{getFileIcon(block.content.fileType)}</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {block.content.fileName}
              </div>
              {block.content.fileSize && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatFileSize(block.content.fileSize)}
                  {block.content.fileType && ` • ${block.content.fileType.split('/')[1]?.toUpperCase() || 'File'}`}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400 rounded text-sm font-medium transition-colors"
                title="Download file"
              >
                Download
              </button>
              {isEditMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="px-3 py-1 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 rounded text-sm font-medium transition-colors"
                  title="Remove file"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-8 text-center">
            <div className="text-4xl">📁</div>
            <div className="text-gray-700 dark:text-gray-300 font-medium">
              {isEditMode ? 'Drop a file here or click to upload' : 'No file uploaded'}
            </div>
            {isEditMode && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Supports documents, images, archives and more (max 10MB)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileBlock; 