<script lang="ts">
  import { writable } from 'svelte/store';

  // チャット履歴のストア
  const messages = writable<{ role: 'user' | 'model'; text: string }[]>([]);
  let input = '';
  let loading = false;

  // メッセージ送信処理
  async function sendMessage() {
    if (!input.trim()) return;
    const userText = input;
    input = '';
    loading = true;

    // ユーザーのメッセージを追加
    messages.update(m => [...m, { role: 'user', text: userText }]);

    try {
      const res = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });

      const { text } = await res.json();
      messages.update(m => [...m, { role: 'model', text }]);
    } catch (err) {
      messages.update(m => [...m, { role: 'model', text: '⚠️ Error: API通信に失敗しました。' }]);
    } finally {
      loading = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }
</script>

<style lang="scss">
  .chat-box{
    background: rgb(105, 192, 243);
    padding: 10px;
    .user, .model{
      max-width: 350px;
      display: inline-block;
      border-radius: 7px;
      padding: 10px;
    }
    .user{
      margin: 0 0 0 auto;
      background: rgb(147, 255, 147);
    }
    .model{
      margin: 10px auto 10px 0;
      background: rgb(255, 244, 224);
    }
  }
</style>

<div class="chat-container">
  <div class="chat-box">
    {#each $messages as msg}
      <div class="message" style="text-align: {msg.role === 'user' ? 'right' : 'left'};">
        <div class="{msg.role}">{msg.text}</div>
      </div>
    {/each}
  </div>

  <div class="input-box">
    <textarea
      bind:value={input}
      placeholder="Type a message..."
    ></textarea>
    <button on:click={sendMessage} disabled={loading}>Send</button>
  </div>
</div>