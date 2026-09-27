# local-messenger

LAN chat app. React + TypeScript + Tailwind client, Express + Socket.io server.

## Requirements

Node 20+, npm.

## Install

```bash
npm install
```

## Run (development)

Starts server (`:3000`) and client (`:5173`) together:

```bash
npm run dev
```

Open in two browsers to test:

- `http://localhost:5173` (same machine)
- `http://<lan-ip>:5173` (other devices on the same network)

The server logs its LAN address on startup. The Vite dev server proxies
`/socket.io` to `http://localhost:3000`, so no extra config is needed.

Individual processes:

```bash
npm run dev:server
npm run dev:client
```

## Run (production)

Build the client, then start the server (it serves `dist/` itself):

```bash
npm run build
npm start
```

Open `http://<lan-ip>:3000`. `PORT` and `HOST` env vars are supported.

## Health check

```bash
curl http://localhost:3000/api/health
```

## How it works

- `server/src/index.ts` — Express + HTTP + Socket.io, typed events, join/leave
  system messages, rename/chat handlers, JSON history in
  `server/data/chat_history.json` (gitignored, capped at 200).
- `shared/chat.ts` — shared Socket.io event contract and limits.
- `src/lib/socket.ts` — typed `socket.io-client` factory.
- `src/hooks/useChat.ts` — connection state, message list, `send`/`rename`.
- `src/components/` — `ChatHeader`, `MessageList`, `ChatInput`, `RenameModal`.

## Scripts

| Script         | Purpose                              |
| -------------- | ------------------------------------ |
| `npm run dev`  | server + client together             |
| `npm run start`| production server (serves `dist/`)   |
| `npm run build`| typecheck + production client build  |
| `npm run lint` | eslint                               |
