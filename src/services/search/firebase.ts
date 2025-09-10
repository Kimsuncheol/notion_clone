import { firebaseApp } from '@/constants/firebase';
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import type { TagTypeForTagsCollection, FirebaseNoteContent } from '@/types/firebase';

const db = getFirestore(firebaseApp);

export const searchNotesByTags = async (tagNames: string[], limitCount: number = 10): Promise<FirebaseNoteContent[]> => {
  try {
    // Get all notes from matching tags in the tags collection
    const allMatchingNotes: FirebaseNoteContent[] = [];
    const noteIds = new Set<string>(); // To avoid duplicates
    
    // Query tags collection for matching tag names (case-insensitive)
    const tagsRef = collection(db, 'tags');
    const tagsSnapshot = await getDocs(tagsRef);
    
    tagsSnapshot.docs.forEach(doc => {
      const tagData = doc.data() as TagTypeForTagsCollection;
      const tagName = tagData.name.toLowerCase();
      
      // Check if any of the search terms match this tag name
      const matchesSearch = tagNames.some(searchTag => 
        tagName.includes(searchTag.toLowerCase()) || 
        searchTag.toLowerCase().includes(tagName)
      );
      
      if (matchesSearch && tagData.notes) {
        // Add all notes from this tag, avoiding duplicates
        tagData.notes.forEach(note => {
          if (!noteIds.has(note.id)) {
            noteIds.add(note.id);
            allMatchingNotes.push({
              ...note,
              createdAt: note.createdAt instanceof Date ? note.createdAt : new Date(note.createdAt ?? Date.now()),
              updatedAt: note.updatedAt instanceof Date ? note.updatedAt : new Date(note.updatedAt ?? note.createdAt ?? Date.now())
            });
          }
        });
      }
    });

    // Filter for public and published notes, then sort and limit
    const publicNotes = allMatchingNotes
      .filter(note => note.isPublic && note.isPublished)
      .sort((a, b) => new Date(b.updatedAt ?? Date.now()).getTime() - new Date(a.updatedAt ?? Date.now()).getTime())
      .slice(0, limitCount);

    // Return as FirebaseNoteContent
    return publicNotes;
  } catch (error) {
    console.error('Error searching notes by tags:', error);
    throw error;
  }
};

export const searchPublicNotes = async (searchTerm: string, limit: number = 10): Promise<FirebaseNoteContent[]> => {
  try {
    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef,
      where('isPublic', '==', true),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);

    // Filter results by search term (client-side filtering since Firestore doesn't support full-text search)
    const results = snapshot.docs
      .map(doc => {
        const data = doc.data();
        const fullContent = data.content || '';

        return {
          id: doc.id,
          pageId: data.pageId || doc.id,
          title: data.title || 'Untitled',
          content: fullContent,
          description: data.description || '',
          tags: data.tags || [],
          series: data.series || null,
          authorId: data.userId || data.authorId,
          authorEmail: data.authorEmail || '',
          authorName: data.authorName || data.authorEmail?.split('@')[0] || 'Anonymous',
          isPublic: data.isPublic || false,
          isPublished: data.isPublished || false,
          thumbnailUrl: data.thumbnailUrl || '',
          viewCount: data.viewCount || 0,
          likeCount: data.likeCount || 0,
          likeUsers: data.likeUsers || [],
          originalLocation: data.originalLocation || { isPublic: true },
          comments: data.comments || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          recentlyOpenDate: data.recentlyOpenDate?.toDate(),
        } as FirebaseNoteContent;
      })
      .filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, limit);

    return results;
  } catch (error) {
    console.error('Error searching public notes:', error);
    throw error;
  }
};
