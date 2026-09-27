import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { DisplayMessage } from "../../shared/chat.js";
import { HISTORY_LIMIT } from "../../shared/chat.js";

const here = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.join(here, "..", "data");
export const HISTORY_FILE = path.join(DATA_DIR, "chat_history.json");

function isDisplayMessage(value: unknown): value is DisplayMessage {
    if (typeof value !== "object" || value === null) return false;
    const record = value as Record<string, unknown>;
    if (record["type"] === "chat") {
        return (
            typeof record["id"] === "string" &&
            typeof record["name"] === "string" &&
            typeof record["text"] === "string" &&
            typeof record["time"] === "string"
        );
    }
    if (record["type"] === "system") {
        return (
            typeof record["text"] === "string" &&
            typeof record["time"] === "string"
        );
    }
    return false;
}

export function loadHistory(): DisplayMessage[] {
    try {
        if (!fs.existsSync(HISTORY_FILE)) return [];
        const raw = fs.readFileSync(HISTORY_FILE, "utf-8");
        if (!raw.trim()) return [];
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(isDisplayMessage).slice(-HISTORY_LIMIT);
    } catch (err) {
        console.error(
            "[server] Failed to load history, starting fresh:",
            (err as Error).message,
        );
        return [];
    }
}

export function saveHistory(history: DisplayMessage[]): void {
    try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(
            HISTORY_FILE,
            JSON.stringify(history.slice(-HISTORY_LIMIT), null, 2),
        );
    } catch (err) {
        console.error(
            "[server] Failed to save history:",
            (err as Error).message,
        );
    }
}
