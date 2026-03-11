// uni-app WebSocket客户端实现
// 此文件可直接复制到uni-app项目中使用

class WebSocketClient {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectTimer = null;
    this.reconnectInterval = 3000; // 重连间隔
    this.maxReconnectAttempts = 10; // 最大重连次数
    this.reconnectAttempts = 0;
    this.messageCallback = null;
    this.connectionCallback = null;
  }

  /**
   * 初始化WebSocket连接
   * @param {string} url - WebSocket服务器地址
   * @param {function} messageCallback - 接收到消息的回调函数
   * @param {function} connectionCallback - 连接状态变化的回调函数
   */
  init(url, messageCallback, connectionCallback) {
    this.messageCallback = messageCallback;
    this.connectionCallback = connectionCallback;
    this.connect(url);
  }

  /**
   * 建立WebSocket连接
   * @param {string} url - WebSocket服务器地址
   */
  connect(url) {
    try {
      this.ws = uni.connectSocket({
        url: url,
        success: () => {
          console.log('WebSocket连接请求已发送');
        },
        fail: (err) => {
          console.error('WebSocket连接失败:', err);
          this.handleReconnect(url);
        }
      });

      // 监听WebSocket连接打开事件
      this.ws.onOpen(() => {
        console.log('WebSocket连接已打开');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        if (this.connectionCallback) {
          this.connectionCallback(true);
        }
      });

      // 监听WebSocket接收到服务器消息事件
      this.ws.onMessage((res) => {
        console.log('接收到WebSocket消息:', res.data);
        if (this.messageCallback) {
          try {
            const data = JSON.parse(res.data);
            this.messageCallback(data);
          } catch (e) {
            this.messageCallback(res.data);
          }
        }
      });

      // 监听WebSocket错误事件
      this.ws.onError((err) => {
        console.error('WebSocket错误:', err);
        this.isConnected = false;
        if (this.connectionCallback) {
          this.connectionCallback(false);
        }
      });

      // 监听WebSocket连接关闭事件
      this.ws.onClose(() => {
        console.log('WebSocket连接已关闭');
        this.isConnected = false;
        if (this.connectionCallback) {
          this.connectionCallback(false);
        }
        this.handleReconnect(url);
      });
    } catch (err) {
      console.error('WebSocket初始化失败:', err);
      this.handleReconnect(url);
    }
  }

  /**
   * 处理重连逻辑
   * @param {string} url - WebSocket服务器地址
   */
  handleReconnect(url) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket重连失败，已达到最大重连次数');
      return;
    }

    this.reconnectAttempts++;
    console.log(`WebSocket尝试重连(${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      this.connect(url);
    }, this.reconnectInterval);
  }

  /**
   * 发送消息
   * @param {any} message - 要发送的消息
   * @returns {boolean} - 发送是否成功
   */
  send(message) {
    if (!this.isConnected || !this.ws) {
      console.error('WebSocket未连接，无法发送消息');
      return false;
    }

    try {
      const messageStr = typeof message === 'object' ? JSON.stringify(message) : message;
      this.ws.send({
        data: messageStr,
        success: () => {
          console.log('WebSocket消息发送成功');
        },
        fail: (err) => {
          console.error('WebSocket消息发送失败:', err);
        }
      });
      return true;
    } catch (err) {
      console.error('WebSocket发送消息失败:', err);
      return false;
    }
  }

  /**
   * 关闭WebSocket连接
   */
  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * 获取连接状态
   * @returns {boolean} - 当前连接状态
   */
  getConnectionStatus() {
    return this.isConnected;
  }
}

// 导出WebSocket客户端实例
const wsClient = new WebSocketClient();
export default wsClient;

// 使用示例
/*
// 在uni-app页面中使用
import wsClient from '@/utils/websocket';

export default {
  data() {
    return {
      wsConnected: false,
      messages: []
    };
  },
  onLoad() {
    // 初始化WebSocket连接
    wsClient.init(
      'ws://localhost:3000', // WebSocket服务器地址
      (message) => {
        // 接收到消息的回调
        console.log('接收到消息:', message);
        this.messages.push(message);
        // 这里可以处理接收到的消息，比如更新UI、触发事件等
      },
      (connected) => {
        // 连接状态变化的回调
        this.wsConnected = connected;
        console.log('WebSocket连接状态:', connected);
      }
    );
  },
  onUnload() {
    // 页面卸载时关闭WebSocket连接
    wsClient.close();
  },
  methods: {
    // 发送消息示例
    sendMessage() {
      wsClient.send({ type: 'ping', timestamp: Date.now() });
    }
  }
};
*/