import { useEffect, useRef } from "react";
import type { DisplayMessage } from "../../shared/chat.js";

interface MessageListProps {
  messages: DisplayMessage[];
  myName: string;
}

export function MessageList({ messages, myName }: MessageListProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={logRef}
      className="flex flex-1 flex-col gap-2 overflow-y-auto p-5"
      aria-live="polite"
    >
      {messages.map((msg, index) => {
        if (msg.type === "system") {
          return (
            <div
              key={`system-${index}`}
              className="my-1 text-center text-xs text-slate-500 italic"
            >
              {msg.text}
              <span className="ml-2 text-slate-600">{msg.time}</span>
            </div>
          );
        }
        const isSelf = msg.name === myName;
        return (
          <div
            key={msg.id}
            className={`flex max-w-[70%] flex-col max-sm:max-w-[90%] ${
              isSelf ? "self-end items-end" : "self-start items-start"
            }`}
          >
            {!isSelf && (
              <div className="mb-1 px-1 text-xs text-slate-400">{msg.name}</div>
            )}
            <div
              className={`px-3.5 py-2.5 text-sm leading-relaxed break-words ${
                isSelf
                  ? "rounded-2xl rounded-br bg-rose-500 text-white"
                  : "rounded-2xl rounded-bl bg-slate-800 text-slate-100"
              }`}
            >
              {msg.text}
            </div>
            <div className="mt-1 px-1 text-[11px] text-slate-600">{msg.time}</div>
          </div>
        );
      })}
    </div>
  );
}
