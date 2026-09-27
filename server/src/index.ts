import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { Server } from "socket.io";
import type {
    ChatMessage,
    ClientToServerEvents,
    DisplayMessage,
    ServerToClientEvents,
    SystemMessage,
} from "../../shared/chat.js";
import {
    HISTORY_LIMIT,
    NAME_MAX_LENGTH,
    TEXT_MAX_LENGTH,
} from "../../shared/chat.js";
import { getLanAddress, resolveHostname } from "./hostname.js";
import { loadHistory, saveHistory } from "./history.js";

export const PORT = Number(process.env["PORT"] ?? 3000);
export const HOST = process.env["HOST"] ?? "0.0.0.0";

const here = path.dirname(fileURLToPath(import.meta.url));
// server/src -> root/dist in production
const distDir = path.join(here, "..", "..", "dist");

const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => {
    res.json({ ok: true, clients: clients.size, history: chatHistory.length });
});

if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get("/{*splat}", (_req, res) => {
        res.sendFile(path.join(distDir, "index.html"));
    });
}

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { origin: true },
});

interface ClientInfo {
    name: string;
    ip: string;
}

const clients = new Map<string, ClientInfo>();
let chatHistory: DisplayMessage[] = loadHistory();
console.log(`[server] Loaded ${chatHistory.length} history messages`);

function now(): string {
    return new Date().toLocaleTimeString();
}

function pushHistory(msg: DisplayMessage): void {
    chatHistory.push(msg);
    if (chatHistory.length > HISTORY_LIMIT) {
        chatHistory = chatHistory.slice(-HISTORY_LIMIT);
    }
    saveHistory(chatHistory);
}

io.on("connection", (socket) => {
    const rawIp: string | undefined =
        typeof socket.handshake.address === "string"
            ? socket.handshake.address
            : undefined;

    void (async () => {
        const defaultName = await resolveHostname(rawIp);
        clients.set(socket.id, { name: defaultName, ip: rawIp ?? "unknown" });
        console.log(
            `[server] ${defaultName} connected (${socket.id} / ${rawIp})`,
        );

        socket.emit("init", {
            id: socket.id,
            name: defaultName,
            history: chatHistory,
        });

        const joinMsg: SystemMessage = {
            type: "system",
            text: `${defaultName} has joined`,
            time: now(),
        };
        io.emit("system", joinMsg);
    })();

    socket.on("chat:send", (payload) => {
        const client = clients.get(socket.id);
        if (!client) return;
        const text =
            typeof payload?.text === "string" ? payload.text.trim() : "";
        if (!text || text.length > TEXT_MAX_LENGTH) return;

        const msg: ChatMessage = {
            type: "chat",
            id: randomUUID(),
            name: client.name,
            text,
            time: now(),
        };
        console.log(`[server] ${client.name}: ${text}`);
        pushHistory(msg);
        io.emit("chat:message", msg);
    });

    socket.on("user:rename", (payload) => {
        const client = clients.get(socket.id);
        if (!client) return;
        const newName =
            typeof payload?.name === "string"
                ? payload.name.trim().slice(0, NAME_MAX_LENGTH)
                : "";
        if (!newName || newName === client.name) return;

        const oldName = client.name;
        clients.set(socket.id, { ...client, name: newName });
        console.log(`[server] ${oldName} renamed to ${newName}`);

        socket.emit("user:renamed", { id: socket.id, name: newName });
        io.emit("system", {
            type: "system",
            text: `${oldName} changed their name to ${newName}`,
            time: now(),
        });
    });

    socket.on("disconnect", () => {
        const client = clients.get(socket.id);
        clients.delete(socket.id);
        if (client) {
            console.log(`[server] ${client.name} disconnected`);
            io.emit("system", {
                type: "system",
                text: `${client.name} has left`,
                time: now(),
            });
        }
    });
});

httpServer.listen(PORT, HOST, () => {
    void getLanAddress().then((addr) => {
        console.log(
            `[server] Listening on http://${addr}:${PORT} (host ${HOST})`,
        );
    });
});
