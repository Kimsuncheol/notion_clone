# Publish Functionality Redesign

## Overview

The `handlePublish` functionality and related code have been redesigned to provide clearer separation between draft and published states, better handle both existing and non-existing notes, and follow the `FirebaseNoteContent` interface more consistently.

## Key Improvements

### 1. Clear State Management
- **Drafts**: `isPublic: false, isPublished: false`
- **Published**: `isPublic: true, isPublished: true`
- Eliminated confusing middle states

### 2. Better Function Design
- `saveDraft()` - for creating/updating drafts
- `publishNote()` - for publishing (either from draft or new)
- Clear parameter interfaces with optional pageId for new notes

### 3. Comprehensive Error Handling
- Validates user authentication
- Checks note existence and ownership
- Proper error messages and user feedback

## New Functions

### `saveDraft(params: SaveDraftParams): Promise<string>`

Creates a new draft or updates an existing one.

**Parameters:**
```typescript
interface SaveDraftParams {
  pageId?: string; // Optional for new drafts
  title: string;
  content: string;
  tags?: TagType[];
  seriesId?: string;
  seriesTitle?: string;
  onSaveTitle?: (title: string) => void;
}
```

**Behavior:**
- If `pageId` is provided: Updates existing draft
- If `pageId` is omitted: Creates new draft
- Always sets `isPublic: false, isPublished: false`
- Returns the note ID

### `publishNote(params: PublishNoteParams): Promise<string>`

Publishes a note (creates new or publishes existing draft).

**Parameters:**
```typescript
interface PublishNoteParams {
  pageId?: string; // Optional for new notes
  title: string;
  content: string;
  publishContent?: string; // Uses content if not provided
  thumbnailUrl?: string;
  tags?: TagType[];
  seriesId?: string;
  seriesTitle?: string;
  onSaveTitle?: (title: string) => void;
  setPublishContent?: (content: string) => void;
  setShowMarkdownPublishScreen?: (show: boolean) => void;
}
```

**Behavior:**
- If `pageId` is provided: Updates existing note to published state
- If `pageId` is omitted: Creates new published note
- Always sets `isPublic: true, isPublished: true`
- Returns the note ID

## Usage Examples

### Creating a New Draft
```typescript
const draftParams = createSaveDraftParams(
  'My Draft Title',
  'Draft content here...',
  undefined, // No pageId for new draft
  tags,
  seriesId,
  seriesTitle,
  (title) => setTitle(title)
);

const noteId = await saveDraft(draftParams);
```

### Publishing an Existing Draft
```typescript
const publishParams = createPublishNoteParams(
  'Published Title',
  'Final content...',
  existingDraftId, // Existing draft pageId
  'Published content...', // Optional publishContent
  thumbnailUrl,
  tags,
  seriesId,
  seriesTitle,
  (title) => setTitle(title),
  setPublishContent,
  setShowMarkdownPublishScreen
);

const noteId = await publishNote(publishParams);
```

### Creating a New Published Note
```typescript
const publishParams = createPublishNoteParams(
  'New Published Title',
  'Content...',
  undefined, // No pageId for new note
  undefined, // Will use content as publishContent
  thumbnailUrl,
  tags
);

const noteId = await publishNote(publishParams);
```

## Utility Functions

### State Checking
```typescript
// Check if note is a draft
const isDraft = isNoteDraft(note); // !isPublished && !isPublic

// Check if note is published
const isPublished = isNotePublished(note); // isPublished && isPublic

// Get note state
const state = getNoteState(note); // 'draft' | 'published'
```

## Migration Guide

### From Old `handlePublish`
```typescript
// Old way
const publishParams: PublishNoteParams = {
  pageId: pageId as string,
  title,
  content,
  publishContent,
  thumbnailUrl,
  isPublished: true,
  // ... other params
};
await handlePublish(publishParams);

// New way (handlePublish still works for backward compatibility)
const publishParams = createPublishNoteParams(
  title,
  content,
  pageId,
  publishContent,
  thumbnailUrl,
  tags,
  seriesId,
  seriesTitle,
  onSaveTitle,
  setPublishContent,
  setShowMarkdownPublishScreen
);
await publishNote(publishParams);
```

### From Old `SaveDraftedNote`
```typescript
// Old way
const noteId = await SaveDraftedNote(title, content, tags);

// New way
const draftParams = createSaveDraftParams(title, content, undefined, tags);
const noteId = await saveDraft(draftParams);
```

## Backward Compatibility

- `handlePublish()` still works (wraps `publishNote()`)
- `SaveDraftedNote()` still works (wraps `saveDraft()` with deprecation warning)
- Legacy interfaces and helper functions maintained
- Existing components should continue to work without changes

## Error Handling

Both functions provide comprehensive error handling:
- User authentication validation
- Note existence and ownership verification
- Input validation (title cannot be empty)
- Proper error messages via toast notifications
- Detailed console logging for debugging

## Database Schema

Notes are stored with consistent state:

```typescript
interface FirebaseNoteContent {
  id: string;
  pageId: string;
  title: string;
  content: string;
  publishContent?: string;
  isPublic?: boolean;    // false for drafts, true for published
  isPublished?: boolean; // false for drafts, true for published
  // ... other fields
}
```

## Testing Considerations

When testing the new functionality, verify:
1. New draft creation works without pageId
2. Draft updates work with existing pageId
3. Publishing existing drafts transitions state correctly
4. Publishing new content creates published notes
5. Error handling for unauthorized access
6. Proper state validation (drafts vs published)
