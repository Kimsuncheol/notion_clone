import toast from 'react-hot-toast';

// Improved error handling interface based on API documentation
interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

interface APIError {
  detail: ValidationError[] | string;
}

// Enhanced generateText function with better error handling and user feedback
export const generateText = async (model: string, prompt: string, onProgress?: (isGenerating: boolean) => void): Promise<string | null> => {
  // Input validation
  if (!prompt || typeof prompt !== 'string') {
    toast.error('Please enter a valid prompt');
    return null;
  }

  const trimmedPrompt = prompt.trim();
  if (trimmedPrompt.length === 0) {
    toast.error('Please enter a prompt to generate text');
    return null;
  }

  if (trimmedPrompt.length > 5000) {
    toast.error('Prompt is too long. Please keep it under 5000 characters.');
    return null;
  }

  // Set loading state
  onProgress?.(true);

  // Create a loading toast
  const loadingToast = toast.loading('Generating text...', {
    duration: 5000, // 5 seconds timeout
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 600000); // 600 second timeout

    const response = await fetch('http://127.0.0.1:8000/build', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ model: model, prompt: trimmedPrompt }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = 'Failed to generate text';

      try {
        const errorData: APIError = await response.json();

        if (response.status === 422) {
          // Handle validation errors
          if (Array.isArray(errorData.detail)) {
            const validationErrors = errorData.detail.map(err => err.msg).join(', ');
            errorMessage = `Validation error: ${validationErrors}`;
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          }
        } else if (response.status === 400) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : 'Invalid request';
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded. Please wait before making another request.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      console.error('Error from text generation API:', errorMessage);
      toast.error(errorMessage, { id: loadingToast });
      return null;
    }

    const result = await response.text();

    // Validate response
    if (!result || typeof result !== 'string') {
      toast.error('Invalid response from text generation service', { id: loadingToast });
      return null;
    }

    if (result.trim().length === 0) {
      toast.error('Generated text is empty. Please try a different prompt.', { id: loadingToast });
      return null;
    }

    toast.success('Text generated successfully!', { id: loadingToast });
    return result;

  } catch (error) {
    console.error('Failed to communicate with text generation API', error);

    let errorMessage = 'Failed to connect to the text generation service.';

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
    }

    toast.error(errorMessage, { id: loadingToast });
    return null;
  } finally {
    onProgress?.(false);
  }
};

// Function to parse key-value pairs from generated text
export const parseKeyValueString = (generatedText: string): { [key: string]: string } => {
  const result: { [key: string]: string } = {};

  // Try different parsing strategies based on common formats

  // Strategy 1: Try newline + colon format (key: value)
  if (generatedText.includes('\n') && generatedText.includes(':')) {
    const lines = generatedText.split('\n');
    lines.forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        if (key && value) {
          result[key] = value;
        }
      }
    });
    if (Object.keys(result).length > 0) return result;
  }

  // Strategy 2: Try comma + colon format (key1:value1,key2:value2)
  if (generatedText.includes(',') && generatedText.includes(':')) {
    const pairs = generatedText.split(',');
    pairs.forEach(pair => {
      const [key, value] = pair.split(':');
      if (key && value) {
        result[key.trim()] = value.trim();
      }
    });
    if (Object.keys(result).length > 0) return result;
  }

  // Strategy 3: Try newline + equals format (key=value)
  if (generatedText.includes('\n') && generatedText.includes('=')) {
    const lines = generatedText.split('\n');
    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        result[key.trim()] = value.trim();
      }
    });
    if (Object.keys(result).length > 0) return result;
  }

  // Strategy 4: Try JSON format
  try {
    const jsonResult = JSON.parse(generatedText);
    if (typeof jsonResult === 'object' && jsonResult !== null) {
      return jsonResult;
    }
  } catch {
    // Not JSON, continue with other strategies
  }

  // If no parsing strategy worked, return the original text as a single value
  return { content: generatedText };
}; 