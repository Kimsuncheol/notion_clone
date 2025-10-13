export class WritingAssistantError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'WritingAssistantError';
  }
}

const WRITING_ASSISTANT_BASE_URL = 'http://127.0.0.1:8000/writing';

const parseErrorMessage = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('application/json')) {
      const payload = await response.json();

      if (typeof payload === 'string') {
        return payload;
      }

      if (Array.isArray(payload?.detail)) {
        const detailMessage = payload.detail
          .map((entry: { msg?: string }) => entry?.msg)
          .filter(Boolean)
          .join(', ');

        if (detailMessage) {
          return detailMessage;
        }
      }

      if (typeof payload?.message === 'string') {
        return payload.message;
      }
    }

    const fallbackText = await response.text();
    return fallbackText || `Writing assistant request failed with status ${response.status}`;
  } catch (error) {
    console.error('Failed to parse writing assistant error response', error);
    return `Writing assistant request failed with status ${response.status}`;
  }
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const extractResponseBody = (payload: unknown): string | null => {
  if (typeof payload === 'string') {
    return payload;
  }

  if (Array.isArray(payload)) {
    const stringEntries = payload.filter((entry) => typeof entry === 'string' && entry.trim());
    if (stringEntries.length > 0) {
      return stringEntries.join('\n\n');
    }
    return null;
  }

  if (!isPlainObject(payload)) {
    return null;
  }

  const candidateKeys = ['response', 'answer', 'message', 'data', 'result', 'content', 'text', 'body'];

  for (const key of candidateKeys) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }

    if (Array.isArray(value)) {
      const stringValues = value.filter((entry) => typeof entry === 'string' && entry.trim());
      if (stringValues.length > 0) {
        return stringValues.join('\n\n');
      }
    }

    if (isPlainObject(value)) {
      const nested = extractResponseBody(value);
      if (typeof nested === 'string' && nested.trim()) {
        return nested;
      }
    }
  }

  return null;
};

export interface WritingAssistantResponsePayload {
  answer: string;
  firstResponseSummary?: string;
}

export const fetchWritingAssistant = async (
  question: string,
  noteId: string,
  content: string,
  sessionId: string
): Promise<WritingAssistantResponsePayload> => {
  const trimmedQuestion = question.trim();
  const trimmedNoteId = noteId.trim();
  const resolvedContent = typeof content === 'string' ? content : '';
  const trimmedSessionId = sessionId.trim();

  if (!trimmedQuestion) {
    throw new WritingAssistantError('Question is required');
  }

  if (!trimmedNoteId) {
    throw new WritingAssistantError('Note ID is required');
  }

  if (!trimmedSessionId) {
    throw new WritingAssistantError('Session ID is required');
  }

  const response = await fetch(`${WRITING_ASSISTANT_BASE_URL}/${trimmedNoteId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      request: trimmedQuestion,
      note_id: trimmedNoteId,
      content: resolvedContent,
      session_id: trimmedSessionId,
    }),
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new WritingAssistantError(message, response.status);
  }

  const rawBody = await response.text();
  let parsedBody: unknown = rawBody;

  if (rawBody) {
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      parsedBody = rawBody;
    }
  }

  const responseBody = extractResponseBody(parsedBody)?.trim();

  if (!responseBody) {
    throw new WritingAssistantError('Writing assistant response payload missing expected string body', response.status);
  }

  let firstResponseSummary: string | undefined;
  if (isPlainObject(parsedBody)) {
    const summaryCandidate = parsedBody.first_response_summary ?? parsedBody.firstResponseSummary;
    if (typeof summaryCandidate === 'string' && summaryCandidate.trim()) {
      firstResponseSummary = summaryCandidate.trim();
    }
  }

  return {
    answer: responseBody,
    firstResponseSummary,
  };
};
