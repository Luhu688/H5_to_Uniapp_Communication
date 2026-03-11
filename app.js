const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3001

app.use(cors());
app.use(bodyParser.json());

let messageStore = null; // 保存消息和时间戳
const clients = new Set(); // 存储WebSocket连接

// 创建WebSocket服务器
const wss = new WebSocket.Server({ server });

// 处理WebSocket连接
wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('新的WebSocket连接，当前连接数:', clients.size);

  // 连接关闭时移除
  ws.on('close', () => {
    clients.delete(ws);
    console.log('WebSocket连接关闭，当前连接数:', clients.size);
  });

  // 处理错误
  ws.on('error', (error) => {
    console.error('WebSocket错误:', error);
    clients.delete(ws);
  });
});

// 广播消息给所有WebSocket客户端
function broadcastMessage(message) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify({ type: 'message', data: message }));
      } catch (error) {
        console.error('发送消息失败:', error);
        clients.delete(client);
      }
    }
  });
}

// H5 发送消息
app.post('/send', (req, res) => {
  const { message } = req.body;
  const timestamp = Date.now();
  messageStore = { message, timestamp };
  
  // 广播消息给所有WebSocket客户端
  broadcastMessage(message);
  
  res.json({ status: 'ok', timestamp });
});

// uni-app 获取消息
app.get('/receive', (req, res) => {
  if (!messageStore) {
    return res.json({ message: null });
  }

  const now = Date.now();
  const diff = (now - messageStore.timestamp) / 1000; // 秒差

  if (diff <= 30) { // 30秒内
    return res.json({ message: messageStore.message });
  } else {
    return res.json({ message: null });
  }
});

server.listen(port, () => {
  console.log('Server running on http://localhost:3001');
  console.log('WebSocket server ready');
});
