import { json, type RequestHandler } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

let running = false;
let history: any[] = [];
let messages: { role: string; text: string }[] = [];

export const POST: RequestHandler = async ({ request, url }) => {
  const pathname = url.pathname;

  if (pathname.endsWith('/start')) {
    const prompts = await request.json();
    running = true;
    history = [];
    messages = [];

    (async () => {
      let speaker: 'ai1' | 'ai2' = 'ai1';

      while (running) {
        const prompt = prompts[speaker];
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const chat = model.startChat({ history });
        const lastInput =
          history.length > 0 ? history[history.length - 1].parts[0].text : 'こんにちは！';

        const result = await chat.sendMessage(prompt + '\n\n相手: ' + lastInput);
        const text = result.response.text();

        history.push({ role: 'user', parts: [{ text: lastInput }] });
        history.push({ role: 'model', parts: [{ text }] });

        messages.push({ role: speaker, text });
        speaker = speaker === 'ai1' ? 'ai2' : 'ai1';

        await new Promise((r) => setTimeout(r, 1000));
      }
    })();

    return json({ ok: true });
  }

  if (pathname.endsWith('/stop')) {
    running = false;
    return json({ ok: true });
  }

  if (pathname.endsWith('/log')) {
    return json({ messages });
  }

  return json({ error: 'Invalid endpoint' }, { status: 400 });
};
