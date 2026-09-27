import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ChatMessage,
  DisplayMessage,
  SystemMessage,
} from "../../shared/chat.js";
import { NAME_MAX_LENGTH, TEXT_MAX_LENGTH } from "../../shared/chat.js";
import type { ChatSocket } from "../lib/socket.js";
import { createChatSocket } from "../lib/socket.js";

export interface UseChat {
  myId: string;
  myName: string;
  messages: DisplayMessage[];
  connected: boolean;
  send: (text: string) => void;
  rename: (name: string) => void;
}

export function useChat(): UseChat {
  const [myId, setMyId] = useState("");
  const [myName, setMyName] = useState("");
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<ChatSocket | null>(null);

  useEffect(() => {
    const socket = createChatSocket();
    socketRef.current = socket;

    const handleInit = (payload: { id: string; name: string; history: DisplayMessage[] }) => {
      setMyId(payload.id);
      setMyName(payload.name);
      setMessages(payload.history);
    };
    const handleChat = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };
    const handleSystem = (msg: SystemMessage) => {
      setMessages((prev) => [...prev, msg]);
    };
    const handleRenamed = (payload: { id: string; name: string }) => {
      if (payload.id === socket.id) {
        setMyName(payload.name);
      }
    };
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socket.on("init", handleInit);
    socket.on("chat:message", handleChat);
    socket.on("system", handleSystem);
    socket.on("user:renamed", handleRenamed);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    socket.connect();

    return () => {
      socket.off("init", handleInit);
      socket.off("chat:message", handleChat);
      socket.off("system", handleSystem);
      socket.off("user:renamed", handleRenamed);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const send = useCallback((text: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    const trimmed = text.trim().slice(0, TEXT_MAX_LENGTH);
    if (!trimmed) return;
    socket.emit("chat:send", { text: trimmed });
  }, []);

  const rename = useCallback((name: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    const trimmed = name.trim().slice(0, NAME_MAX_LENGTH);
    if (!trimmed) return;
    socket.emit("user:rename", { name: trimmed });
  }, []);

  return { myId, myName, messages, connected, send, rename };
}
