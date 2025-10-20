export type HandwritingCanvasData = string | null;

export interface HandwritingEntry {
  id: string;
  userId: string;
  title: string;
  canvases: HandwritingCanvasData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HandwritingDoc {
  userId: string;
  title: string;
  canvases: HandwritingCanvasData[];
  createdAt: Date;
  updatedAt: Date;
  imageData?: string | null;
}

export interface CreateHandwritingPayload {
  userId: string;
  title: string;
  canvases: HandwritingCanvasData[];
}

export interface UpdateHandwritingPayload {
  title?: string;
  canvases?: HandwritingCanvasData[];
}
