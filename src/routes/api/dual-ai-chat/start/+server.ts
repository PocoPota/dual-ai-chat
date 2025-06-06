import { json, type RequestHandler } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  setRunning,
  getRunning,
  reset,
  pushToMessages,
  pushToHistory,
  getHistory
} from '$lib/dual-ai-chat/state';

export const POST: RequestHandler = async ({ request }) => {
  const { prompts, apiKey } = await request.json();

  if (typeof apiKey !== 'string' || apiKey.length < 10) {
    return json({ error: 'APIキーが無効です' }, { status: 400 });
  }

  reset();
  setRunning(true);

  const genAI = new GoogleGenerativeAI(apiKey); // ← ユーザーのキーを使用

  (async () => {
    let speaker: 'ai1' | 'ai2' = 'ai1';

    while (getRunning()) {
      const prompt = prompts[speaker];
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const chat = model.startChat({ history: getHistory() });
      const lastInput =
        getHistory().length > 0
          ? getHistory()[getHistory().length - 1].parts[0].text
          : 'こんにちは！';

      const result = await chat.sendMessage(prompt + '\n\n相手: ' + lastInput);
      const text = result.response.text();

      pushToHistory({ role: 'user', parts: [{ text: lastInput }] });
      pushToHistory({ role: 'model', parts: [{ text }] });
      pushToMessages({ role: speaker, text });

      speaker = speaker === 'ai1' ? 'ai2' : 'ai1';
      await new Promise((r) => setTimeout(r, 1000));
    }
  })();

  return json({ ok: true });
};
