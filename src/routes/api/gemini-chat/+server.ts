import type { RequestHandler } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '$env/static/private';

export const POST: RequestHandler = async ({ request }) => {
  const { message, character } = await request.json();

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const chatSession = model.startChat({
    history: [],
    generationConfig: { maxOutputTokens: 10000 }
  });

  const prompt = `${character.systemPrompt}\n\nユーザーの発言: ${message}`;

  const result = await chatSession.sendMessage(prompt);
  const response = await result.response;
  const text = await response.text();

  return new Response(JSON.stringify({ text }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
