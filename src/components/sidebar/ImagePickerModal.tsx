import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { importButtonColor } from '@/constants/buttonBgColorConstants';
import toast from 'react-hot-toast';
import { gradientImages } from './common/constants/constants';
import { Button, Input } from '@mui/material';

interface ImagePickerModalProps {
  pickerRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  imageUrl: string;
  setImageUrl: (imageUrl: string) => void;
}

export default function ImagePickerModal({ pickerRef, onClose, setImageUrl }: ImagePickerModalProps) {
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
        {tab === 'gallery' && <ImportFromGallery setImageUrl={setImageUrl} />}
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
function ImportFromGallery({ setImageUrl }: { setImageUrl: (imageUrl: string) => void }) {
  return (
    // TODO: Implement gallery
    <div className='flex flex-col gap-4'>
      {/* Color & Gradient */}
      <GalleryImageGrid title='Color & Gradient' imageUrls={gradientImages} setImageUrl={setImageUrl} />
      {/* James Webb Telescope */}
      <GalleryImageGrid title='James Webb Telescope' imageUrls={[]} setImageUrl={setImageUrl} />
      {/* NASA Archive */}
      <GalleryImageGrid title='NASA Archive' imageUrls={[]} setImageUrl={setImageUrl} />
    </div>
  )
}

function GalleryImageGrid({ title, imageUrls, setImageUrl }: { title: string, imageUrls: string[], setImageUrl: (imageUrl: string) => void }) {
  const [isAddMoreImagesOn, setIsAddMoreImagesOn] = useState(false);
  const onClose = () => setIsAddMoreImagesOn(false);
  
  // grid type with screen size in mind
  return (
    <div className='flex flex-col gap-2 p-4'>
      <div className='text-xs font-bold text-gray-400'>{title}</div>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2'>
        {imageUrls.map((imageUrl) => (
          <div key={imageUrl} className='w-full h-full bg-gray-600 rounded-md' onClick={() => setImageUrl(imageUrl)}>
            <Image src={imageUrl} alt={imageUrl} width={100} height={100} />
          </div>
        ))}
      </div>
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
      {/* <AddMoreImagesButton onClick={() => setIsAddMoreImagesOn(true)} onClose={onClose} /> */}
      {isAddMoreImagesOn && <AddMoreImagesModal onClose={onClose} />}
    </div>
  )
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

// Import from url(remote image and clipboard image)
function ImportFromUrl({ onFileChange }: { onFileChange: (event: React.ChangeEvent<HTMLInputElement>, tab: string) => void }) {
  const [url, setUrl] = useState('');

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
  
  return (
    <div className='p-4'>
      <label htmlFor='url-import' className='flex flex-col gap-2 items-center'>
        <div className='w-full flex items-center gap-2 border border-gray-600 rounded-md p-2'>
          <input 
            type='url' 
            placeholder='Enter image URL' 
            id='url-import' 
            className='w-full'
            value={url}
            onChange={(event) => setUrl(event.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleUrlImport()}
          />
        </div>
        <button className={`text-sm font-bold w-1/2 text-center text-white rounded-md p-2`} style={{ backgroundColor: importButtonColor }} onClick={handleUrlImport}>Import</button>
        <p className='text-xs text-gray-400 text-center'>Work with any image from web.</p>
      </label>
    </div>
  )
}

// Import from computer(local image)
function ImportFromComputer({ onFileChange }: { onFileChange: (event: React.ChangeEvent<HTMLInputElement>, tab: string) => void }) {
  return (
    <div className='p-4 flex flex-col gap-2'>
      <label htmlFor='computer-import' className='flex items-center justify-center gap-2 border border-gray-600 rounded-md p-2'>
        <span className='text-sm font-bold'>Upload Image</span>
      </label>
      <input type='file' accept='image/*' id='computer-import' className='hidden' onChange={(event) => onFileChange(event, 'upload')} />
      <p className='text-xs text-gray-400 text-center'>The maximum size per file is 5 MB.</p>
    </div>
  )
}

