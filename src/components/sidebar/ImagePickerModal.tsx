import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image';
import { importButtonColor } from '@/constants/buttonBgColorConstants';
import toast from 'react-hot-toast';
import { Button } from '@mui/material';
import { getJamesWebbImages, getNasaArchiveImages } from '../utils/nasaImages';
import { getAllColorGradients, createGradientSVG, type GradientColor } from '../utils/gradientColors';

interface ImagePickerModalProps {
  pickerRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  imageUrl: string;
  parentHeight: number;
  setImageUrl: (imageUrl: string) => void;
}

export default function ImagePickerModal({ pickerRef, onClose, setImageUrl, parentHeight }: ImagePickerModalProps) {
  const [tab, setTab] = useState('gallery');
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, pickerRef]);

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>, tab: string) => {
    if (tab === 'link') {
      const url = event.target.value;
      if (url.trim()) {
        setImageUrl(url);
        toast.success('Image imported successfully');
        onClose();
      }
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image size must be less than 5MB');
      event.target.value = '';
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    setImageUrl(blobUrl);
    console.log(`Created blob URL: ${blobUrl}`);

    onClose();
  }

  return (
    <>
      {/* Dark overlay backdrop */}
      <div className='fixed inset-0 bg-black/50 z-[9998]' onClick={() => onClose()} />
      <div ref={pickerRef} className='absolute sm:w-[500px] md:w-[600px] lg:w-[700px] z-[9999] bg-[#262626] rounded-lg shadow-xl top-[50px] left-5 w-full'>
        <ImagePickerTabbar onClose={onClose} tab={tab} setTab={setTab} setImageUrl={setImageUrl} />
        {/* Import from Gallery */}
        {tab === 'gallery' && <ImportFromGallery setImageUrl={setImageUrl} onClose={onClose} parentHeight={parentHeight} />}
        {/* Import from computer */}
        {tab === 'upload' && <ImportFromComputer onFileChange={onFileChange} />}
        {/* Import from url */}
        {tab === 'link' && <ImportFromUrl onFileChange={onFileChange} />}
      </div>
    </>
  )
}

function ImagePickerTabbar({ onClose, tab, setTab, setImageUrl }: { onClose: () => void, tab: string, setTab: (tab: string) => void, setImageUrl: (imageUrl: string) => void }) {
  const tabStyle = 'hover:bg-gray-600/70 px-2 py-1 rounded-md';
  return (
    <div className='p-2 flex text-sm justify-between border-b border-gray-600'>
      <div className='flex items-center gap-2'>
        <div className={`${tabStyle} ${tab === 'gallery' ? 'bg-gray-600/70' : ''}`} onClick={() => setTab('gallery')}>Gallery</div>
        <div className={`${tabStyle} ${tab === 'upload' ? 'bg-gray-600/70' : ''}`} onClick={() => setTab('upload')}>Upload</div>
        <div className={`${tabStyle} ${tab === 'link' ? 'bg-gray-600/70' : ''}`} onClick={() => setTab('link')}>Link</div>
      </div>
      <div className={tabStyle} onClick={() => {
        setImageUrl('');
        onClose();
      }}>Remove</div>
    </div>
  )
}

// Import from Gallery
function ImportFromGallery({ setImageUrl, onClose, parentHeight }: { setImageUrl: (imageUrl: string) => void, onClose: () => void, parentHeight: number }) {
  return (
    <div className='flex flex-col gap-4 overflow-y-auto no-scrollbar' style={{ height: parentHeight - 120 }}>
      {/* Color & Gradient */}
      <GradientColorGrid title='Color & Gradient' colorGradients={getAllColorGradients()} setImageUrl={setImageUrl} onClose={onClose} />
      {/* James Webb Telescope */}
      <GalleryImageGrid title='James Webb Telescope' imageUrls={getJamesWebbImages()} setImageUrl={setImageUrl} onClose={onClose} />
      {/* NASA Archive */}
      <GalleryImageGrid title='NASA Archive' imageUrls={getNasaArchiveImages()} setImageUrl={setImageUrl} onClose={onClose} />
    </div>
  )
}

function GalleryImageGrid({ title, imageUrls, setImageUrl, onClose: onModalClose }: { title: string, imageUrls: string[], setImageUrl: (imageUrl: string) => void, onClose: () => void }) {
  const [isAddMoreImagesOn, setIsAddMoreImagesOn] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());
  const onClose = () => setIsAddMoreImagesOn(false);

  const handleImageError = (imageUrl: string) => {
    setImageLoadErrors(prev => new Set(prev).add(imageUrl));
  };

  const handleImageSelect = (imageUrl: string) => {
    setImageUrl(imageUrl);
    toast.success('Image selected successfully');
    onModalClose(); // Close the main modal
  };

  // Filter out images that failed to load
  const validImageUrls = imageUrls.filter(url => !imageLoadErrors.has(url));

  return (
    <div className='flex flex-col gap-2 p-4'>
      <div className='text-xs font-bold text-gray-400'>{title}</div>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2'>
        {validImageUrls.map((imageUrl, index) => (
          <div 
            key={`${imageUrl}-${index}`} 
            className='w-full aspect-square bg-gray-600 rounded-md cursor-pointer hover:opacity-80 transition-opacity overflow-hidden' 
            onClick={() => handleImageSelect(imageUrl)}
          >
            <Image 
              src={imageUrl} 
              alt={`${title} image ${index + 1}`} 
              width={100} 
              height={100} 
              className='w-full h-full object-cover'
              onError={() => handleImageError(imageUrl)}
              unoptimized={true} // Allow external images
            />
          </div>
        ))}
      </div>
      {validImageUrls.length === 0 && (
        <div className='text-xs text-gray-500 text-center py-4'>
          No images available for {title}
        </div>
      )}
      {/* Add more images Button */}
      <Button
        variant='contained'
        color='primary'
        onClick={() => setIsAddMoreImagesOn(true)}
        style={{
          backgroundColor: importButtonColor,
          color: 'white',
          fontSize: '10px',
          fontWeight: 'bold',
          padding: '4px 8px',
          borderRadius: '10px',
        }}
      >Add more images</Button>
      {isAddMoreImagesOn && <AddMoreImagesModal onClose={onClose} />}
    </div>
  )
}

// Gradient and Color Grid (specialized for colors and gradients)
function GradientColorGrid({ title, colorGradients, setImageUrl, onClose: onModalClose }: { title: string, colorGradients: GradientColor[], setImageUrl: (imageUrl: string) => void, onClose: () => void }) {
  const [isAddMoreImagesOn, setIsAddMoreImagesOn] = useState(false);
  const onClose = () => setIsAddMoreImagesOn(false);

  const handleColorSelect = (colorGradient: GradientColor) => {
    // Convert the color/gradient to a data URL
    const dataUrl = createGradientSVG(colorGradient);
    setImageUrl(dataUrl);
    toast.success(`${colorGradient.name} selected successfully`);
    onModalClose(); // Close the main modal
  };

  return (
    <div className='flex flex-col gap-2 p-4'>
      <div className='text-xs font-bold text-gray-400'>{title}</div>
      <div className='grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2'>
        {colorGradients.map((colorGradient, index) => (
          <div 
            key={`${colorGradient.id}-${index}`} 
            className='w-full aspect-square rounded-md cursor-pointer hover:scale-105 transition-transform duration-200 overflow-hidden border border-gray-600'
            onClick={() => handleColorSelect(colorGradient)}
            title={colorGradient.name}
          >
            {colorGradient.type === 'solid' ? (
              // Solid color preview
              <div 
                className='w-full h-full'
                style={{ backgroundColor: colorGradient.value }}
              />
            ) : (
              // Gradient preview
              <div 
                className='w-full h-full'
                style={{ backgroundImage: colorGradient.value }}
              />
            )}
          </div>
        ))}
      </div>
      {colorGradients.length === 0 && (
        <div className='text-xs text-gray-500 text-center py-4'>
          No colors available for {title}
        </div>
      )}
      {/* Add more colors Button */}
      <Button
        variant='contained'
        color='primary'
        onClick={() => setIsAddMoreImagesOn(true)}
        style={{
          backgroundColor: importButtonColor,
          color: 'white',
          fontSize: '10px',
          fontWeight: 'bold',
          padding: '4px 8px',
          borderRadius: '10px',
        }}
      >Add custom color</Button>
      {isAddMoreImagesOn && <AddCustomColorModal onClose={onClose} />}
    </div>
  )
}

// Add custom color modal (simplified version)
function AddCustomColorModal({ onClose }: { onClose: () => void }) {
  const [customColor, setCustomColor] = useState('#3b82f6');

  const handleAddColor = () => {
    // In a real implementation, you might want to save this to a user's custom colors
    toast.success('Custom color feature coming soon!');
    onClose();
  };

  return (
    <>
      <div className='fixed inset-0 bg-black/50 z-[9998]' onClick={() => onClose()} />
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#262626] rounded-lg p-4 w-[300px] z-[9999] border border-gray-600'>
        <h3 className='text-sm font-bold text-white mb-4'>Add Custom Color</h3>
        <div className='flex flex-col gap-4'>
          <div className='flex items-center gap-3'>
            <div 
              className='w-12 h-12 rounded-md border border-gray-600'
              style={{ backgroundColor: customColor }}
            />
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className='w-16 h-8 rounded border border-gray-600 bg-transparent cursor-pointer'
              aria-label="Select custom color"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className='flex-1 bg-gray-700 text-white px-3 py-2 rounded text-sm border border-gray-600 outline-none focus:border-blue-500'
              placeholder="#3b82f6"
            />
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outlined'
              onClick={onClose}
              className='flex-1'
              style={{
                color: 'white',
                borderColor: '#6b7280',
                fontSize: '12px',
              }}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              onClick={handleAddColor}
              className='flex-1'
              style={{
                backgroundColor: importButtonColor,
                color: 'white',
                fontSize: '12px',
              }}
            >
              Add Color
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// Add more images to Firebase Storage
function AddMoreImagesModal({ onClose }: { onClose: () => void }) {


  return (
    <>
      <div className='fixed inset-0 bg-black/50 z-[9998]' onClick={() => onClose()} />
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-4 w-[500px] z-[9999]'>
        <label htmlFor='add-more-images' className='flex flex-col gap-2 items-center border border-gray-600 rounded-md p-2'>
          <input type='file' accept='image/*' className='hidden' id='add-more-images' />
          <Button variant='contained' color='primary' onClick={() => onClose()} style={{
            backgroundColor: importButtonColor,
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: '10px',
          }}>Add</Button>
          <p className='text-xs text-gray-400 text-center'>Add more images to your gallery</p>
        </label>
      </div>
    </>
  )
}

/// Import from url(remote image and clipboard image)
function ImportFromUrl({ onFileChange }: { onFileChange: (event: React.ChangeEvent<HTMLInputElement>, tab: string) => void }) {
  const [url, setUrl] = useState('');
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUrlImport = () => {
    if (!url.trim()) return;

    const syntheticEvent = {
      target: {
        files: null,
        value: url,
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    try {
      new URL(url);
      onFileChange(syntheticEvent, 'link');
    } catch {
      alert('Invalid URL');
    }
  }

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        // Check if clipboard contains a URL
        try {
          new URL(clipboardText);
          setUrl(clipboardText);
        } catch {
          // If not a valid URL, check if it looks like a URL pattern
          if (clipboardText.includes('http') || clipboardText.includes('www.')) {
            setUrl(clipboardText);
          } else {
            alert('Clipboard does not contain a valid URL');
          }
        }
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      alert('Unable to access clipboard. Please paste manually.');
    }
  };

  // Auto-detect clipboard changes when input is focused
  useEffect(() => {
    const handleFocus = () => setIsListening(true);
    const handleBlur = () => setIsListening(false);
    
    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('focus', handleFocus);
      inputElement.addEventListener('blur', handleBlur);
      
      return () => {
        inputElement.removeEventListener('focus', handleFocus);
        inputElement.removeEventListener('blur', handleBlur);
      };
    }
  }, []);

  // Listen for paste events
  useEffect(() => {
    const handlePasteEvent = (e: ClipboardEvent) => {
      if (isListening && inputRef.current === document.activeElement) {
        const pastedText = e.clipboardData?.getData('text');
        if (pastedText) {
          try {
            new URL(pastedText);
            setUrl(pastedText);
          } catch {
            // Let the default paste behavior happen for non-URLs
          }
        }
      }
    };

    document.addEventListener('paste', handlePasteEvent);
    return () => document.removeEventListener('paste', handlePasteEvent);
  }, [isListening]);
  
  return (
    <div className='p-4'>
      <label htmlFor='url-import' className='flex flex-col gap-2 items-center'>
        <div className='w-full flex items-center gap-2 border border-gray-600 rounded-md p-2'>
          <input 
            ref={inputRef}
            type='url' 
            placeholder='Enter image URL or paste from clipboard' 
            id='url-import' 
            className='w-full bg-transparent outline-none'
            value={url}
            onChange={(event) => setUrl(event.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleUrlImport()}
          />
          <button 
            onClick={handlePaste}
            className='text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors'
            title='Paste from clipboard'
          >
            Paste
          </button>
        </div>
        <button 
          className={`text-sm font-bold w-1/2 text-center text-white rounded-md p-2 transition-opacity hover:opacity-90`} 
          style={{ backgroundColor: importButtonColor }} 
          onClick={handleUrlImport}
        >
          Import
        </button>
        <p className='text-xs text-gray-400 text-center'>Work with any image from web. Auto-detects URLs from clipboard.</p>
      </label>
    </div>
  )
}

// Import from computer(local image)
function ImportFromComputer({ onFileChange }: { onFileChange: (event: React.ChangeEvent<HTMLInputElement>, tab: string) => void }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check if it's an image file
      if (file.type.startsWith('image/')) {
        // Check file size (5MB limit)
        if (file.size <= 5 * 1024 * 1024) {
          // Create synthetic event
          const syntheticEvent = {
            target: {
              files: files,
              value: ''
            }
          } as unknown as React.ChangeEvent<HTMLInputElement>;
          
          onFileChange(syntheticEvent, 'upload');
        } else {
          alert('File size exceeds 5MB limit');
        }
      } else {
        alert('Please drop an image file');
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className='p-4 flex flex-col gap-2'>
      <div 
        className={`
          flex items-center justify-center gap-2 border-2 border-dashed rounded-md p-6 cursor-pointer transition-all duration-200
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-600 hover:border-gray-500'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Upload image by clicking or dragging and dropping"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <div className='text-center'>
          <div className='mb-2'>
            <svg className='mx-auto h-8 w-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' />
            </svg>
          </div>
          <span className='text-sm font-bold text-gray-700 dark:text-gray-300'>
            {isDragOver ? 'Drop image here' : 'Click to upload or drag and drop'}
          </span>
          <p className='text-xs text-gray-500 mt-1'>PNG, JPG, GIF up to 5MB</p>
        </div>
      </div>
      
      <input 
        ref={fileInputRef}
        type='file' 
        accept='image/*' 
        id='computer-import' 
        className='hidden' 
        onChange={(event) => onFileChange(event, 'upload')}
        aria-label="Select image file to upload"
      />
      
      <p className='text-xs text-gray-400 text-center'>The maximum size per file is 5 MB.</p>
    </div>
  )
}

