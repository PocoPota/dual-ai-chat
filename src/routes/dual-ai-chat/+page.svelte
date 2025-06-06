<script lang="ts">
  import { writable } from 'svelte/store';

  const messages = writable<{ role: string; text: string }[]>([]);
  let running = false;

  let systemPrompts = {
    ai1: 'あなたは親切なアシスタントです。',
    ai2: 'あなたは鋭い評論家です。'
  };

  let intervalId: ReturnType<typeof setInterval>;

  async function startChat() {
    running = true;
    messages.set([]);
    await fetch('/api/dual-ai-chat/start', {
      method: 'POST',
      body: JSON.stringify(systemPrompts),
      headers: { 'Content-Type': 'application/json' }
    });

    intervalId = setInterval(fetchUpdates, 1500);
  }

  async function stopChat() {
    running = false;
    clearInterval(intervalId);
    await fetch('/api/dual-ai-chat/stop', { method: 'POST' });
  }

  async function fetchUpdates() {
    const res = await fetch('/api/dual-ai-chat/log');
    const json = await res.json();
    messages.set(json.messages);
  }
</script>

<h1>Dual AI Chat</h1>

<div>
  <h2>AI1 System Prompt</h2>
  <textarea bind:value={systemPrompts.ai1} rows="4" class="w-full"></textarea>

  <h2>AI2 System Prompt</h2>
  <textarea bind:value={systemPrompts.ai2} rows="4" class="w-full"></textarea>

  <div class="my-4">
    <button on:click={startChat} disabled={running} class="mr-2">Start</button>
    <button on:click={stopChat} disabled={!running}>Stop</button>
  </div>

  <div>
    <h2>Conversation</h2>
    {#each $messages as msg}
      <p><strong>{msg.role}:</strong> {msg.text}</p>
    {/each}
  </div>
</div>
