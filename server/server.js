const http = require('http');
const WebSocket = require('ws');

// HTTP 서버 생성
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("WebSocket server is running.");
});

// WebSocket 서버를 HTTP 서버 위에 생성
const wss = new WebSocket.Server({ server });

let clients = [];

wss.on('connection', (ws) => {
  if (clients.length >= 2) {
    ws.close(); // 최대 2명까지만 허용
    return;
  }

  clients.push(ws);
  console.log("클라이언트 접속:", clients.length);

  ws.on('message', (msg) => {
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

// Render가 사용하는 포트로 HTTP 서버 시작
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log("HTTP/WebSocket 서버 실행 중 (포트 " + PORT + ")");
});

