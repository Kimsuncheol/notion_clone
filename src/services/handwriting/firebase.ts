import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  DocumentSnapshot,
  getDoc,
  getDocs,
  getFirestore,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { firebaseApp } from '@/constants/firebase';
import {
  CreateHandwritingPayload,
  HandwritingCanvasData,
  HandwritingDoc,
  HandwritingEntry,
  UpdateHandwritingPayload,
} from '@/types/handwriting';

const db = getFirestore(firebaseApp);
const COLLECTION_NAME = 'handwritings';

const handwritingsCollection = collection(db, COLLECTION_NAME);

const convertTimestampToDate = (value: unknown): Date => {
  if (!value) {
    return new Date();
  }

  if (value instanceof Date) {
    return value;
  }

  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (typeof value === 'number') {
    return new Date(value);
  }

  return new Date();
};

const mapSnapshotToHandwriting = (
  snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>,
): HandwritingEntry => {
  const data = snapshot.data() as Partial<HandwritingDoc> | undefined;

  const createdAt = data?.createdAt ? convertTimestampToDate(data.createdAt) : new Date();
  const updatedAt = data?.updatedAt ? convertTimestampToDate(data.updatedAt) : createdAt;

  const rawCanvases = Array.isArray(data?.canvases) ? data.canvases : [];
  const canvases: HandwritingCanvasData[] = rawCanvases.length
    ? rawCanvases.map((item) => (typeof item === 'string' ? item : null))
    : [];

  if (canvases.length === 0) {
    const fallback = typeof data?.imageData === 'string' || data?.imageData === null ? data.imageData : null;
    canvases.push(fallback ?? null);
  }

  return {
    id: snapshot.id,
    userId: data?.userId ?? '',
    title: data?.title ?? 'Untitled canvas',
    canvases: canvases.length > 0 ? canvases : [null],
    createdAt,
    updatedAt,
  };
};

export const fetchHandwritingsForUser = async (userId: string): Promise<HandwritingEntry[]> => {
  const q = query(handwritingsCollection, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map(mapSnapshotToHandwriting)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
};

export const fetchHandwritingById = async (handwritingId: string): Promise<HandwritingEntry | null> => {
  const handwritingRef = doc(db, COLLECTION_NAME, handwritingId);
  const snapshot = await getDoc(handwritingRef);

  if (!snapshot.exists()) {
    return null;
  }

  return mapSnapshotToHandwriting(snapshot);
};

export const createHandwriting = async (payload: CreateHandwritingPayload): Promise<HandwritingEntry> => {
  const now = serverTimestamp();
  const { userId, title, canvases } = payload;
  const normalizedCanvases = canvases && canvases.length > 0 ? canvases : [null];

  const docRef = await addDoc(handwritingsCollection, {
    userId,
    title,
    canvases: normalizedCanvases,
    imageData: normalizedCanvases[0] ?? null,
    createdAt: now,
    updatedAt: now,
  });

  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return {
      id: docRef.id,
      userId,
      title,
      canvases: normalizedCanvases,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return mapSnapshotToHandwriting(snapshot);
};

export const updateHandwriting = async (
  handwritingId: string,
  payload: UpdateHandwritingPayload,
): Promise<HandwritingEntry | null> => {
  const handwritingRef = doc(db, COLLECTION_NAME, handwritingId);

  const updatePayload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (Object.prototype.hasOwnProperty.call(payload, 'title')) {
    updatePayload.title = payload.title;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'canvases')) {
    const canvases = payload.canvases ?? [null];
    updatePayload.canvases = canvases;
    updatePayload.imageData = canvases[0] ?? null;
  }

  await updateDoc(handwritingRef, updatePayload);

  const snapshot = await getDoc(handwritingRef);
  if (!snapshot.exists()) {
    return null;
  }

  return mapSnapshotToHandwriting(snapshot);
};

export const deleteHandwriting = async (handwritingId: string): Promise<void> => {
  const handwritingRef = doc(db, COLLECTION_NAME, handwritingId);
  await deleteDoc(handwritingRef);
};
