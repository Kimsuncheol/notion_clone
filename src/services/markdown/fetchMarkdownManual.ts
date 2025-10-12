export class MarkdownManualError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'MarkdownManualError';
  }
}

const MARKDOWN_MANUAL_URL = 'http://127.0.0.1:8000/markdown/manual';

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
    return fallbackText || `Markdown manual request failed with status ${response.status}`;
  } catch (error) {
    console.error('Failed to parse markdown manual error response', error);
    return `Markdown manual request failed with status ${response.status}`;
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

export const fetchMarkdownManual = async (question: string, sessionId: string): Promise<string> => {
  const trimmedQuestion = question.trim();
  const trimmedSessionId = sessionId.trim();

  if (!trimmedQuestion) {
    throw new MarkdownManualError('Question is required');
  }

  if (!trimmedSessionId) {
    throw new MarkdownManualError('Session ID is required');
  }

  const response = await fetch(MARKDOWN_MANUAL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: trimmedQuestion,
      session_id: trimmedSessionId
    }),
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new MarkdownManualError(message, response.status);
  }

  const data = await response.json();
  const responseBody = extractResponseBody(data)?.trim();

  if (!responseBody) {
    throw new MarkdownManualError('Markdown manual response payload missing expected string body', response.status);
  }

  return responseBody;
};
