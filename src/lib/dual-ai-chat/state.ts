let _running = false;
let _history: any[] = [];
let _messages: { role: string; text: string }[] = [];

export function getRunning() {
  return _running;
}
export function setRunning(val: boolean) {
  _running = val;
}

export function getHistory() {
  return _history;
}
export function getMessages() {
  return _messages;
}

export function pushToHistory(entry: any) {
  _history.push(entry);
}
export function pushToMessages(entry: { role: string; text: string }) {
  _messages.push(entry);
}

export function reset() {
  _running = false;
  _history = [];
  _messages = [];
}
