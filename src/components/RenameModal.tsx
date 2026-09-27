import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { NAME_MAX_LENGTH } from "../../shared/chat.js";

interface RenameModalProps {
  open: boolean;
  initialName: string;
  onClose: () => void;
  onSave: (name: string) => void;
}

export function RenameModal({ open, initialName, onClose, onSave }: RenameModalProps) {
  if (!open) return null;
  return <RenameDialog initialName={initialName} onClose={onClose} onSave={onSave} />;
}

function RenameDialog({
  initialName,
  onClose,
  onSave,
}: {
  initialName: string;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [value, setValue] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      onClose();
      return;
    }
    onSave(trimmed);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Rename dialog"
    >
      <div
        className="w-[300px] rounded-2xl bg-slate-900 p-8 text-center shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="mb-4 text-rose-500">Set a new name</h3>
        <form onSubmit={submit}>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Enter new name..."
            maxLength={NAME_MAX_LENGTH}
            aria-label="New name"
            className="mb-3 w-full rounded-lg border border-slate-800 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none"
          />
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-lg bg-slate-800 p-2.5 text-sm text-slate-400 transition-colors hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 cursor-pointer rounded-lg bg-rose-500 p-2.5 text-sm text-white transition-colors hover:bg-rose-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
