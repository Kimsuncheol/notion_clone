import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { importButtonColor } from '@/constants/buttonBgColorConstants';

interface ImagePickerModalProps {
  pickerRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  imageUrl: string;
  setImageUrl: (imageUrl: string) => void;
}

export default function ImagePickerModal({ pickerRef, onClose, imageUrl, setImageUrl }: ImagePickerModalProps) {
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
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      alert('Image size must be less than 5MB');
      event.target.value = '';
      return;
    }
    if (tab === 'upload') {
      setImageUrl(file.name);
    } else {
      setImageUrl(URL.createObjectURL(file));
    }
  }

  return (
    <div ref={pickerRef} className='absolute sm:w-[500px] md:w-[600px] lg:w-[700px] z-10 bg-[#262626] rounded-lg shadow-xl top-[50px] left-5 w-full'>
      <ImagePickerTabbar onClose={onClose} setTab={setTab} />
      {/* Import from Gallery */}
      {tab === 'gallery' && <ImportFromGallery />}
      {/* Import from computer */}
      {tab === 'upload' && <ImportFromComputer onFileChange={onFileChange} />}
      {/* Import from url */}
      {tab === 'link' && <ImportFromUrl onFileChange={onFileChange} />}
    </div>
  )
}

function ImagePickerTabbar({ onClose, setTab }: { onClose: () => void, setTab: (tab: string) => void }) {
  const tabStyle = 'hover:bg-gray-600/70 px-2 py-1 rounded-md';
  return (
    <div className='p-2 flex text-sm justify-between border-b border-gray-600'>
      <div className='flex items-center gap-2'>
        <div className={tabStyle} onClick={() => setTab('gallery')}>Gallery</div>
        <div className={tabStyle} onClick={() => setTab('upload')}>Upload</div>
        <div className={tabStyle} onClick={() => setTab('link')}>Link</div>
      </div>
      <div className={tabStyle} onClick={() => onClose()}>Remove</div>
    </div>
  )
}

// Import from Gallery
function ImportFromGallery() {
  return (
    // TODO: Implement gallery
    <div className='flex flex-col gap-4'>
      {/* Color & Gradient */}
      <GalleryImageGrid title='Color & Gradient' images={[]} />
      {/* James Webb Telescope */}
      <GalleryImageGrid title='James Webb Telescope' images={[]} />
      {/* NASA Archive */}
      <GalleryImageGrid title='NASA Archive' images={[]} />
    </div>
  )
}

function GalleryImageGrid({ title, images }: { title: string, images: string[] }) {
  // grid type with screen size in mind
  return (
    <div className='flex flex-col gap-2 p-4'>
      <div className='text-xs font-bold text-gray-400'>{title}</div>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2'>
        {images.map((image) => (
          <div key={image} className='w-full h-full bg-gray-600 rounded-md'>
            <Image src={image} alt={title} width={100} height={100} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Import from url(remote image and clipboard image)
function ImportFromUrl({ onFileChange }: { onFileChange: (event: React.ChangeEvent<HTMLInputElement>, tab: string) => void }) {
  return (
    <div className='p-4'>
      <label htmlFor='url-import' className='flex flex-col gap-2 items-center'>
        <div className='w-full flex items-center gap-2 border border-gray-600 rounded-md p-2'>
          <input type='url' placeholder='Enter image URL' id='url-import' className='w-full' onChange={(event) => onFileChange(event, 'link')} />
        </div>
        <button className={`text-sm font-bold w-1/2 text-center text-white rounded-md p-2`} style={{ backgroundColor: importButtonColor }}>Import</button>
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

