const ws = new WebSocket(`ws://${location.host}`);
const log = document.getElementById("log");
let myName = "";

function scrollToBottom() {
  log.scrollTop = log.scrollHeight;
}

function appendMessage(msg) {
  if (msg.type === "system") {
    const el = document.createElement("div");
    el.className = "msg-system";
    el.textContent = msg.text;
    log.appendChild(el);
    scrollToBottom();
    return;
  }

  if (msg.type === "chat") {
    const isSelf = msg.name === myName;
    const row = document.createElement("div");
    row.className = `msg-row ${isSelf ? "self" : "other"}`;

    if (!isSelf) {
      const name = document.createElement("div");
      name.className = "msg-name";
      name.textContent = msg.name;
      row.appendChild(name);
    }

    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";
    bubble.textContent = msg.text;
    row.appendChild(bubble);

    const time = document.createElement("div");
    time.className = "msg-time";
    time.textContent = msg.time;
    row.appendChild(time);

    log.appendChild(row);
    scrollToBottom();
  }
}

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === "init") {
    myName = msg.name;
    document.getElementById("displayName").textContent = myName;
    document.getElementById("msgInput").focus();
    msg.history.forEach((m) => appendMessage(m));
    return;
  }

  if (msg.type === "renamed") {
    myName = msg.name;
    document.getElementById("displayName").textContent = myName;
    return;
  }

  if (msg.type === "system") appendMessage(msg);
  if (msg.type === "chat") appendMessage(msg);
};

function openRename() {
  document.getElementById("renameInput").value = myName;
  document.getElementById("renameModal").classList.add("open");
  document.getElementById("renameInput").focus();
}

function closeRename() {
  document.getElementById("renameModal").classList.remove("open");
}

function submitRename() {
  const name = document.getElementById("renameInput").value.trim();
  if (!name || name === myName) {
    closeRename();
    return;
  }
  ws.send(JSON.stringify({ type: "rename", name }));
  closeRename();
}

function sendChat() {
  const text = document.getElementById("msgInput").value.trim();
  if (!text) return;
  ws.send(JSON.stringify({ type: "chat", text }));
  document.getElementById("msgInput").value = "";
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    if (document.getElementById("renameModal").classList.contains("open")) {
      submitRename();
    } else {
      sendChat();
    }
  }
  if (e.key === "Escape") closeRename();
});
