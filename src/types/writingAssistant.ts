export interface NoteWritingAssistantMessage {
  id: number;
  prompt: string;
  response: string;
}

export interface NoteWritingAssistantSession {
  sessionId: string;
  firstResponseSummary?: string;
  messages: NoteWritingAssistantMessage[];
  createdAt: string;
  updatedAt: string;
}

export type NoteWritingAssistantSessionsMap = Record<string, NoteWritingAssistantSession>;

export interface NoteWritingAssistantChatHistoryEntry {
  sessionId: string;
  firstResponseSummary?: string;
  messages: NoteWritingAssistantMessage[];
  createdAt: string;
  updatedAt: string;
}

export type NoteWritingAssistantChatHistoryMap = Record<string, NoteWritingAssistantChatHistoryEntry>;

export type NoteWritingAssistantMessageRecord = Record<string, NoteWritingAssistantMessage>;
