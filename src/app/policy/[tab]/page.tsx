"use client"
import React, { useMemo, memo } from 'react';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from './constants';
import SmallTabbar from '../../../components/tags/SmallTabbar';
import { useParams } from 'next/navigation';

// Types for better performance
interface SectionType {
  id: string;
  title: string;
  content?: string;
  items?: readonly string[];
  subsections?: readonly {
    title?: string;
    content?: string;
    reason?: string;
    period?: string;
    items?: readonly string[];
  }[];
  additionalInfo?: {
    readonly autoCollection: string;
    readonly collectionMethod: string;
  };
  info?: {
    readonly name: string;
    readonly email: string;
    readonly additionalInfo: string;
    readonly reportCenter: string;
  };
}

// Memoized section component for better performance
const PolicySection = memo(({ section, activeTab }: { section: SectionType, activeTab: string }) => (
  <Box key={section.id} className="mb-8">
    <Typography 
      variant="h5" 
      component="h2" 
      className="font-semibold mb-4 text-white"
      gutterBottom
    >
      {section.title}
    </Typography>
    
    {'content' in section && section.content && (
      <Typography 
        variant="body1" 
        className="text-gray-300 leading-relaxed mb-4"
        paragraph
      >
        {section.content}
      </Typography>
    )}
    
    {'items' in section && section.items && (
      <List className={activeTab === 'terms' ? "space-y-3" : ""}>
        {section.items.map((item: string, index: number) => (
          <ListItem 
            key={index} 
            className="px-0"
            sx={{ 
              display: 'list-item', 
              listStyleType: activeTab === 'terms' ? 'decimal' : 'disc', 
              ml: 4 
            }}
          >
            <ListItemText
              primary={
                <Typography 
                  variant="body1" 
                  className={`text-gray-300 ${activeTab === 'terms' ? 'leading-relaxed' : ''}`}
                >
                  {item}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    )}

    {/* Privacy-specific subsections */}
    {'subsections' in section && section.subsections && section.subsections.map((subsection, index: number) => (
      <Box key={index} className="mb-4">
        {subsection.title && (
          <Typography 
            variant="h6" 
            component="h3" 
            className="font-medium mb-3 text-white"
          >
            {String(subsection.title)}
          </Typography>
        )}
        
        {'content' in subsection && subsection.content && (
          <Typography 
            variant="body1" 
            className="text-gray-300 leading-relaxed"
            paragraph
          >
            {subsection.content as string}
          </Typography>
        )}
        
        {'reason' in subsection && subsection.reason && (
          <Typography variant="body1" className="text-gray-300">
            {subsection.reason as string}
          </Typography>
        )}
        
        {'period' in subsection && subsection.period && (
          <Typography variant="body1" className="text-gray-300">
            {subsection.period as string}
          </Typography>
        )}
        
        {'items' in subsection && subsection.items && (
          <List>
            {subsection.items.map((item: string, itemIndex: number) => (
              <ListItem 
                key={itemIndex}
                className="px-0"
                sx={{ display: 'list-item', listStyleType: 'disc', ml: 4 }}
              >
                <ListItemText
                  primary={
                    <Typography 
                      variant="body1" 
                      className="text-gray-300"
                    >
                      {item}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    ))}

    {'additionalInfo' in section && section.additionalInfo && (
      <Box className="space-y-2">
        <Typography variant="body1" className="text-gray-300">
          <Box component="span" className="font-medium">자동 수집항목:</Box> {section.additionalInfo.autoCollection}
        </Typography>
        <Typography variant="body1" className="text-gray-300">
          <Box component="span" className="font-medium">개인정보 수집방법:</Box> {section.additionalInfo.collectionMethod}
        </Typography>
      </Box>
    )}

    {'info' in section && section.info && (
      <Box className="space-y-2">
        <Typography variant="body1" className="text-gray-300">
          <Box component="span" className="font-medium">성명:</Box> {section.info.name}
        </Typography>
        <Typography variant="body1" className="text-gray-300">
          <Box component="span" className="font-medium">이메일:</Box> {section.info.email}
        </Typography>
        <Typography variant="body1" className="text-gray-300 mt-4">
          {section.info.additionalInfo}
        </Typography>
        <Typography variant="body1" className="text-gray-300">
          {section.info.reportCenter}
        </Typography>
      </Box>
    )}
  </Box>
));

PolicySection.displayName = 'PolicySection';

const PolicyPage = memo(function PolicyPage() {
  const params = useParams();
  const activeTab = params.tab as string;
  
  const tabItems = useMemo(() => [
    { label: 'Terms', value: 'terms', path: '/policy/terms' },
    { label: 'Privacy', value: 'privacy', path: '/policy/privacy' }
  ], []);
  
  const { currentSections, currentPolicy } = useMemo(() => {
    const isTerms = activeTab === 'terms';
    return {
      currentSections: isTerms ? TERMS_OF_SERVICE.sections : PRIVACY_POLICY.sections,
      currentPolicy: isTerms ? TERMS_OF_SERVICE : PRIVACY_POLICY
    };
  }, [activeTab]);

  return (
    <Box className="min-h-screen text-white">
      <Container maxWidth="md" className="px-4 py-8">
        {/* Tab Navigation */}
        <Box sx={{ marginBottom: 6}}>
          <SmallTabbar items={tabItems} />
        </Box>

        {/* Policy Content */}
        <Box>
          <Typography 
            variant="h3" 
            component="h1" 
            className="font-bold mb-8 text-white"
            gutterBottom
          >
            {currentPolicy.title}
          </Typography>
          
          {currentSections.map((section) => (
            <PolicySection 
              key={section.id} 
              section={section as SectionType} 
              activeTab={activeTab}
            />
          ))}

          {/* Footer - only for terms */}
          {activeTab === 'terms' && (
            <>
              <Divider sx={{ backgroundColor: 'rgb(31, 41, 55)', my: 6 }} />
              <Box className="pt-8">
                <Typography variant="body2" className="text-gray-500">
                  {TERMS_OF_SERVICE.footer.effectiveDate}
                  <br />
                  {TERMS_OF_SERVICE.footer.description}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
});

export default PolicyPage;