<script lang="ts">
  import { writable } from 'svelte/store';

  const messages = writable<{ role: string; text: string }[]>([]);
  import { reset } from '$lib/dual-ai-chat/state';
  let running = false;

  let systemPrompts = {
    ai1: 'あなたは親切なアシスタントです。',
    ai2: 'あなたは鋭い評論家です。'
  };

  let apiKey = ''; // 🔑 ユーザー入力のAPIキー
  let intervalId: ReturnType<typeof setInterval>;

  async function startChat() {
    if (!apiKey.trim()) {
      alert('APIキーを入力してください');
      return;
    }
    running = true;
    messages.set([]);
    await fetch('/api/dual-ai-chat/start', {
      method: 'POST',
      body: JSON.stringify({ prompts: systemPrompts, apiKey }),
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
  function resetMessages() {
    messages.set([]);
    reset();
  }
</script>

<h1>Dual AI Chat</h1>

<div>Gemini APIキーを入力：</div>
<input type="password" bind:value={apiKey} class="w-full mb-4" />

<h2>AI1</h2>
<textarea bind:value={systemPrompts.ai1} rows="3"></textarea>

<h2>AI2</h2>
<textarea bind:value={systemPrompts.ai2} rows="3"></textarea>

<div class="my-4">
  <button on:click={startChat} disabled={running}>Start</button>
  <button on:click={stopChat} disabled={!running}>Stop</button>
  <button on:click={resetMessages}>履歴リセット</button>
</div>

<div>
  <h2>Conversation</h2>
  {#each $messages as msg}
    <p><strong>{msg.role}:</strong> {msg.text}</p>
  {/each}
</div>
