# H5_to_Uniapp_Communication

## 项目简介

H5_to_Uniapp_Communication 是一个基于 WebSocket 的实时通信服务，用于解决 H5 与 uni-app 之间的实时消息传递问题。该服务采用 Node.js 开发，使用 Express 框架提供 HTTP 接口，同时集成 WebSocket 实现实时双向通信，避免了传统 HTTP 轮询需要刷新页面才能获取新消息的问题。

## 技术栈

- **后端**：Node.js、Express、WebSocket (ws 库)
- **前端**：HTML5、JavaScript、uni-app

## 功能特性

1. **实时双向通信**：基于 WebSocket 协议，实现服务器与客户端之间的实时消息传递
2. **消息广播**：服务器接收消息后广播给所有连接的客户端
3. **自动重连机制**：客户端断开连接后自动尝试重连
4. **HTTP 接口**：提供 HTTP 接口用于发送消息
5. **消息存储**：暂存最近的消息，支持客户端获取历史消息

## 安装与运行

### 安装依赖

```bash
npm install
```

### 启动服务

```bash
node server.js
```

服务默认运行在 `http://localhost:3000`

## 接口说明

### HTTP 接口

1. **发送消息**
   - 地址：`POST /send`
   - 请求体：`{"message": "消息内容"}`
   - 响应：`{"status": "ok", "timestamp": 时间戳}`

2. **获取消息**
   - 地址：`GET /receive`
   - 响应：`{"messages": [消息数组]}`

### WebSocket 接口

- 地址：`ws://localhost:3000`
- 消息格式：JSON 字符串，例如 `{"type": "message", "data": "消息内容", "timestamp": 时间戳}`

## 使用示例

### H5 端

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebSocket 测试</title>
</head>
<body>
    <h1>WebSocket 测试</h1>
    <div id="messages"></div>
    <input type="text" id="messageInput" placeholder="输入消息">
    <button onclick="sendMessage()">发送</button>

    <script>
        let ws;
        
        function initWebSocket() {
            ws = new WebSocket('ws://localhost:3000');
            
            ws.onopen = function() {
                console.log('WebSocket 连接成功');
            };
            
            ws.onmessage = function(event) {
                const message = JSON.parse(event.data);
                const messagesDiv = document.getElementById('messages');
                messagesDiv.innerHTML += `<p>${message.data}</p>`;
            };
            
            ws.onclose = function() {
                console.log('WebSocket 连接关闭');
                setTimeout(initWebSocket, 3000);
            };
            
            ws.onerror = function(error) {
                console.error('WebSocket 错误:', error);
            };
        }
        
        function sendMessage() {
            const messageInput = document.getElementById('messageInput');
            const message = messageInput.value;
            
            if (message) {
                // 通过 HTTP 接口发送消息
                fetch('/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('消息发送成功:', data);
                    messageInput.value = '';
                })
                .catch(error => {
                    console.error('消息发送失败:', error);
                });
            }
        }
        
        // 初始化 WebSocket 连接
        initWebSocket();
    </script>
</body>
</html>
```

### uni-app 端

```javascript
// 引入 WebSocket 客户端实现
import WebSocketClient from './uni-app-websocket.js';

// 初始化 WebSocket 客户端
const wsClient = new WebSocketClient('ws://localhost:3000');

// 监听消息
wsClient.onMessage((message) => {
    console.log('收到消息:', message);
    // 处理消息，例如更新 UI
});

// 监听连接状态
wsClient.onStatusChange((status) => {
    console.log('连接状态:', status);
});

// 启动 WebSocket 客户端
wsClient.start();

// 组件销毁时关闭连接
onUnload() {
    wsClient.stop();
}
```

## 项目结构

```
PPA_login_service/
├── index.html          # H5 测试页面
├── package.json        # 项目配置和依赖
├── package-lock.json   # 依赖版本锁定
├── server.js           # 服务器代码
├── uni-app-websocket.js # uni-app WebSocket 客户端实现
└── readme.md           # 项目说明文档
```

## 注意事项

1. **本地开发环境**：
   - 同一机器上可使用 `localhost:3000` 访问
   - 局域网内其他设备可使用本机 IPv4 地址访问，例如 `http://192.168.1.100:3000`

2. **生产环境部署**：
   - 建议使用 PM2 等进程管理工具
   - 配置域名和 HTTPS
   - 调整服务器监听端口和主机

3. **安全考虑**：
   - 生产环境应配置 CORS 策略
   - 考虑添加消息验证机制
   - 限制消息大小和频率

4. **性能优化**：
   - 对于大量并发连接，可考虑使用负载均衡
   - 优化消息存储和广播机制

## 许可证

本项目采用 MIT 许可证。
