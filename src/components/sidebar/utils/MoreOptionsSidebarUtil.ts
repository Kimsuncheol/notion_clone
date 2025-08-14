// export const checkAllSubNotesTrashed = (noteId: string): boolean => {
//   const subNotes = subNotesMap[noteId] || [];

//   if (subNotes.length === 0) {
//     return false;
//   }

//   return subNotes.every((subNote) => (subNote as any).isTrashed === true);
// }

// // Alternative: If you need to check based on a different data structure
// export const checkAllSubNotesTrashedFromStore = (noteId: string): boolean => {
//   // If you're using Redux store or another state management
//   const note = folders
//     .flatMap(folder => folder.notes)
//     .find(note => note.id === noteId);
    
//   if (!note || !note.subNotes || note.subNotes.length === 0) {
//     return false;
//   }
  
//   return note.subNotes.every(subNote => subNote.isTrashed === true);
// };