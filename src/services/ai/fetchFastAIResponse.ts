export interface FetchFastAIResponseParams {
  prompt: string
  sessionId: string
  signal?: AbortSignal
  webSearchMode?: boolean
}

export class FastAIRequestError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
    this.name = 'FastAIRequestError'
  }
}

export interface FastAIResponsePayload {
  response: string
  summary?: string | null
}

const DEFAULT_BASE_URL = 'http://localhost:8000/ask'

const resolveEndpointSuffix = (baseUrl: string) => {
  const configuredSuffix = process.env.NEXT_PUBLIC_FAST_API_ENDPOINT

  if (configuredSuffix === undefined) {
    return /\/ask$/i.test(baseUrl) ? '' : '/ask'
  }

  if (!configuredSuffix || configuredSuffix === '/') {
    return ''
  }

  return configuredSuffix.startsWith('/') ? configuredSuffix : `/${configuredSuffix}`
}

const buildEndpoint = (sessionId?: string) => {
  const base = (process.env.NEXT_PUBLIC_FAST_API_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, '')
  const suffix = resolveEndpointSuffix(base)
  const endpointRoot = suffix ? `${base}${suffix}` : base
  const sanitized = endpointRoot.replace(/\/+$/, '')

  return sessionId ? `${sanitized}/${sessionId}` : sanitized
}

const parseErrorMessage = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? ''

  try {
    if (contentType.includes('application/json')) {
      const payload = await response.json()

      if (typeof payload === 'string') {
        return payload
      }

      if (Array.isArray(payload?.detail)) {
        const detailMessage = payload.detail
          .map((entry: { msg?: string }) => entry?.msg)
          .filter(Boolean)
          .join(', ')

        if (detailMessage) {
          return detailMessage
        }
      }

      if (typeof payload?.message === 'string') {
        return payload.message
      }
    }

    const fallbackText = await response.text()
    return fallbackText || `FAST API request failed with status ${response.status}`
  } catch (error) {
    console.error('Failed to parse FAST API error response', error)
    return `FAST API request failed with status ${response.status}`
  }
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const extractResponseBody = (payload: unknown): string | null => {
  if (typeof payload === 'string') {
    return payload
  }

  if (Array.isArray(payload)) {
    const stringEntries = payload.filter((entry) => typeof entry === 'string' && entry.trim())
    if (stringEntries.length > 0) {
      return stringEntries.join('\n\n')
    }
    return null
  }

  if (!isPlainObject(payload)) {
    return null
  }

  const candidateKeys = ['response', 'answer', 'message', 'data', 'result', 'content', 'text', 'body']

  for (const key of candidateKeys) {
    const value = payload[key]
    if (typeof value === 'string' && value.trim()) {
      return value
    }

    if (Array.isArray(value)) {
      const stringValues = value.filter((entry) => typeof entry === 'string' && entry.trim())
      if (stringValues.length > 0) {
        return stringValues.join('\n\n')
      }
    }

    if (isPlainObject(value)) {
      const nested = extractResponseBody(value)
      if (typeof nested === 'string' && nested.trim()) {
        return nested
      }
    }
  }

  return null
}

const extractSummary = (payload: unknown): string | null => {
  if (typeof payload === 'string') {
    return null
  }

  if (Array.isArray(payload)) {
    for (const entry of payload) {
      const summary = extractSummary(entry)
      if (summary?.trim()) {
        return summary
      }
    }
    return null
  }

  if (!isPlainObject(payload)) {
    return null
  }

  const summaryKeys = [
    'summary',
    'sessionSummary',
    'session_summary',
    'conversationSummary',
    'conversation_summary',
    'firstResponseSummary',
    'first_response_summary',
  ]

  for (const key of summaryKeys) {
    const value = payload[key]
    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }

  const nestedKeys = ['result', 'data', 'payload', 'metadata', 'response']
  for (const key of nestedKeys) {
    const value = payload[key]
    if (isPlainObject(value) || Array.isArray(value)) {
      const summary = extractSummary(value)
      if (summary?.trim()) {
        return summary
      }
    }
  }

  return null
}

export const fetchFastAIResponse = async ({
  prompt,
  sessionId,
  signal,
  webSearchMode,
}: FetchFastAIResponseParams): Promise<FastAIResponsePayload> => {
  const trimmedPrompt = prompt.trim()
  const trimmedSessionId = sessionId.trim()

  if (!trimmedPrompt) {
    throw new FastAIRequestError('Prompt is required')
  }

  if (!trimmedSessionId) {
    throw new FastAIRequestError('Session id is required')
  }

  const endpoint = buildEndpoint(trimmedSessionId)
  if (process.env.NODE_ENV !== 'production') console.debug('[FAST-API] endpoint =', endpoint);
  const payload: Record<string, unknown> = {
    ask: trimmedPrompt,
    session_id: trimmedSessionId,
  }

  if (typeof webSearchMode === 'boolean') {
    payload.web_search_mode = webSearchMode
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (err: unknown) {
    // Surface common causes like CORS, mixed content (https -> http), DNS, or adblockers.
    const msg = (err as Error)?.message || 'Unknown network error';
    throw new FastAIRequestError(
      `Network request failed: ${msg}. Possible causes: CORS misconfiguration, HTTPS->HTTP mixed content, wrong FAST API URL, server not running, or a blocked request.`,
    );
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response)
    throw new FastAIRequestError(message, response.status)
  }

  const data = await response.json()
  const responseBody = extractResponseBody(data)?.trim()

  if (!responseBody) {
    throw new FastAIRequestError('FAST API response payload missing expected string body', response.status)
  }

  const summary = extractSummary(data)?.trim() ?? null

  return {
    response: responseBody,
    summary,
  }
}
