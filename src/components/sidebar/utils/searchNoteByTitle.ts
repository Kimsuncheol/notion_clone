// search note by title
// return the note id and title
// With n-gram search

import { fetchNotesList } from "@/services/firebase";

export const searchNoteByTitle = async (title: string) => {
  const notes = await fetchNotesList();
  const notesWithNgram = notes.filter((note) => note.title.toLowerCase().includes(title.toLowerCase()));
  return notesWithNgram;
};