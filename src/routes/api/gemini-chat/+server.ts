import type { RequestHandler } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '$env/static/private';

export const POST: RequestHandler = async ({ request }) => {
  const { message, character, history } = await request.json();

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const geminiHistory = history.map((msg: { role: string; text: string }) => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  const chatSession = model.startChat({
    history: geminiHistory,
    generationConfig: { maxOutputTokens: 10000 }
  });

  const result = await chatSession.sendMessage(message);
  const response = await result.response;
  const text = await response.text();

  return new Response(JSON.stringify({ text }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
