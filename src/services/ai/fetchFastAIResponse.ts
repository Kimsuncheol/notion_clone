export interface FetchFastAIResponseParams {
  prompt: string
  sessionId: string
  signal?: AbortSignal
}

export class FastAIRequestError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
    this.name = 'FastAIRequestError'
  }
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

export const fetchFastAIResponse = async ({
  prompt,
  sessionId,
  signal,
}: FetchFastAIResponseParams): Promise<string> => {
  const trimmedPrompt = prompt.trim()
  const trimmedSessionId = sessionId.trim()

  if (!trimmedPrompt) {
    throw new FastAIRequestError('Prompt is required')
  }

  if (!trimmedSessionId) {
    throw new FastAIRequestError('Session id is required')
  }

  const endpoint = buildEndpoint(trimmedSessionId)
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ask: trimmedPrompt, session_id: trimmedSessionId }),
    signal,
  })

  if (!response.ok) {
    const message = await parseErrorMessage(response)
    throw new FastAIRequestError(message, response.status)
  }

  const data = await response.json()

  if (typeof data !== 'string') {
    throw new FastAIRequestError('FAST API response payload missing expected string body', response.status)
  }

  return data
}
