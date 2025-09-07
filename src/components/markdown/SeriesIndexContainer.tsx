import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Collapse,
  List,
  ListItem,
} from '@mui/material';
import {
  ArrowDropUp as ArrowDropUpIcon,
  ArrowDropDown as ArrowDropDownIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
} from '@mui/icons-material';
import { grayColor1, mintColor3 } from '@/constants/color';
import CustomBookmarkIcon from './CustomBookmarkIcon';
import { MySeries } from '@/types/firebase';
import { fetchNoteBySeries } from '@/services/markdown/firebase';

interface SeriesIndexContainerProps {
  series: MySeries;
  authorEmail: string;
  authorId: string;
}

const SeriesIndexContainer: React.FC<SeriesIndexContainerProps> = ({ series, authorEmail, authorId }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const notesList = useMemo(async () => {
    const notes = await fetchNoteBySeries(series, authorEmail, authorId);
    return notes.map((note) => note.title);
  }, []);

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
          {series.title}
        </Typography>
      </Box>

      {/* Expandable List */}
      <Collapse sx={{ pl: 1 }} in={isExpanded} timeout={300}>
        <List sx={{ py: 0 }}>
          {notesList.map((note, index) => (
            <ListItem
              key={index}
              sx={{
                py: 1,
                px: 0,
                cursor: 'pointer',
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: '#e0e0e0',
                  '&::before': {
                    content: `"${index + 1}. "`,
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
                {note}
              </Typography>
            </ListItem>
          ))}
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
            1/4
          </Typography>
          <IconButton size="small" sx={{ color: '#808080', '&:hover': { color: mintColor3 } }}>
            <KeyboardArrowLeftIcon />
          </IconButton>
          <IconButton size="small" sx={{ color: '#808080', '&:hover': { color: mintColor3 } }}>
            <KeyboardArrowRightIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default SeriesIndexContainer;