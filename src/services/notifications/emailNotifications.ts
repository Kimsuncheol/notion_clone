export class EmailNotificationError extends Error {
  public readonly status?: number;
  public readonly originalError?: unknown;

  constructor(message: string, status?: number, originalError?: unknown) {
    super(message);
    this.name = 'EmailNotificationError';
    this.status = status;
    this.originalError = originalError;
  }
}

export type EmailNotificationSuccessResponse = Record<string, unknown> | string | undefined;

const DEFAULT_COMMENT_ENDPOINT = 'http://127.0.0.1:8000/notifications/comment';
const DEFAULT_LIKE_ENDPOINT = 'http://127.0.0.1:8000/notifications/like';

const normalizeEndpoint = (candidate: string | undefined, fallback: string) => {
  if (!candidate) {
    return fallback;
  }

  const trimmed = candidate.trim();
  return trimmed || fallback;
};

const COMMENT_NOTIFICATION_ENDPOINT = normalizeEndpoint(
  process.env.NEXT_PUBLIC_COMMENT_NOTIFICATION_URL,
  DEFAULT_COMMENT_ENDPOINT
);

const LIKE_NOTIFICATION_ENDPOINT = normalizeEndpoint(
  process.env.NEXT_PUBLIC_LIKE_NOTIFICATION_URL,
  DEFAULT_LIKE_ENDPOINT
);

const extractErrorMessage = (payload: unknown): string | null => {
  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    return trimmed || null;
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const detail = record.detail;

  if (typeof detail === 'string' && detail.trim()) {
    return detail.trim();
  }

  if (Array.isArray(detail)) {
    const joined = detail
      .map((entry) => {
        if (typeof entry === 'string') {
          return entry.trim();
        }

        if (entry && typeof entry === 'object' && typeof (entry as Record<string, unknown>).msg === 'string') {
          return ((entry as Record<string, unknown>).msg as string).trim();
        }

        return '';
      })
      .filter(Boolean)
      .join(', ');

    if (joined.trim()) {
      return joined.trim();
    }
  }

  const message = record.message;
  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }

  return null;
};

const parseErrorMessage = async (response: Response) => {
  const fallback = `Notification request failed with status ${response.status}`;
  const contentType = response.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('application/json')) {
      const payload = await response.json();
      const parsed = extractErrorMessage(payload);
      return parsed ?? fallback;
    }

    const text = (await response.text()).trim();
    return text || fallback;
  } catch (error) {
    console.error('Failed to parse notification error response', error);
    return fallback;
  }
};

const parseSuccessBody = async (response: Response): Promise<EmailNotificationSuccessResponse> => {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (error) {
      console.warn('Failed to parse notification success payload as JSON', error);
      return undefined;
    }
  }

  try {
    const text = (await response.text()).trim();
    return text || undefined;
  } catch (error) {
    console.warn('Failed to read notification success payload as text', error);
    return undefined;
  }
};

const triggerEmailNotification = async (endpoint: string, signal?: AbortSignal): Promise<EmailNotificationSuccessResponse> => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      const message = await parseErrorMessage(response);
      throw new EmailNotificationError(message, response.status);
    }

    return await parseSuccessBody(response);
  } catch (error) {
    if (error instanceof EmailNotificationError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new EmailNotificationError('Notification request aborted', undefined, error);
    }

    console.error('Failed to trigger email notification', error);
    throw new EmailNotificationError('Failed to reach notification service', undefined, error);
  }
};

export const sendCommentEmailNotification = (signal?: AbortSignal) =>
  triggerEmailNotification(COMMENT_NOTIFICATION_ENDPOINT, signal);

export const sendLikeEmailNotification = (signal?: AbortSignal) =>
  triggerEmailNotification(LIKE_NOTIFICATION_ENDPOINT, signal);
