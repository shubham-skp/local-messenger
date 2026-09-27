import { useState } from "react";
import { ChatHeader } from "./components/ChatHeader.tsx";
import { ChatInput } from "./components/ChatInput.tsx";
import { MessageList } from "./components/MessageList.tsx";
import { RenameModal } from "./components/RenameModal.tsx";
import { useChat } from "./hooks/useChat.ts";

function App() {
  const { myName, messages, connected, send, rename } = useChat();
  const [renameOpen, setRenameOpen] = useState(false);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">
      <div className="flex h-screen w-full max-w-3xl flex-col bg-slate-900">
        <ChatHeader
          myName={myName}
          connected={connected}
          onRenameClick={() => setRenameOpen(true)}
        />
        <MessageList messages={messages} myName={myName} />
        <ChatInput connected={connected} onSend={send} />
      </div>
      <RenameModal
        open={renameOpen}
        initialName={myName}
        onClose={() => setRenameOpen(false)}
        onSave={rename}
      />
    </div>
  );
}

export default App;
