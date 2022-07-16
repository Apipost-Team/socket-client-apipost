socket-client-apipost 是一个用于ApiPost连接socket的模块。

# 🎉 特性

- 支持类型 
- Raw，SockJs，SocketIo v2 v3 v4
# 安装

```shell
npm i socket-client-apipost
```

# 基础使用
需引入：

```js
import scoketClient from 'socket-client-apipost';
const scoket = new scoketClient(); 

scoket.connect(apipostApi) // 建立连接
scoket.onmessage(id,(data)=>data); // 接收消息
scoket.onclose(id,(data)=>data); // 关闭连接回调
scoket.onconnect(id,(data)=>data); // 成功连接回调
scoket.onerror(id,(err)=>err); // 异常回调
scoket.send(id,'hello'); // 发送消息
socket.close(id); // 关闭连接
```

# 开源协议

socket-client-apipost 遵循 [MIT 协议](https://github.com/Apipost-Team/socket-client-apipost)。
