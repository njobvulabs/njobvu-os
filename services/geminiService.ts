
/**
 * Njobvu AI Service
 * Connects to the Cloudflare Functions backend (/api/search)
 * instead of calling Google directly to protect the API key.
 */

export interface Part {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface GeminiOptions {
  model?: string;
  config?: {
    thinkingConfig?: { thinkingBudget: number };
    tools?: any[];
    systemInstruction?: string;
  };
}

export const streamGeminiResponse = async (
  contents: string | Part[],
  onChunk: (text: string) => void,
  options?: GeminiOptions
) => {
  try {
    // If contents is a simple string, wrap it in the structure the new API expects, 
    // or send as string if backend handles it (our backend now handles 'contents' prop directly)
    
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        contents: typeof contents === 'string' ? [{ role: 'user', parts: [{ text: contents }] }] : [{ role: 'user', parts: contents }],
        model: options?.model,
        config: options?.config
      }),
    });

    if (!response.ok) {
      // Try to parse JSON error, otherwise treat as text (e.g. 404 HTML page)
      let errorMessage = `Server Error: ${response.status}`;
      try {
        const errorData = await response.json();
        if ((errorData as any).error) errorMessage = (errorData as any).error;
      } catch (e) {
        const text = await response.text();
        console.error("Non-JSON Error Response:", text);
      }
      
      onChunk(`\n[System Error: ${errorMessage}]`);
      return;
    }

    if (!response.body) {
      onChunk('\n[System Error: No response body received]');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        onChunk(chunk);
      }
    }

  } catch (error: any) {
    console.error("AI Service Error:", error);
    onChunk(`\n[Network Error: ${error.message || 'Unable to reach Njobvu AI services'}. Ensure you have set GOOGLE_API_KEY in Cloudflare Pages settings.]`);
  }
};
