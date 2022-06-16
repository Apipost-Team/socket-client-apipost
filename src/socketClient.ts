import { io as socketIo2 } from 'socket.io-client2';
import { io as socketIo3 } from 'socket.io-client3';
import { io as socketIo4 } from 'socket.io-client4';
import sockJs from 'sockjs-client';
import WebSocket from 'ws';

class socketClient {
  client: any;
  clientType: string;
  options: any;
  url: string;
  constructor(clientType: string = 'ws', api: any = {}) {
    this.clientType = clientType;
    this.client = {};
    this.options = {};
    this.url = '';
    // 初始化
    this.init(api);
  }
  init(api: any) {
    const { url, socketConfig } = api;
    this.url=url;
    if (socketConfig && socketConfig instanceof Object) {
      switch (this.clientType) {
        case 'ws':
          this.options['handshakeTimeout'] = socketConfig.shakeHandsTimeOut;
          this.options['maxPayload'] =socketConfig.informationSize * 1024 * 1024;
          this.options['reconnectNum']=socketConfig.reconnectNum;
          this.options['reconnectTime']=socketConfig.reconnectTime;
          break;
        case 'sockJs':
          this.options['timeout'] = socketConfig.shakeHandsTimeOut;
          this.options['server'] = socketConfig.sockJsServer;
          break;
        case 'socketIo':
          switch (this.options.socketIoVersion) {
            case 'v3':
              this.options['reconnectionAttempts']= socketConfig.reconnectNum;
              this.options['reconnectionDelay']= socketConfig.reconnectTime;
              this.options['timeout']=socketConfig.shakeHandsTimeOut;
              this.options['path']=socketConfig.shakeHandsPath;
              break;
            default:
              break;
          }
          break;
        default:
          break;
      }
    }
    this.createClient(this.clientType, this.url, this.options);
    const temp = {
      informationSize: 5, //最大可接收内容大小，单位（MB），0表示不限制
      reconnectNum: 2, //链接意外断开时，最大重新尝试链接次数
      reconnectTime: 5000, // 重连时间间隔，单位毫秒
      shakeHandsPath: "/socket.io", // 设置握手期间应使用的服务器路径
      shakeHandsTimeOut: 1, // socket链接超时等待时长，毫秒为单位，0表示用不超时
      socketEventName: "", // 发送事件名
      socketIoEventListeners: [{ type: '', desc: '' }], //后端监听的事件列表
      socketIoVersion: "v3", // 当请求method为Socket.IO类型时，用于链接服务器所使用的客户端版本
      sockJsServer: '', // 附加到 url 以进行实际数据连接的字符串。默认为随机的 4 位数字。
    }
  }
  createClient(clientType: string = 'ws', url: string = '', options: Object = {}) {
    switch (clientType) {
      case 'ws':
        this.client = new WebSocket(url, {}, options);
        this.client.on("error", (error : any) => {
          console.log(JSON.stringify(error),'error');
          
          // 异常重连
          this.reConnect();
        });
        console.log('OPEN', this.client.readyState);
        break;
      case 'sockJs':
        this.client = new sockJs(url, {}, options);
        break;
      case 'socketIo':
        switch (this.options.socketIoVersion) {
          case 'v3':
            this.client = socketIo3(url,options)
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  }
  async reConnect() {
    for (let index = 0; index < this.options.reconnectNum; index++) {
      await new Promise((resolve,reject)=>{
        setTimeout(() => {
          this.createClient(this.clientType, this.url, this.options);
          reject();
         }, this.options.reconnectTime);
      })
      if(this.client?.readyState == this.client?.OPEN){
        break;
      }
    }
  }
}



export default socketClient;
