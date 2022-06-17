socket-client-apipost 是一个用于ApiPost连接socket的模块。

# 🎉 特性

- 支持类型 
- ws，sockjs，socket.io v3
# 安装

```shell
npm i socket-client-apipost
```

# 基础使用
需引入：

```js
import scoketClient from 'socket-client-apipost';
const scoket = new scoketClient('ws',apipostApi); // 建立连接
scoket.send('hello'); // 发现消息
socket.close(); // 关闭连接
```

# 开源协议

socket-client-apipost 遵循 [MIT 协议](https://github.com/Apipost-Team/socket-client-apipost)。
