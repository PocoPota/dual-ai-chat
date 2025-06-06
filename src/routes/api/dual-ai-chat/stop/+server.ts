import { json, type RequestHandler } from '@sveltejs/kit';
import { setRunning } from '$lib/dual-ai-chat/state';

export const POST: RequestHandler = async () => {
  setRunning(false);
  return json({ ok: true });
};
