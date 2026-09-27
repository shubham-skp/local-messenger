import { useState } from "react";
import type { FormEvent } from "react";
import { TEXT_MAX_LENGTH } from "../../shared/chat.js";

interface ChatInputProps {
  connected: boolean;
  onSend: (text: string) => void;
}

export function ChatInput({ connected, onSend }: ChatInputProps) {
  const [text, setText] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <form
      onSubmit={submit}
      className="flex gap-2.5 border-t border-slate-900 bg-slate-800 p-4"
    >
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={connected ? "Type a message..." : "Connecting..."}
        maxLength={TEXT_MAX_LENGTH}
        disabled={!connected}
        aria-label="Message input"
        className="flex-1 rounded-full bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={!connected || !text.trim()}
        className="cursor-pointer rounded-full bg-rose-500 px-5 py-3 text-sm text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}
