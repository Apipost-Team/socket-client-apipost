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
  reconnectCount:number;
  constructor(clientType: string = 'ws', api: any = {}) {
    this.clientType = clientType;
    this.client = {};
    this.options = {};
    this.url = '';
    this.reconnectCount = 0;
    // 初始化
    this.init(api);
  }
  init(api: any) {
    const { url, socketConfig,request } = api;
    this.url=url;
    if (socketConfig && socketConfig instanceof Object) {
      switch (this.clientType) {
        case 'ws':
          this.options['handshakeTimeout'] = socketConfig.shakeHandsTimeOut;
          this.options['maxPayload'] =socketConfig.informationSize * 1024 * 1024;
          this.options['reconnectNum']=socketConfig.reconnectNum;
          this.options['reconnectTime']=socketConfig.reconnectTime;
          if(request && request.hasOwnProperty('header') && request.header.hasOwnProperty('parameter') && request.header.parameter instanceof Array){
            this.options['headers']={};
            for (const header of request.header.parameter) {
              if(header?.key && (!header.hasOwnProperty('is_checked') || header.is_checked > 0)){
                this.options.headers[header.key] = header?.value || '';
              }
            }
          }
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
              if(request && request.hasOwnProperty('header') && request.header.hasOwnProperty('parameter') && request.header.parameter instanceof Array){
                this.options['extraHeaders']={};
                for (const header of request.header.parameter) {
                  if(header?.key && (!header.hasOwnProperty('is_checked') || header.is_checked > 0)){
                    this.options.headers[header.key] = header?.value || '';
                  }
                }
              }
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
  }
  createClient(clientType: string = 'ws', url: string = '', options: any = {}) {
    console.log('options',url,JSON.stringify(options,null,'\t'));
    switch (clientType) {
      case 'ws':
        this.client = new WebSocket(url, {}, options);
        this.client.on("error", (error : any) => {
          console.log(JSON.stringify(error),'error');
          // 异常重连
          if(options.hasOwnProperty('reconnectNum')){
            if(options.reconnectNum > this.reconnectCount && this.client?.readyState != 1){
              this.reConnect();
            }
          }
        });
        this.client.on("open", () => {
          this.reconnectCount = options?.reconnectNum
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
  reConnect() {
    this.reconnectCount++;
    setTimeout(() => {
      this.createClient(this.clientType, this.url, this.options);
     }, this.options.reconnectTime);
  }
  send(data : any,event : any = ''){
    switch (this.clientType) {
      case 'ws':
        this.client.send(data);
        break;
      case 'sockJs':
        this.client.send(data);
        break;
      case 'socketIo':
        switch (this.options.socketIoVersion) {
          case 'v3':
            this.client.emit(event,data);
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  }
  onmessage(fnc : Function, event : string = ''){
    switch (this.clientType) {
      case 'ws':
        this.client.on('message', function message(data : any) {
          fnc(data);
        });
        break;
      case 'sockJs':
        this.client.onmessage = function(e : any) {
          fnc(e.data);
      };
        break;
      case 'socketIo':
        switch (this.options.socketIoVersion) {
          case 'v3':
            this.client.on(event, (data : any) => {
              fnc(data);
            });
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  }
}



export default socketClient;
