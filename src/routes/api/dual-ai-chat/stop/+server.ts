import { json, type RequestHandler } from '@sveltejs/kit';
import { setRunning, reset } from '$lib/dual-ai-chat/state'; // resetをインポート

export const POST: RequestHandler = async () => {
  setRunning(false);
  reset();
  return json({ ok: true });
};
