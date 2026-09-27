// Shared Socket.io contract (types only, no runtime logic).
// Imported by client (src/) and server (server/src/).

export interface ChatMessage {
  type: "chat";
  id: string;
  name: string;
  text: string;
  time: string;
}

export interface SystemMessage {
  type: "system";
  text: string;
  time: string;
}

export type DisplayMessage = ChatMessage | SystemMessage;

export interface ServerToClientEvents {
  init: (payload: { id: string; name: string; history: DisplayMessage[] }) => void;
  "chat:message": (msg: ChatMessage) => void;
  system: (msg: SystemMessage) => void;
  "user:renamed": (payload: { id: string; name: string }) => void;
}

export interface ClientToServerEvents {
  "chat:send": (payload: { text: string }) => void;
  "user:rename": (payload: { name: string }) => void;
}

export const HISTORY_LIMIT = 200;
export const NAME_MAX_LENGTH = 20;
export const TEXT_MAX_LENGTH = 500;
