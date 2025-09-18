export interface FastAIResponse {
  random_string: string;
  complete_sign_in: boolean;
}

const DEFAULT_ENDPOINT = '/';

const buildEndpoint = () => {
  const base = process.env.NEXT_PUBLIC_FAST_API_URL ?? 'http://localhost:8000';
  const path = process.env.NEXT_PUBLIC_FAST_API_ENDPOINT ?? DEFAULT_ENDPOINT;

  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
};

export const fetchFastAIResponse = async (prompt: string): Promise<FastAIResponse> => {
  const endpoint = buildEndpoint();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error(`FAST API request failed with status ${response.status}`);
  }

  const data = (await response.json()) as FastAIResponse;

  if (typeof data.random_string !== 'string' || typeof data.complete_sign_in !== 'boolean') {
    throw new Error('FAST API response payload missing expected fields');
  }

  return data;
};
