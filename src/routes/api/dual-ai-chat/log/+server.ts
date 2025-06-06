import { json, type RequestHandler } from '@sveltejs/kit';
import { getMessages } from '$lib/dual-ai-chat/state';

export const GET: RequestHandler = async () => {
  return json({ messages: getMessages() });
};
