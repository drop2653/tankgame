const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const players = {};

wss.on("connection", (ws) => {
  let id = null;

  ws.on("message", (data) => {
    const msg = JSON.parse(data);
    if (msg.type === "join") {
      id = msg.id;
      players[id] = { x: 400, y: 300 };
      broadcast({ type: "players", players });
    }
    if (msg.type === "shoot" && id) {
      broadcast({ type: "shoot", id, x: msg.x, y: msg.y, vx: msg.vx, vy: msg.vy });
    }
  });

  ws.on("close", () => {
    if (id) {
      delete players[id];
      broadcast({ type: "players", players });
    }
  });
});

function broadcast(msg) {
  const data = JSON.stringify(msg);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

app.use("/", express.static(path.join(__dirname, "..", "client")));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("✅ 서버 실행 중: http://localhost:" + PORT);
});

