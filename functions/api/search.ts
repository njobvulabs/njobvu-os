
import { GoogleGenAI } from "@google/genai";

interface Env {
  GOOGLE_API_KEY: string;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const apiKey = context.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Configuration Error: GOOGLE_API_KEY not set in Cloudflare." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    let reqBody: { contents: any; model?: string; config?: any };
    try {
       reqBody = await context.request.json() as { contents: any; model?: string; config?: any };
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Default to Flash if not specified
    const { contents, model = 'gemini-2.5-flash', config } = reqBody;

    if (!contents) {
      return new Response(JSON.stringify({ error: "Missing contents in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Initialize GoogleGenAI with the API key from Env
    const ai = new GoogleGenAI({ apiKey });

    // Generate content stream using the SDK
    // contents can be a string (prompt) or an array of parts (multimodal)
    const response = await ai.models.generateContentStream({
      model: model,
      contents: contents, 
      config: config
    });

    // Create a TransformStream to stream the text chunks back to the client
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Process the stream in the background
    (async () => {
      try {
        for await (const chunk of response) {
          const text = chunk.text;
          if (text) {
            await writer.write(encoder.encode(text));
          }
        }
      } catch (err: any) {
        console.error("Stream processing error:", err);
        await writer.write(encoder.encode(`\n[System Error: ${err.message}]`));
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "Unknown Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
