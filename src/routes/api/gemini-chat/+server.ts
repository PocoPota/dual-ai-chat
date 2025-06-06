import type { RequestHandler } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '$env/static/private';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

let chatSession = model.startChat({
  history: [],
  generationConfig: {
    maxOutputTokens: 10000
  }
});

export const POST: RequestHandler = async ({ request }) => {
  const { message } = await request.json();
  const result = await chatSession.sendMessage(message);
  const response = await result.response;
  const text = await response.text();

  return new Response(JSON.stringify({ text }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
