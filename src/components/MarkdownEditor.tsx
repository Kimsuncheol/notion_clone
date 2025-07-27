import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchNoteContent, updateFavoriteNoteTitle, updateNoteContent } from '@/services/firebase';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';
import { Comment } from '@/types/comments';
import { MarkdownContentArea } from './markdown';
import { ThemeOption } from './markdown/ThemeSelector';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import PublishModal from './PublishModal';
import { NoteContentProvider, useNoteContent } from '@/contexts/NoteContentContext';
import { EditorView } from '@codemirror/view';
import { formatSelection } from './markdown/codeFormatter';
import { useAutosave } from 'react-autosave';

// Import all available themes
import {
  githubLight,
  githubDark,
  dracula,
  tokyoNight,
  tokyoNightDay,
  tokyoNightStorm,
  vscodeDark,
  vscodeLight,
  materialDark,
  materialLight,
  solarizedLight,
  solarizedDark,
  nord,
  monokai,
  gruvboxDark,
  sublime,
  okaidia,
  eclipse,
  bespin,
  atomone,
  aura,
  basicDark,
  basicLight
} from '@uiw/codemirror-themes-all';

// Define available themes
const availableThemes: ThemeOption[] = [
  // Light themes
  { name: 'GitHub Light', value: 'githubLight', theme: githubLight, category: 'light' },
  { name: 'Material Light', value: 'materialLight', theme: materialLight, category: 'light' },
  { name: 'Solarized Light', value: 'solarizedLight', theme: solarizedLight, category: 'light' },
  { name: 'Tokyo Night Day', value: 'tokyoNightDay', theme: tokyoNightDay, category: 'light' },
  { name: 'VS Code Light', value: 'vscodeLight', theme: vscodeLight, category: 'light' },
  { name: 'Eclipse', value: 'eclipse', theme: eclipse, category: 'light' },
  { name: 'Basic Light', value: 'basicLight', theme: basicLight, category: 'light' },

  // Dark themes
  { name: 'GitHub Dark', value: 'githubDark', theme: githubDark, category: 'dark' },
  { name: 'Dracula', value: 'dracula', theme: dracula, category: 'dark' },
  { name: 'Tokyo Night', value: 'tokyoNight', theme: tokyoNight, category: 'dark' },
  { name: 'Tokyo Night Storm', value: 'tokyoNightStorm', theme: tokyoNightStorm, category: 'dark' },
  { name: 'VS Code Dark', value: 'vscodeDark', theme: vscodeDark, category: 'dark' },
  { name: 'Material Dark', value: 'materialDark', theme: materialDark, category: 'dark' },
  { name: 'Solarized Dark', value: 'solarizedDark', theme: solarizedDark, category: 'dark' },
  { name: 'Nord', value: 'nord', theme: nord, category: 'dark' },
  { name: 'Monokai', value: 'monokai', theme: monokai, category: 'dark' },
  { name: 'Gruvbox Dark', value: 'gruvboxDark', theme: gruvboxDark, category: 'dark' },
  { name: 'Sublime', value: 'sublime', theme: sublime, category: 'dark' },
  { name: 'Okaidia', value: 'okaidia', theme: okaidia, category: 'dark' },
  { name: 'Bespin', value: 'bespin', theme: bespin, category: 'dark' },
  { name: 'Atom One', value: 'atomone', theme: atomone, category: 'dark' },
  { name: 'Aura', value: 'aura', theme: aura, category: 'dark' },
  { name: 'Basic Dark', value: 'basicDark', theme: basicDark, category: 'dark' },
];

interface MarkdownEditorProps {
  pageId: string;
  onSaveTitle: (title: string) => void;
  onBlockCommentsChange?: (newBlockComments: Record<string, Comment[]>) => void;
  isPublic?: boolean;
  isPublished?: boolean;
  templateId?: string | null;
  templateTitle?: string | null;
}

// Template definitions for initialization
const templates: Record<string, string> = {
  'meeting-notes': `# Meeting Notes

**Date:** ${new Date().toLocaleDateString()}
**Time:** 
**Location:** 
**Attendees:** 

## Agenda
1. 
2. 
3. 

## Discussion Points

### Topic 1
- 
- 

### Topic 2
- 
- 

## Decisions Made
- 
- 

## Action Items
- [ ] **Task 1** - Assigned to: [Name] - Due: [Date]
- [ ] **Task 2** - Assigned to: [Name] - Due: [Date]
- [ ] **Task 3** - Assigned to: [Name] - Due: [Date]

## Next Meeting
**Date:** 
**Agenda Items:** 
- 
- 

---
*Meeting notes prepared by: [Your Name]*`,

  'project-readme': `# Project Name

![Project Logo](https://via.placeholder.com/150x150?text=Logo)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](package.json)

## Description

Brief description of what your project does and why it exists.

## Features

- ✨ Feature 1
- 🚀 Feature 2
- 🎯 Feature 3
- 🔧 Feature 4

## Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/username/project-name.git

# Navigate to project directory
cd project-name

# Install dependencies
npm install
\`\`\`

## Usage

\`\`\`javascript
// Example usage
import { ProjectName } from 'project-name';

const example = new ProjectName();
example.doSomething();
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - [@yourusername](https://twitter.com/yourusername) - email@example.com

Project Link: [https://github.com/username/project-name](https://github.com/username/project-name)`,

  'blog-post': `# Your Blog Post Title

![Featured Image](https://via.placeholder.com/800x400?text=Featured+Image)

*Published on ${new Date().toLocaleDateString()} by [Your Name]*

## Introduction

Start with a compelling hook that draws readers in. Explain what this post is about and why they should care.

## Table of Contents

- [Section 1](#section-1)
- [Section 2](#section-2)
- [Section 3](#section-3)
- [Conclusion](#conclusion)

## Section 1

### Subsection 1.1

Write your content here. Use clear, concise language and break up text with:

- **Bold text** for emphasis
- *Italic text* for subtle emphasis
- \`Code snippets\` for technical terms

> Use blockquotes for important points or quotes

### Subsection 1.2

Include examples, code blocks, or visuals:

\`\`\`javascript
// Example code block
function example() {
  return "This is an example";
}
\`\`\`

## Section 2

Continue developing your main points. Consider including:

1. Numbered lists for step-by-step processes
2. Statistics or data to support your points
3. Personal anecdotes or case studies

## Section 3

Build toward your conclusion. This is where you:

- Tie together all your main points
- Provide actionable insights
- Set up the conclusion

## Conclusion

Summarize your key points and provide a clear call-to-action. What do you want readers to do after reading this?

---

### About the Author

Brief bio about yourself and your expertise in this topic.

### Related Posts

- [Related Post 1](#)
- [Related Post 2](#)
- [Related Post 3](#)

*Tags: #tag1 #tag2 #tag3*`,

  'daily-journal': `# Daily Journal - ${new Date().toLocaleDateString()}

## Today's Weather
☀️ Weather: 
🌡️ Temperature: 

## Mood Check-in
😊 Overall mood: 
💭 Emotional state: 

## Today's Highlights

### What went well today?
- 
- 
- 

### What challenged me today?
- 
- 
- 

### What did I learn today?
- 
- 
- 

## Accomplishments
- [ ] Goal 1
- [ ] Goal 2
- [ ] Goal 3

## Gratitude
Three things I'm grateful for today:
1. 
2. 
3. 

## Tomorrow's Goals
- [ ] Priority 1
- [ ] Priority 2
- [ ] Priority 3

## Evening Reflection

### How did I grow today?


### What would I do differently?


### Random thoughts/observations:


---
*"Every day is a new beginning. Take a deep breath, smile, and start again."*`,

  'study-notes': `# Study Notes: [Subject/Topic]

**Date:** ${new Date().toLocaleDateString()}
**Chapter/Section:** 
**Source:** 

## Learning Objectives
By the end of this study session, I should be able to:
- [ ] Objective 1
- [ ] Objective 2
- [ ] Objective 3

## Key Concepts

### Concept 1: [Name]
**Definition:** 

**Important Points:**
- 
- 
- 

**Example:** 

### Concept 2: [Name]
**Definition:** 

**Important Points:**
- 
- 
- 

**Example:** 

## Formulas/Equations
\`\`\`
Formula 1: 
Formula 2: 
Formula 3: 
\`\`\`

## Diagrams/Visual Aids
*[Describe or embed images/diagrams]*

## Practice Problems

### Problem 1
**Question:** 

**Solution:** 

### Problem 2
**Question:** 

**Solution:** 

## Summary
Key takeaways from this study session:
- 
- 
- 

## Questions for Further Review
- ? 
- ? 
- ? 

## Next Steps
- [ ] Review these notes
- [ ] Practice additional problems
- [ ] Discuss concepts with study group
- [ ] Prepare for quiz/exam

---
**Study tip:** *Use active recall and spaced repetition for better retention.*`,

  'project-proposal': `# Project Proposal: [Project Name]

**Prepared by:** [Your Name]
**Date:** ${new Date().toLocaleDateString()}
**Version:** 1.0

## Executive Summary

Brief overview of the project, its objectives, and expected outcomes.

## Project Background

### Problem Statement
Describe the problem or opportunity this project addresses.

### Current Situation
Explain the current state and why change is needed.

## Project Objectives

### Primary Objectives
- 
- 
- 

### Secondary Objectives
- 
- 
- 

### Success Criteria
- 
- 
- 

## Scope of Work

### In Scope
- 
- 
- 

### Out of Scope
- 
- 
- 

## Methodology/Approach

Describe how you plan to execute the project:

1. **Phase 1:** Planning and Preparation
2. **Phase 2:** Implementation
3. **Phase 3:** Testing and Validation
4. **Phase 4:** Deployment and Handover

## Timeline

| Phase | Duration | Start Date | End Date | Deliverables |
|-------|----------|------------|----------|--------------|
| Phase 1 | 2 weeks | [Date] | [Date] | Planning documents |
| Phase 2 | 6 weeks | [Date] | [Date] | Core implementation |
| Phase 3 | 2 weeks | [Date] | [Date] | Testing reports |
| Phase 4 | 1 week | [Date] | [Date] | Final delivery |

## Resource Requirements

### Human Resources
- Project Manager: [Name/Role]
- Developer(s): [Name/Role]
- Designer(s): [Name/Role]
- Other: [Name/Role]

### Technical Resources
- 
- 
- 

### Budget Estimate
| Item | Cost | Notes |
|------|------|-------|
| Labor | $X,XXX | |
| Tools/Software | $XXX | |
| Infrastructure | $XXX | |
| **Total** | **$X,XXX** | |

## Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|-------------------|
| Risk 1 | Medium | High | Strategy 1 |
| Risk 2 | Low | Medium | Strategy 2 |
| Risk 3 | High | Low | Strategy 3 |

## Expected Benefits

### Quantifiable Benefits
- 
- 
- 

### Qualitative Benefits
- 
- 
- 

## Conclusion

Summarize why this project should be approved and its importance to the organization.

## Next Steps

1. Review and approval of this proposal
2. Secure necessary resources and budget
3. Kick-off meeting and project initiation
4. Begin Phase 1 activities

---

**Approval Required:**
- [ ] Department Head
- [ ] Finance Team
- [ ] Technical Lead
- [ ] Project Sponsor`,

  'api-documentation': `# API Documentation

## Overview

Brief description of your API, its purpose, and main functionality.

**Base URL:** \`https://api.example.com/v1\`
**Version:** 1.0
**Last Updated:** ${new Date().toLocaleDateString()}

## Authentication

### API Key Authentication
\`\`\`http
GET /endpoint
Authorization: Bearer YOUR_API_KEY
\`\`\`

### OAuth 2.0
\`\`\`http
GET /endpoint
Authorization: Bearer YOUR_ACCESS_TOKEN
\`\`\`

## Rate Limiting

- **Rate Limit:** 1000 requests per hour
- **Headers:**
  - \`X-RateLimit-Limit\`: Request limit per hour
  - \`X-RateLimit-Remaining\`: Remaining requests
  - \`X-RateLimit-Reset\`: Time when limit resets

## Endpoints

### Users

#### Get User
\`GET /users/{id}\`

**Description:** Retrieve a specific user by ID.

**Parameters:**
- \`id\` (path, required): User ID

**Response:**
\`\`\`json
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2023-01-01T00:00:00Z"
}
\`\`\`

#### Create User
\`POST /users\`

**Description:** Create a new user.

**Request Body:**
\`\`\`json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2023-01-01T00:00:00Z"
}
\`\`\`

#### Update User
\`PUT /users/{id}\`

**Description:** Update an existing user.

**Parameters:**
- \`id\` (path, required): User ID

**Request Body:**
\`\`\`json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
\`\`\`

#### Delete User
\`DELETE /users/{id}\`

**Description:** Delete a user.

**Parameters:**
- \`id\` (path, required): User ID

**Response:** 204 No Content

## Error Handling

### Error Response Format
\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
\`\`\`

### HTTP Status Codes
- \`200\` - OK
- \`201\` - Created
- \`204\` - No Content
- \`400\` - Bad Request
- \`401\` - Unauthorized
- \`403\` - Forbidden
- \`404\` - Not Found
- \`429\` - Too Many Requests
- \`500\` - Internal Server Error

## Code Examples

### JavaScript/Node.js
\`\`\`javascript
const response = await fetch('https://api.example.com/v1/users/123', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const user = await response.json();
\`\`\`

### Python
\`\`\`python
import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get('https://api.example.com/v1/users/123', headers=headers)
user = response.json()
\`\`\`

### cURL
\`\`\`bash
curl -X GET "https://api.example.com/v1/users/123" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"
\`\`\`

## SDKs and Libraries

- **JavaScript:** [@company/api-client](https://npmjs.com/package/@company/api-client)
- **Python:** [company-api-python](https://pypi.org/project/company-api-python/)
- **PHP:** [company/api-client](https://packagist.org/packages/company/api-client)

## Changelog

### Version 1.0 (${new Date().toLocaleDateString()})
- Initial release
- User management endpoints
- Authentication system

---

**Need Help?**
- 📧 Email: api-support@example.com
- 📚 Guides: [Developer Portal](https://developers.example.com)
- 💬 Community: [Discord](https://discord.gg/example)`,

  'task-list': `# Task Management - ${new Date().toLocaleDateString()}

## Today's Priority Tasks
- [ ] **High Priority:** Task 1 - Due: [Time]
- [ ] **High Priority:** Task 2 - Due: [Time]
- [ ] **Medium Priority:** Task 3 - Due: [Time]

## Weekly Goals
- [ ] Goal 1
- [ ] Goal 2
- [ ] Goal 3
- [ ] Goal 4

## Project Tasks

### Project A
- [ ] Task 1 - Assigned to: [Name] - Due: [Date]
- [ ] Task 2 - Assigned to: [Name] - Due: [Date]
- [ ] Task 3 - Assigned to: [Name] - Due: [Date]

### Project B
- [ ] Task 1 - Assigned to: [Name] - Due: [Date]
- [ ] Task 2 - Assigned to: [Name] - Due: [Date]

## Backlog
- [ ] Future task 1
- [ ] Future task 2
- [ ] Future task 3

## Completed Tasks ✅
- [x] ~~Completed task 1~~ - Completed on [Date]
- [x] ~~Completed task 2~~ - Completed on [Date]

## Notes & Ideas
- 💡 Idea 1: 
- 💡 Idea 2: 
- 📝 Note 1: 
- 📝 Note 2: 

## Daily Standup Notes

### What I worked on yesterday:
- 
- 

### What I'm working on today:
- 
- 

### Blockers/Issues:
- 
- 

## Review & Reflection

### What went well this week?
- 
- 

### What could be improved?
- 
- 

### Lessons learned:
- 
- 

---
*Task management tip: Break large tasks into smaller, actionable items for better progress tracking.*`
};

// Inner component that uses the context
const MarkdownEditorInner: React.FC<MarkdownEditorProps> = ({
  pageId,
  onBlockCommentsChange, // eslint-disable-line @typescript-eslint/no-unused-vars
  isPublic = false,
  templateId,
  templateTitle
}) => {
  const {
    content,
    setContent,
    publishContent,
    setPublishContent,
    isSaving,
    setIsSaving,
    onSaveTitle,
  } = useNoteContent();

  const [title, setTitle] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [authorEmail, setAuthorEmail] = useState<string | null>(null);
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string>('githubLight');
  const [authorName, setAuthorName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const auth = getAuth(firebaseApp);

  const editorRef = useRef<EditorView | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const lastSavedContent = useRef<string>('');
  const lastSavedTitle = useRef<string>('');

  const user = auth.currentUser;
  const viewMode = user && user.email === authorEmail ? 'split' : 'preview';

  const handleSave = useCallback(async (isAutoSave = false, data?: { title: string; content: string; updatedAt?: Date }) => {
    if (!auth.currentUser || isSaving) return;

    const noteTitle = isAutoSave && data ? data.title : title;
    const noteContent = isAutoSave && data ? data.content : content;
    // Add validation for manual save
    if (!isAutoSave) {
      if (!noteTitle.trim() || noteTitle.length === 0) {
        toast.error('Please enter a title');
        return;
      }
      if ((!noteContent.trim() || noteContent.length === 0) && !updatedAt) {
        toast.error('Content cannot be empty');
        return;
      }
    }

    try {
      setIsSaving(true);

      await updateNoteContent(
        pageId,
        noteTitle || 'Untitled',
        noteTitle || 'Untitled', // publishTitle same as title
        noteContent,
        publishContent,
        isPublic,
        isPublished,
        thumbnailUrl // No thumbnail for auto-save
      );

      await updateFavoriteNoteTitle(pageId, noteTitle);

      if (isAutoSave) {
        // Update refs to track what was last saved
        console.log('Auto-saved successfully');
      }
      lastSavedContent.current = noteContent;
      lastSavedTitle.current = noteTitle;
      if (onSaveTitle) {
        onSaveTitle(noteTitle);
      }


      toast.success('Note saved successfully!');
    } catch (error) {
      const errorMessage = `Failed to save note${isAutoSave ? ' (auto-save)' : ''}`;
      console.error(`${errorMessage}:`, error);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [auth.currentUser, isSaving, pageId, title, content, publishContent, isPublic, isPublished, onSaveTitle, setIsSaving, thumbnailUrl, updatedAt]);

  // Auto-save function using react-autosave
  const performAutoSave = useCallback(async (data: { title: string; content: string; updatedAt?: Date }) => {
    // Only save if content or title has actually changed
    if (data.content === lastSavedContent.current && data.title === lastSavedTitle.current) {
      return;
    }

    // Don't save if content or title is empty
    // Don't touch this, it's important
    if (data.content.length === 0 || data.title.length === 0) {
      return;
    }

    // Basic validation
    if (!data.title.trim() && !data.content.trim()) {
      return;
    }

    await handleSave(true, data);
  }, [handleSave]);

  // Use react-autosave hook with 2 second delay (default)
  useAutosave({
    data: { title, content },
    onSave: performAutoSave,
    interval: 2000, // 2 seconds delay
    saveOnUnmount: true
  });

  // Function to save and restore cursor position
  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && titleRef.current) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(titleRef.current);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      return preCaretRange.toString().length;
    }
    return 0;
  };

  const restoreCursorPosition = (position: number) => {
    if (!titleRef.current) return;

    const textNode = titleRef.current.firstChild;
    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      const range = document.createRange();
      const selection = window.getSelection();
      const maxPosition = Math.min(position, textNode.textContent?.length || 0);

      range.setStart(textNode, maxPosition);
      range.setEnd(textNode, maxPosition);

      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const handleTitleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const newTitle = target.textContent || '';
    const cursorPosition = saveCursorPosition();

    setTitle(newTitle);

    // Restore cursor position after React re-render
    setTimeout(() => {
      restoreCursorPosition(cursorPosition);
    }, 0);
  };

  // Update contentEditable content only when title changes from external source
  useEffect(() => {
    if (titleRef.current && titleRef.current.textContent !== title) {
      const cursorPosition = saveCursorPosition();
      titleRef.current.textContent = title;
      restoreCursorPosition(cursorPosition);
    }
  }, [title]);

  // Get current theme object
  const getCurrentTheme = () => {
    const themeObj = availableThemes.find(theme => theme.value === currentTheme);
    return themeObj?.theme || githubLight;
  };

  // Detect dark mode and set default theme
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);

      // Set default theme based on mode if not already set
      if (currentTheme === 'githubLight' && isDark) {
        setCurrentTheme('githubDark');
      } else if (currentTheme === 'githubDark' && !isDark) {
        setCurrentTheme('githubLight');
      }
    };

    checkDarkMode();

    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkDarkMode);
    };
  }, [currentTheme]);

  const handleFormatCode = useCallback(() => {
    if (editorRef.current) {
      formatSelection(editorRef.current);
      // Update the parent component with the formatted content
      setTimeout(() => {
        if (editorRef.current) {
          setContent(editorRef.current.state.doc.toString());
        }
      }, 100);
    }
  }, [setContent]);

  // Load note content
  useEffect(() => {
    const loadNote = async () => {
      if (!pageId) return;

      try {
        setIsLoading(true);

        // Check if this is a template initialization
        if (templateId && templates[templateId]) {
          // Initialize with template content
          const templateContent = templates[templateId];
          setTitle(templateTitle || 'Untitled');
          setContent(templateContent);
          setPublishContent('');

          // Set author info
          setAuthorEmail(user?.email || null);
          setAuthorId(user?.uid || null);
          setAuthorName(user?.displayName || user?.email?.split('@')[0] || 'Anonymous');
          setDate(new Date().toLocaleDateString());

          // Initialize last saved refs to current values
          lastSavedContent.current = templateContent;
          lastSavedTitle.current = templateTitle || 'Untitled';

          setIsLoading(false);
          return;
        }

        const noteContent = await fetchNoteContent(pageId);

        if (noteContent) {
          setTitle(noteContent.title || '');
          setThumbnailUrl(noteContent.thumbnail || '');
          setAuthorEmail(noteContent.authorEmail || null);
          setAuthorId(noteContent.userId || null);
          setAuthorName(noteContent.authorName || '');
          setTitle(noteContent.title || '');
          setDate(noteContent.updatedAt?.toLocaleDateString() || noteContent.createdAt.toLocaleDateString());

          // Set content in context
          setContent(noteContent.content || '');
          setPublishContent(noteContent.publishContent || '');
          setIsPublished(noteContent.isPublished ?? false);
          setUpdatedAt(noteContent.updatedAt || null);

          // Initialize last saved refs to prevent immediate auto-save
          lastSavedContent.current = noteContent.content || '';
          lastSavedTitle.current = noteContent.title || '';
        }
      } catch (error) {
        console.error('Error loading note:', error);
        toast.error('Failed to load note');
      } finally {
        setIsLoading(false);
      }
    };

    loadNote();
  }, [pageId, setContent, setPublishContent, templateId, templateTitle, user]);

  const handleThemeChange = useCallback((themeValue: string) => {
    setCurrentTheme(themeValue);
  }, []);

  // Handle publish modal using updateNoteContent directly
  const handlePublish = useCallback(async (thumbnailUrl?: string, isPublished?: boolean, publishTitle?: string, publishContentFromModal?: string) => {
    if (!auth.currentUser || isSaving) return;

    try {
      setIsSaving(true);

      // If publishContent is provided from modal, update the context
      if (publishContentFromModal) {
        setPublishContent(publishContentFromModal);
      }

      await updateNoteContent(
        pageId,
        title,
        publishTitle || title,
        content,
        publishContentFromModal || publishContent,
        true, // isPublic for publishing
        isPublished,
        thumbnailUrl
      );

      // Call the onSaveTitle callback if provided
      if (onSaveTitle) {
        onSaveTitle(title);
      }

      toast.success(isPublished ? 'Note published successfully!' : 'Note saved as draft!');
      setShowPublishModal(false);
    } catch (error) {
      console.error('Error publishing note:', error);
      toast.error('Failed to publish note');
    } finally {
      setIsSaving(false);
    }
  }, [auth.currentUser, isSaving, pageId, title, content, publishContent, onSaveTitle, setIsSaving, setPublishContent]);

  // Keyboard shortcuts - removed autoSave, only manual save and publish modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        setShowPublishModal(true); // Show publish modal
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleSave(); // Manual save only
      } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        handleFormatCode(); // Format code
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleFormatCode]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading markdown editor...</div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col sticky left-60 top-10">
        <div className={`w-full border-r flex flex-col p-4 pb-2 gap-6 border-gray-200 dark:border-gray-700 ${viewMode === 'preview' ? 'hidden' : ''}`} id="title-input-container">
          <div
            contentEditable
            suppressContentEditableWarning={true}
            onInput={handleTitleInput}
            onKeyDown={(e) => {
              // Prevent Enter key from creating new lines (optional)
              if (e.key === 'Enter') {
                e.preventDefault();
                // e.currentTarget.textContent += '\n';
              }
            }}
            className="w-full text-5xl font-bold bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 whitespace-pre-wrap min-h-[1.2em] focus:outline-none leading-[1.5]"
            style={{
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
            ref={titleRef}
          >
          </div>
          {!title && (
            <div className="absolute pointer-events-none text-5xl font-bold text-gray-400 dark:text-gray-500">
              Untitled
            </div>
          )}
          <hr className="border-gray-200 dark:border-gray-700 w-[60px] border-2" />
        </div>

        <MarkdownContentArea
          viewMode={viewMode}
          content={content}
          theme={getCurrentTheme()}
          onContentChange={setContent}
          onSave={handleSave}
          isSaving={isSaving}
          currentTheme={currentTheme}
          themes={availableThemes}
          isDarkMode={isDarkMode}
          pageId={pageId}
          authorName={authorName}
          authorId={authorId as string}
          date={date}
          onThemeChange={handleThemeChange}
          onFormatCode={handleFormatCode}
          editorRef={editorRef}
        />

        {/* Publish Modal */}
        <PublishModal
          isOpen={showPublishModal}
          onClose={() => setShowPublishModal(false)}
          title={title}
          thumbnailUrl={thumbnailUrl || ''}
          onPublish={handlePublish}
        />
      </div>
    </DndProvider>
  );
};

// Main component wrapped with context provider
const MarkdownEditor: React.FC<MarkdownEditorProps> = (props) => {
  return (
    <NoteContentProvider onSaveTitle={props.onSaveTitle}>
      <MarkdownEditorInner {...props} />
    </NoteContentProvider>
  );
};

export default MarkdownEditor; 