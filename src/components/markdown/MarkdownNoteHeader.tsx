import { grayColor1, mintColor1 } from '@/constants/color';
import { useMarkdownStore } from '@/store/markdownEditorContentStore';
import { TagType } from '@/types/firebase';
import { TextField, Autocomplete, CircularProgress } from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';
import { getTagSuggestions, createOrGetTag, removeTagFromUserAndNotes } from '@/services/markdown/firebase';
import toast from 'react-hot-toast';

interface MarkdownNoteHeaderProps {
  title: string;
  titleRef: React.RefObject<HTMLDivElement | null>;
  handleTitleInput: (e: React.FormEvent<HTMLDivElement>) => void;
  viewMode: 'edit' | 'preview' | 'split';
  pageId?: string; // Add pageId to remove tags from specific note
}

export default function MarkdownNoteHeader({ title, titleRef, handleTitleInput, viewMode, pageId }: MarkdownNoteHeaderProps) {
  const { tags, setTags } = useMarkdownStore();

  return (
    <div className={`w-full flex flex-col p-4 pb-2 gap-6 ${viewMode === 'preview' ? 'hidden' : ''}`} id="title-input-container">
      <div className="relative">
        <div
          contentEditable
          suppressContentEditableWarning={true}
          onInput={handleTitleInput}
          onKeyDown={(e) => {
            // Prevent Enter key from creating new lines
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          className="w-full text-5xl font-bold bg-transparent flex items-end justify-between border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 whitespace-pre-wrap min-h-[1.2em] focus:outline-none leading-[1.5]"
          style={{
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
          ref={titleRef}
          data-placeholder="Untitled"
        />
        {/* Show placeholder only when empty */}
        {!title ? (
          <div className="absolute top-0 left-0 pointer-events-none text-5xl font-bold text-gray-400 dark:text-gray-500 leading-[1.5]">
            Untitled
          </div>
        ) : (
          <div className="absolute top-0 left-0 pointer-events-none text-5xl font-bold leading-[1.5]" style={{ color: 'white' }}>
            {title}
          </div>
        )}
      </div>
      <hr className="border-gray-200 dark:border-gray-700 w-[60px] border-2" />
      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Tag key={tag.id} tag={tag.name} onClick={async () => {
            try {
              // Remove from UI immediately for better UX
              const newTags = tags.filter((t) => t.id !== tag.id);
              setTags(newTags);
              
              if (pageId) {
                // Remove from specific note (updates postCount and removes from tags collection notes array)
                await removeTagFromUserAndNotes(tag.id, pageId);
                toast.success(`Tag "${tag.name}" removed from this note`);
              } else {
                console.warn('No pageId provided, cannot remove tag from specific note');
                toast.error('Cannot remove tag: note ID not found');
                // Revert UI changes
                setTags(tags);
              }
            } catch (error) {
              // Revert UI changes on error
              console.error('Error removing tag:', error);
              toast.error(`Failed to remove tag "${tag.name}"`);
              setTags(tags); // Revert to original state
            }
          }} />
        ))}
        <TagInput tags={tags} setTags={setTags} />
      </div>
    </div>
  )
}

function Tag({ tag, onClick }: { tag: string, onClick: () => void }) {
  return (
    <div
      className="text-gray-200 px-3 py-2 rounded-md text-sm hover:bg-gray-700 cursor-pointer"
      style={{ color: mintColor1 }}
      onClick={onClick}
    >
      {tag}
    </div>
  )
}

function TagInput({ tags, setTags }: { tags: TagType[], setTags: (tags: TagType[]) => void }) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<TagType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  // Debounced search for tag suggestions
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (inputValue.trim().length > 0) {
        setIsLoading(true);
        try {
          const tagSuggestions = await getTagSuggestions(inputValue, 10);
          // Filter out already selected tags
          const filteredSuggestions = tagSuggestions.filter(
            suggestion => !tags.some(tag => tag.id === suggestion.id)
          );
          setSuggestions(filteredSuggestions);
          setOpen(filteredSuggestions.length > 0);
        } catch (error) {
          console.error('Error fetching tag suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setOpen(false);
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue, tags]);

  const handleAddTag = async (tagName: string) => {
    if (!tagName.trim()) return;

    try {
      const newTag = await createOrGetTag(tagName.trim());
      
      // Check if tag is already in the list
      if (!tags.some(tag => tag.id === newTag.id)) {
        const newTags = [...tags, newTag];
        setTags(newTags);
        console.log('Added tag:', newTag);
      }
      
      setInputValue('');
      setOpen(false);
      setSuggestions([]);
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !open) {
      e.preventDefault();
      handleAddTag(inputValue);
    }
  };

  const handleSelection = (_: React.SyntheticEvent, value: TagType | string | null) => {
    if (value) {
      if (typeof value === 'string') {
        handleAddTag(value);
      } else {
        handleAddTag(value.name);
      }
    }
  };

  return (
    <div className="relative">
      <Autocomplete
        freeSolo
        open={open}
        onOpen={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        onClose={() => setOpen(false)}
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
        onChange={handleSelection}
        options={suggestions}
        getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
        loading={isLoading}
        loadingText="Searching tags..."
        noOptionsText={inputValue.length > 0 ? "Press Enter to create new tag" : "Start typing to search tags"}
        size="small"
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Add Tag"
            onKeyDown={handleKeyDown}
            sx={{
              minWidth: '120px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: 'none',
                },
                '&.Mui-focused fieldset': {
                  border: 'none',
                },
              },
              '& .MuiInputBase-input': {
                color: 'white',
                fontSize: '14px',
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#9CA3AF',
                opacity: 1,
              },
            }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option, { index }) => (
          <li
            {...props}
            key={typeof option === 'string' ? option : option.id}
            style={{
              backgroundColor: grayColor1,
              color: 'white',
              // if the option is the last one, don't show the border
              borderBottom: index === suggestions.length - 1 ? 'none' : '1px solid #4B5563',
            }}
            className="hover:bg-gray-600 px-3 py-2 cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span>{typeof option === 'string' ? option : option.name}</span>
            </div>
          </li>
        )}
        PaperComponent={({ children, ...props }) => (
          <div
            {...props}
            style={{
              backgroundColor: grayColor1,
              border: '1px solid #4B5563',
              // borderRadius: '6px',
              marginTop: '4px',
              maxHeight: '200px',
              overflow: 'auto',
            }}
          >
            {children}
          </div>
        )}
        popupIcon={null}
        clearIcon={null}
      />
    </div>
  );
}