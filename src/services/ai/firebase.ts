import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'

import { db } from '@/constants/firebase'
import type {
  SaveAIMessageParams,
  SessionDocument,
  SessionHistoryEntryDoc,
  StoredAIMessage,
} from '@/types/firebase'

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
  const sessionDocRef = doc(messagesRef, sessionId)
  const now = Date.now()
  const entryId = `${now}-${Math.random().toString(36).slice(2, 8)}`
  const entry = {
    id: entryId,
    prompt: trimmedPrompt,
    response: trimmedResponse,
    createdAt: now,
  }

  const existingSession = await getDoc(sessionDocRef)

  if (existingSession.exists()) {
    await updateDoc(sessionDocRef, {
      updatedAt: now,
      history: arrayUnion(entry),
    })
  } else {
    await setDoc(sessionDocRef, {
      sessionId,
      createdAt: now,
      updatedAt: now,
      history: [entry],
    })
  }
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
  const sessionDocRef = doc(messagesRef, sessionId)
  const sessionDoc = await getDoc(sessionDocRef)

  if (sessionDoc.exists()) {
    const data = sessionDoc.data() as SessionDocument
    const entries = Array.isArray(data.history) ? data.history : []

    return entries
      .map((entry, index) => {
        const createdAtTime = typeof entry.createdAt === 'number' ? entry.createdAt : 0

        return {
          id: entry.id ?? `${sessionId}-${index}`,
          prompt: entry.prompt ?? '',
          response: entry.response ?? '',
          sessionId,
          createdAt: createdAtTime ? new Date(createdAtTime) : null,
        }
      })
      .sort((a, b) => {
        const aTime = a.createdAt?.getTime() ?? 0
        const bTime = b.createdAt?.getTime() ?? 0
        return aTime - bTime
      })
  }

  // Fallback to legacy structure
  const messagesQuery = query(messagesRef, where('sessionId', '==', sessionId))
  const snapshot = await getDocs(messagesQuery)

  return snapshot.docs
    .map((messageDoc) => {
      const data = messageDoc.data() as Partial<SaveAIMessageParams> & { createdAt?: { toDate?: () => Date } }

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

export const deleteAISession = async ({
  userId,
  sessionId,
}: {
  userId: string
  sessionId: string
}): Promise<void> => {
  if (!userId || !sessionId) {
    return
  }

  const userDocRef = doc(db, 'ask', userId)
  const messagesRef = collection(userDocRef, 'messages')
  const sessionDocRef = doc(messagesRef, sessionId)

  await deleteDoc(sessionDocRef)

  const legacyQuery = query(messagesRef, where('sessionId', '==', sessionId))
  const legacySnapshot = await getDocs(legacyQuery)

  if (!legacySnapshot.empty) {
    await Promise.all(legacySnapshot.docs.map((messageDoc) => deleteDoc(messageDoc.ref)))
  }
}

export const getAISessionIds = async ({
  userId,
}: {
  userId: string
}): Promise<string[]> => {
  if (!userId) {
    return []
  }

  const userDocRef = doc(db, 'ask', userId)
  const messagesRef = collection(userDocRef, 'messages')
  const snapshot = await getDocs(messagesRef)

  const newStructureSessions: Array<{ sessionId: string; updatedAt: number }> = []
  const legacySessions = new Map<string, number>()

  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data()

    if (Array.isArray((data as SessionDocument).history)) {
      const sessionData = data as SessionDocument
      const updatedAt = typeof sessionData.updatedAt === 'number' ? sessionData.updatedAt : 0
      if (docSnap.id) {
        newStructureSessions.push({ sessionId: docSnap.id, updatedAt })
      }
      return
    }

    const legacyData = data as Partial<SaveAIMessageParams> & {
      createdAt?: { toDate?: () => Date }
      sessionId?: string
    }

    const sessionId = legacyData.sessionId?.trim()
    if (!sessionId) {
      return
    }

    const createdAt = legacyData.createdAt?.toDate?.()?.getTime() ?? 0
    const existing = legacySessions.get(sessionId) ?? 0
    if (createdAt > existing) {
      legacySessions.set(sessionId, createdAt)
    }
  })

  if (newStructureSessions.length > 0) {
    return newStructureSessions
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map(({ sessionId }) => sessionId)
  }

  if (legacySessions.size > 0) {
    return Array.from(legacySessions.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([sessionId]) => sessionId)
  }

  return []
}

export const deleteChatHistory = async (
  userId: string,
  sessionId: string
): Promise<void> => {
  if (!userId || !sessionId) {
    return
  }

  try {
    // 'ask' collection - 'userEmail' document - 'messages' collection - 'session Id' document
    const userDocRef = doc(db, 'ask', userId, 'messages', sessionId)
  
    // delete the chat history in the 'history' field
    await updateDoc(userDocRef, {
      history: [],
    })
  } catch {
    throw Error('Failed to delete chat history')
  }
}
