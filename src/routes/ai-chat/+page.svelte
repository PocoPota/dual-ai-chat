<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  const messages = writable<{ role: 'user' | 'model'; text: string }[]>([]);
  let input = '';
  let loading = false;

  type Character = {
    id: string;
    name: string;
    systemPrompt: string;
  };

  let characters: Character[] = [];
  let selectedCharacter: Character | null = null;

  onMount(async () => {
    const res = await fetch('/characters.json');
    characters = await res.json();
    selectedCharacter = characters[0];
  });

  async function sendMessage() {
    if (!input.trim() || !selectedCharacter) return;
    const userText = input;
    input = '';
    loading = true;
    messages.update(m => [...m, { role: 'user', text: userText }]);

    try {
      const res = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, character: selectedCharacter })
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
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      sendMessage();
    }
  }
</script>

<div class="chat-container">
  <!-- キャラ選択 -->
  <div class="mb-2">
    <p>AIキャラを選んでください:</p>
    <select bind:value={selectedCharacter}>
      {#each characters as char}
        <option value={char}>{char.name}</option>
      {/each}
    </select>
  </div>

  <!-- チャット -->
  <div class="chat-box">
    {#each $messages as msg}
      <div class="message" style="text-align: {msg.role === 'user' ? 'right' : 'left'};">
        <div class="{msg.role}">{msg.text}</div>
      </div>
    {/each}
  </div>

  <!-- 入力 -->
  <div class="input-box">
    <textarea
      bind:value={input}
      on:keydown={handleKeydown}
      placeholder="Type a message..."
    ></textarea>
    <button on:click={sendMessage} disabled={loading}>Send</button>
  </div>
</div>

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
