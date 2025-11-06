// Node.js 서버 코드 — server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let clients = [];

wss.on('connection', (ws) => {
  if (clients.length >= 2) {
    ws.close(); // 최대 2명까지만 허용
    return;
  }

  clients.push(ws);
  console.log("클라이언트 접속:", clients.length);

  ws.on('message', (msg) => {
    // 다른 클라이언트에게 메시지 전달
    for (let client of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    }
  });

  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
    console.log("클라이언트 종료. 남은 수:", clients.length);
  });
});

console.log("웹소켓 서버 실행 중 (포트 8080)");