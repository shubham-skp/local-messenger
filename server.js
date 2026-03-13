const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const fs = require('fs');
const dns = require('dns')
const os = require('os')

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Chat history

const HISTORY_FILE = path.join(__dirname, 'history/chat_history.json');

function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const raw = fs.readFileSync(HISTORY_FILE, 'utf-8');
      console.log(`Loaded chat history from file`);
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load history, starting fresh:', err.message);
  }
  return [];
}

function saveHistory() {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(chatHistory, null, 2));
  } catch (err) {
    console.error('Failed to save history:', err.message);
  }
}

let chatHistory = loadHistory();

// Clients

const clients = new Map();

// Broadcasts to ALL 
function broadcast(message) {
  const data = JSON.stringify(message);
  for (const [clientSocket] of clients) {
    if (clientSocket.readyState === 1) {
      clientSocket.send(data);
    }
  }
}

// // Broadcast to all EXCEPT the sender
// function broadcastOthers(senderSocket, message) {
//   const data = JSON.stringify(message);
//   for (const [clientSocket] of clients) {
//     if (clientSocket !== senderSocket && clientSocket.readyState === 1) {
//       clientSocket.send(data);
//     }
//   }
// }

// Resolve hostname from IP

function resolveHostname(ip) {
  return new Promise((resolve) => {

    const cleanIP = ip.replace(/^::ffff:/, '');


    if (cleanIP === '::1' || cleanIP === '127.0.0.1') {
      resolve(require('os').hostname());
      return;
    }

    dns.reverse(cleanIP, (err, hostnames) => {
      if (err || !hostnames || hostnames.length === 0) {
        console.log(`DNS lookup failed for ${cleanIP}, using IP as name`);
        resolve(cleanIP);
      } else {
        resolve(hostnames[0]);
      }
    });
  });
}

// WebSocket

wss.on('connection', async (socket, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`New connection from ${clientIP}`);

  const defaultName = await resolveHostname(clientIP);
  console.log(`Default name for ${clientIP}: ${defaultName}`);

  clients.set(socket, { name: defaultName, ip: clientIP });

  socket.send(JSON.stringify({
    type: 'init',
    name: defaultName,
    history: chatHistory
  }));

  broadcast({
    type: 'system',
    text: `${defaultName} has joined the chat 👋`,
    time: new Date().toLocaleTimeString()
  });

  socket.on('message', (data) => {
    const message = JSON.parse(data.toString());
    const client = clients.get(socket);

    // Rename
    if (message.type === 'rename') {
      const oldName = client.name;
      const newName = message.name.trim();
      if (!newName || newName === oldName) return;

      clients.set(socket, { ...client, name: newName });
      console.log(`✏️  ${oldName} renamed to ${newName}`);

      // New Name
      socket.send(JSON.stringify({ type: 'renamed', name: newName }));

      broadcast({
        type: 'system',
        text: `${oldName} changed their name to ${newName}`,
        time: new Date().toLocaleTimeString()
      });
      return;
    }

    // Chat
    if (message.type === 'chat') {
      const chatMsg = {
        type: 'chat',
        name: client.name,
        text: message.text,
        time: new Date().toLocaleTimeString()
      };

      console.log(`${client.name}: ${message.text}`);
      chatHistory.push(chatMsg);
      saveHistory();
      broadcast(chatMsg);
    }
  });

  socket.on('close', () => {
    const client = clients.get(socket);
    if (client) {
      console.log(`${client.name} disconnected`);
      broadcast({
        type: 'system',
        text: `${client.name} has left the chat`,
        time: new Date().toLocaleTimeString()
      });
    }
    clients.delete(socket);
  });
});

// Start

server.listen(PORT, HOST, () => {
  localipv4 = "0.0.0.0"
  const options = { family: 4 };
  
  dns.lookup(os.hostname(), options, (err, addr) => {
    if (err) {
      console.log(`Server running at your local IP on port ${PORT}`);
    } else {
      console.log(`Server running at http://${addr}:${PORT}`);
    }
  });
  
});