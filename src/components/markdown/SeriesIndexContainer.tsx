import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Collapse,
  List,
  ListItem,
  Link,
} from '@mui/material';
import {
  ArrowDropUp as ArrowDropUpIcon,
  ArrowDropDown as ArrowDropDownIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
} from '@mui/icons-material';
import { grayColor1, mintColor3 } from '@/constants/color';
import CustomBookmarkIcon from './CustomBookmarkIcon';
import { FirebaseNoteContent, MySeries } from '@/types/firebase';
import { fetchNoteBySeries } from '@/services/markdown/firebase';

interface SeriesIndexContainerProps {
  seriesTitle: string;
  series: MySeries;
  authorEmail: string;
  authorId: string;
}

const SeriesIndexContainer: React.FC<SeriesIndexContainerProps> = ({ seriesTitle, series, authorEmail, authorId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notesList, setNotesList] = useState<FirebaseNoteContent[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Show 5 items per page

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        console.log('fetchNotes series title: ', series.title);
        const notes = await fetchNoteBySeries(series, authorEmail, authorId);
        console.log('fetchNotes notes: ', notes);

        setNotesList(notes);
        setCurrentPage(1); // Reset to first page when notes change
      } catch (error) {
        console.error('Error fetching notes:', error);
        setNotesList([]);
        setCurrentPage(1);
      }
    };
    fetchNotes();
  }, [series, authorEmail, authorId]);

  // Pagination calculations
  const totalPages = Math.ceil(notesList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageNotes = notesList.slice(startIndex, endIndex);

  // Navigation handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: grayColor1,
        // backgroundColor: 'rgba(150, 150, 150, 0.1)',
        borderRadius: 2,
        p: 3,
        position: 'relative',
        color: 'white',
      }}
    >
      <Box sx={{ position: 'absolute', top: 0, right: 16, zIndex: 2, display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'flex-start' }} id='bookmark-icon-container'>
        <CustomBookmarkIcon />
      </Box>
      {/* Header with Bookmark */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pl: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
          {seriesTitle}
        </Typography>
      </Box>

      {/* Expandable List */}
      <Collapse sx={{ pl: 1 }} in={isExpanded} timeout={300}>
        <List sx={{ py: 0 }}>
          {currentPageNotes.map((note, index) => {
            const globalIndex = startIndex + index + 1; // Calculate the global index
            return (
              <ListItem
                key={index}
                sx={{
                  py: 1,
                  px: 0,
                  cursor: 'pointer',
                }}
              >
                <Link href={`/${note.authorEmail}/note/${note.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#e0e0e0',
                      '&::before': {
                        content: `"${globalIndex}. "`,
                        color: '#b0b0b0',
                      },
                      '&:hover': {
                        textDecoration: 'underline',
                        textUnderlinePosition: 'from-font',
                        textDecorationColor: 'white',
                        textDecorationThickness: '1px',
                        textDecorationSkipInk: 'none',
                      },
                    }}
                  >
                    {note.title}
                  </Typography>
                </Link>
              </ListItem>
            );
          })}
        </List>
      </Collapse>

      {/* Toggle Button and Page Indicator */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': {
              '& .MuiTypography-root': {
                color: mintColor3,
                transition: 'color 0.2s ease',
              },
              '& .MuiIconButton-root': {
                color: mintColor3,
                transition: 'color 0.2s ease',
              },
            },
          }}
          onClick={handleToggle}
        >
          <IconButton
            size="small"
            sx={{
              color: 'white',
              p: 0,
              mr: 1,
            }}
          >
            {isExpanded ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
          </IconButton>
          <Typography
            variant="body1"
            sx={{
              color: 'white',
            }}
          >
            {isExpanded ? 'Hide' : 'View List'}
          </Typography>
        </Box>

        {/* Page Indicator */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="body2" sx={{ color: '#808080' }}>
            {totalPages > 0 ? `${currentPage}/${totalPages}` : '0/0'}
          </Typography>
          <IconButton 
            size="small" 
            onClick={handlePreviousPage}
            disabled={currentPage <= 1 || totalPages === 0}
            sx={{ 
              color: currentPage <= 1 || totalPages === 0 ? '#404040' : '#808080', 
              '&:hover': { 
                color: currentPage <= 1 || totalPages === 0 ? '#404040' : mintColor3 
              },
              cursor: currentPage <= 1 || totalPages === 0 ? 'default' : 'pointer'
            }}
          >
            <KeyboardArrowLeftIcon />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || totalPages === 0}
            sx={{ 
              color: currentPage >= totalPages || totalPages === 0 ? '#404040' : '#808080', 
              '&:hover': { 
                color: currentPage >= totalPages || totalPages === 0 ? '#404040' : mintColor3 
              },
              cursor: currentPage >= totalPages || totalPages === 0 ? 'default' : 'pointer'
            }}
          >
            <KeyboardArrowRightIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default SeriesIndexContainer;