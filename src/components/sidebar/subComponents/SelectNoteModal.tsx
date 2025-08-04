import { fetchNotesList } from '@/services/firebase';
import { useAddaSubNoteSidebarStore } from '@/store/AddaSubNoteSidebarStore';
import { FirebaseNoteForSubNote } from '@/types/firebase';
import { InputAdornment, TextField } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { searchNoteByTitle } from '../utils/searchNoteByTitle';

interface SelectNoteModalProps {
  title: string;
  isOpen: boolean;
  selectedNoteId: string;
  onClose: () => void;
}

export default function SelectNoteModal({ title, isOpen, selectedNoteId, onClose }: SelectNoteModalProps) {
  const selectNoteModalRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState<FirebaseNoteForSubNote[]>([]);
  const { setSelectedNoteId, setSelectedNoteTitle } = useAddaSubNoteSidebarStore();
  // handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectNoteModalRef.current && !selectNoteModalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    const fetchNotes = async () => {
      const notes = await fetchNotesList();
      setNotes(notes);
    }
    fetchNotes();
  }, []);

  return (
    <>
      <div className='fixed inset-0 bg-black/50 z-[9998]' onClick={onClose} />
      <div className={`absolute left-[52px] top-[56px] z-[9999] bg-[#262626] shadow-lg rounded-md p-3 flex flex-col gap-2`} style={{ width: '300px' }} ref={selectNoteModalRef}>
        {/* searchbar with mui textfield */}
        <TextField
          variant='outlined'
          size='small'
          fullWidth
          placeholder='Search for a note'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start' sx={{ marginRight: '0px' }}>
                <SearchIcon sx={{ color: '#888' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            //Adjust the basic padding of the textfield
            '& .MuiInputBase-input': {
              padding: '4px',
            },
            '& .MuiOutlinedInput-root': {
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none !important',
              },
              fontSize: '14px',
              color: '#fff',
              backgroundColor: '#333',
              borderRadius: '4px',
              padding: '0px 4px',
              marginBottom: '8px'
            },
          }}
          onChange={async (e) => {
            const title = e.target.value;
            const notes = await searchNoteByTitle(title);
            setNotes(notes);
          }}
        />
        <h3 className='text-sm font-semibold'>Suggested</h3>
        <div className='flex flex-col gap-2 ml-2 text-sm'>
          {notes.map((note) => (
            <div key={note.id} className='flex items-center gap-2' onClick={() => {
              setSelectedNoteId(note.id);
              setSelectedNoteTitle(note.title);
              onClose();
            }}>
              <p className='flex items-center gap-2'>
                {note.title}
                { note.isPublic === false && <LockOutlinedIcon sx={{ fontSize: '16px', color: '#ededed' }} /> }
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
