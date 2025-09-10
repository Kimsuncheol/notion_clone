import { searchPublicNotes } from "@/services/search/firebase";

export const searchNoteByTitle = async (title: string) => {
  try {
    // Use the Firebase search function instead of fetching all notes
    const publicNotes = await searchPublicNotes(title, 50);
    
    // Convert to the expected format
    const notesWithNgram = publicNotes
      .filter((note) => note.title.toLowerCase().includes(title.toLowerCase()))
      .map((note) => ({
        id: note.id,
        title: note.title,
        content: note.publishContent || '',
        isPublic: true,
        userId: note.authorId,
        authorName: note.authorName,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      }));
    
    return notesWithNgram;
  } catch (error) {
    console.error('Error searching notes by title:', error);
    return [];
  }
};