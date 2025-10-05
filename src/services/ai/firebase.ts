import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'

import { db } from '@/constants/firebase'

export interface SaveAIMessageParams {
  userId: string
  sessionId: string
  prompt: string
  response: string
}

export interface StoredAIMessage {
  id: string
  prompt: string
  response: string
  sessionId: string
  createdAt: Date | null
}

const ensureUserSessionDocument = async (userId: string) => {
  const userDocRef = doc(db, 'ask', userId)
  await setDoc(userDocRef, { updatedAt: serverTimestamp() }, { merge: true })
  return userDocRef
}

export const saveAIMessage = async ({ userId, sessionId, prompt, response }: SaveAIMessageParams) => {
  const trimmedPrompt = prompt.trim()
  const trimmedResponse = response.trim()

  if (!userId || !sessionId || !trimmedPrompt) {
    return
  }

  const userDocRef = await ensureUserSessionDocument(userId)
  const messagesRef = collection(userDocRef, 'messages')

  await addDoc(messagesRef, {
    sessionId,
    prompt: trimmedPrompt,
    response: trimmedResponse,
    createdAt: serverTimestamp(),
  })
}

export const getAISessionMessages = async ({
  userId,
  sessionId,
}: {
  userId: string
  sessionId: string
}): Promise<StoredAIMessage[]> => {
  if (!userId || !sessionId) {
    return []
  }

  const userDocRef = doc(db, 'ask', userId)
  const messagesRef = collection(userDocRef, 'messages')
  const messagesQuery = query(messagesRef, where('sessionId', '==', sessionId))

  const snapshot = await getDocs(messagesQuery)

  return snapshot.docs
    .map((messageDoc) => {
      const data = messageDoc.data() as Partial<SaveAIMessageParams> & {
        createdAt?: { toDate?: () => Date }
      }

      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null

      return {
        id: messageDoc.id,
        prompt: data.prompt ?? '',
        response: data.response ?? '',
        sessionId: data.sessionId ?? '',
        createdAt,
      }
    })
    .sort((a, b) => {
      const aTime = a.createdAt?.getTime() ?? 0
      const bTime = b.createdAt?.getTime() ?? 0
      return aTime - bTime
    })
}

