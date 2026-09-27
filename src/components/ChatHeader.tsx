interface ChatHeaderProps {
  myName: string;
  connected: boolean;
  onRenameClick: () => void;
}

export function ChatHeader({ myName, connected, onRenameClick }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-slate-900 bg-slate-800 px-5 py-3.5">
      <div className="flex items-center gap-2.5">
        <span
          aria-label={connected ? "Connected" : "Disconnected"}
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            connected ? "bg-emerald-400" : "bg-slate-500"
          }`}
        />
        <h1 className="text-base font-bold text-rose-500">Local Chat</h1>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="text-sm text-slate-400">
          You are <strong className="text-sm text-white">{myName || "..."}</strong>
        </span>
        <button
          type="button"
          onClick={onRenameClick}
          className="cursor-pointer rounded-full bg-rose-500 px-3.5 py-1.5 text-xs text-white transition-colors hover:bg-rose-600"
        >
          Rename
        </button>
      </div>
    </header>
  );
}
