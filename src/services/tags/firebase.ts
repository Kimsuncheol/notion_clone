import { getFirestore, collection, getDocs, query, where, Timestamp, deleteDoc } from 'firebase/firestore';
import { firebaseApp } from '@/constants/firebase';
import { TagTypeForTagsCollection, FirebaseNoteContent } from '@/types/firebase';

const db = getFirestore(firebaseApp);

/**
 * Fetches all tags from the tags collection
 * @returns Promise<TagTypeForTagsCollection[]> - Array of tags from the tags collection
 */
export const fetchTagsFromTagsCollection = async (): Promise<TagTypeForTagsCollection[]> => {
  try {
    const tagsCollectionRef = collection(db, 'tags');
    const snapshot = await getDocs(tagsCollectionRef);
    const tags: TagTypeForTagsCollection[] = [];

    const deletionTasks: Promise<void>[] = [];

    for (const tagDoc of snapshot.docs) {
      const data = tagDoc.data();
      const notes = Array.isArray(data.notes) ? data.notes : [];

      if (notes.length === 0) {
        deletionTasks.push((async () => {
          try {
            await deleteDoc(tagDoc.ref);
            console.log(`Removed tag "${data.name || tagDoc.id}" due to empty notes array`);
          } catch (deleteError) {
            console.error(`Failed to remove empty tag "${data.name || tagDoc.id}":`, deleteError);
          }
        })());
        continue;
      }

      // Convert Firestore Timestamps to Date objects
      tags.push({
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
        // Ensure notes array exists
        notes,
        // Ensure postCount is a number
        postCount: data.postCount || 0,
      } as TagTypeForTagsCollection);
    }

    if (deletionTasks.length > 0) {
      await Promise.all(deletionTasks);
    }
    
    // Sort tags by postCount in descending order (most popular first)
    tags.sort((a, b) => b.postCount - a.postCount);
    
    console.log(`Fetched ${tags.length} tags from tags collection`);
    return tags;
  } catch (error) {
    console.error('Error fetching tags from tags collection:', error);
    throw error;
  }
};

/**
 * Fetches a specific tag by name from the tags collection
 * @param tagName - The name of the tag to fetch
 * @returns Promise<TagTypeForTagsCollection | null> - The tag data or null if not found
 */
export const fetchTagByName = async (tagName: string): Promise<TagTypeForTagsCollection | null> => {
  try {
    console.log('fetchTagByName tagName: ', tagName);
    const tagsCollectionRef = collection(db, 'tags');
    const q = query(tagsCollectionRef, where('name', '==', tagName));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log(`Tag with name "${tagName}" not found`);
      return null;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    const notes = Array.isArray(data.notes) ? data.notes : [];

    if (notes.length === 0) {
      await deleteDoc(doc.ref);
      console.log(`Removed tag "${tagName}" due to empty notes array`);
      return null;
    }

    // Convert Firestore Timestamps to Date objects
    const tag = {
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      // Ensure notes array exists
      notes,
      // Ensure postCount is a number
      postCount: data.postCount || 0,
    } as TagTypeForTagsCollection;
    
    console.log(`Fetched tag "${tagName}" with ${tag.notes.length} notes`);
    return tag;
  } catch (error) {
    console.error(`Error fetching tag "${tagName}":`, error);
    throw error;
  }
};

/**
 * Fetches notes associated with a specific tag from the tags collection
 * @param tagName - The name of the tag to fetch notes for
 * @param includePrivate - Whether to include private notes (defaults to false)
 * @returns Promise<FirebaseNoteContent[]> - Array of notes associated with the tag
 */
export const fetchNotesByTag = async (tagName: string, includePrivate: boolean = false): Promise<FirebaseNoteContent[]> => {
  try {
    console.log(`fetchNotesByTag tagName: ${tagName}, includePrivate: ${includePrivate}`);
    
    // Query the tags collection directly for the tag with matching name
    const tagsCollectionRef = collection(db, 'tags');
    const q = query(tagsCollectionRef, where('name', '==', tagName));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log(`Tag "${tagName}" not found`);
      return [];
    }
    
    // Get the first matching tag document
    const tagDoc = snapshot.docs[0];
    const tagData = tagDoc.data();

    const rawNotes = Array.isArray(tagData.notes) ? tagData.notes : [];

    if (rawNotes.length === 0) {
      await deleteDoc(tagDoc.ref);
      console.log(`Removed tag "${tagName}" while fetching notes due to empty notes array`);
      return [];
    }

    // Extract notes from the tag's notes field
    let notes = rawNotes;
    
    // Filter out private notes if not requested
    if (!includePrivate) {
      notes = notes.filter((note: FirebaseNoteContent) => note.isPublic && note.isPublished);
    }
    
    // Convert any Timestamp objects to Date objects and ensure proper structure
    const processedNotes = notes.map((note: FirebaseNoteContent) => ({
      ...note,
      createdAt: note.createdAt instanceof Timestamp ? note.createdAt.toDate() : note.createdAt,
      updatedAt: note.updatedAt instanceof Timestamp ? note.updatedAt.toDate() : note.updatedAt,
      recentlyOpenDate: note.recentlyOpenDate instanceof Timestamp ? note.recentlyOpenDate.toDate() : note.recentlyOpenDate,
      // Ensure required arrays exist
      tags: note.tags || [],
      likeUsers: note.likeUsers || [],
      comments: note.comments || [],
    })) as FirebaseNoteContent[];
    
    // Sort by most recent first
    processedNotes.sort((a, b) => {
      const dateA = a.updatedAt instanceof Date ? a.updatedAt : (a.updatedAt ? new Date(a.updatedAt) : new Date());
      const dateB = b.updatedAt instanceof Date ? b.updatedAt : (b.updatedAt ? new Date(b.updatedAt) : new Date());
      return dateB.getTime() - dateA.getTime();
    });
    
    console.log(`Fetched ${processedNotes.length} notes for tag "${tagName}"`);
    return processedNotes;
  } catch (error) {
    console.error(`Error fetching notes by tag "${tagName}":`, error);
    throw error;
  }
};
