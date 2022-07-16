import { io as socketIo2 } from 'socket.io-client2';
import { io as socketIo3 } from 'socket.io-client3';
import { io as socketIo4 } from 'socket.io-client4';
import sockJs from 'sockjs-client';
import WebSocket from 'ws';

class socketClient {
  connectionPool: any;
  constructor() {
    this.connectionPool = {}; // 连接池 id，包含client对象,clientType,options
  }
  initOptions(api: any) {
    const { url, socketConfig, request, method, target_id } = api;
    this.connectionPool[target_id] = {
      id: target_id,
      client: {},
      options: {},
      reconnectCount: 0,
    }
    let connectionObj = this.connectionPool[target_id];
    connectionObj.options.url = url;
    connectionObj.clientType = method;
    if (socketConfig && socketConfig instanceof Object) {
      switch (method) {
        case 'Raw':
          connectionObj.options.handshakeTimeout = socketConfig.shakeHandsTimeOut;
          connectionObj.options.maxPayload = socketConfig.informationSize * 1024 * 1024;
          connectionObj.options.reconnectNum = socketConfig.reconnectNum;
          connectionObj.options.reconnectTime = socketConfig.reconnectTime;
          if (request && request.hasOwnProperty('header') && request.header.hasOwnProperty('parameter') && request.header.parameter instanceof Array) {
            connectionObj.options.headers = {};
            for (const header of request.header.parameter) {
              if (header?.key && (!header.hasOwnProperty('is_checked') || header.is_checked > 0)) {
                connectionObj.options.headers[header.key] = header?.value || '';
              }
            }
          }
          break;
        case 'sockJs':
          connectionObj.options.timeout = socketConfig.shakeHandsTimeOut;
          connectionObj.options.server = socketConfig.sockJsServer;
          break;
        case 'socketIo':
          switch (connectionObj.options.socketIoVersion) {
            case 'v3':
              connectionObj.options.reconnectionAttempts = socketConfig.reconnectNum;
              connectionObj.options.reconnectionDelay = socketConfig.reconnectTime;
              connectionObj.options.timeout = socketConfig.shakeHandsTimeOut;
              connectionObj.options.path = socketConfig.shakeHandsPath;
              if (request && request.hasOwnProperty('header') && request.header.hasOwnProperty('parameter') && request.header.parameter instanceof Array) {
                connectionObj.options.extraHeaders = {};
                for (const header of request.header.parameter) {
                  if (header?.key && (!header.hasOwnProperty('is_checked') || header.is_checked > 0)) {
                    connectionObj.options.headers[header.key] = header?.value || '';
                  }
                }
              }
              break;
            default:
              connectionObj.options.reconnectionAttempts = socketConfig.reconnectNum;
              connectionObj.options.reconnectionDelay = socketConfig.reconnectTime;
              connectionObj.options.timeout = socketConfig.shakeHandsTimeOut;
              connectionObj.options.path = socketConfig.shakeHandsPath;
              if (request && request.hasOwnProperty('header') && request.header.hasOwnProperty('parameter') && request.header.parameter instanceof Array) {
                connectionObj.options.extraHeaders = {};
                for (const header of request.header.parameter) {
                  if (header?.key && (!header.hasOwnProperty('is_checked') || header.is_checked > 0)) {
                    connectionObj.options.headers[header.key] = header?.value || '';
                  }
                }
              }
              break;
          }
          break;
        default:
          break;
      }
    }
  }
  createClient(target_id: string) {
    let connectionObj = this.connectionPool[target_id];
    const { options, clientType } = connectionObj;
    switch (clientType) {
      case 'Raw':
        connectionObj.client = new WebSocket(options.url, {}, options);
        console.log('OPEN', connectionObj.client.readyState);
        break;
      case 'sockJs':
        connectionObj.client = new sockJs(options.url, {}, options);
        break;
      case 'socketIo':
        switch (options.socketIoVersion) {
          case 'v2':
            connectionObj.client = socketIo2(options.url, options)
            break;
          case 'v3':
            connectionObj.client = socketIo3(options.url, options)
            break;
          case 'v4':
            connectionObj.client = socketIo4(options.url, options)
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  }
  connect(api: any) {
    // 初始化配置options
    this.initOptions(api);
    // 连接client
    this.createClient(api?.target_id);
  }

  reConnect(id: string, connectionObj: any) {
    connectionObj.reconnectCount++
    setTimeout(() => {
      this.createClient(id);
    }, connectionObj.options.reconnectTime);
  }
  send(id: string, data: any, event: any = '') {
    let connectionObj = this.connectionPool[id];
    const { options, clientType, client } = connectionObj;
    switch (clientType) {
      case 'Raw':
        client.send(data);
        break;
      case 'sockJs':
        client.send(data);
        break;
      case 'socketIo':
        switch (options.socketIoVersion) {
          case 'v2':
            client.emit(event, data);
            break;
          case 'v3':
            client.emit(event, data);
            break;
          case 'v4':
            client.emit(event, data);
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  }
  close(id: string) {
    let connectionObj = this.connectionPool[id];
    const { client } = connectionObj;
    client.close();
  }
  onmessage(id: string, fnc: Function, event: string = '') {
    let connectionObj = this.connectionPool[id];
    const { options, clientType, client } = connectionObj;
    switch (clientType) {
      case 'Raw':
        client.on('message', function message(data: any) {
          fnc(data);
        });
        break;
      case 'sockJs':
        client.onmessage = function (e: any) {
          fnc(e.data);
        };
        break;
      case 'socketIo':
        switch (options.socketIoVersion) {
          case 'v2':
            client.on(event, (data: any) => {
              fnc(data);
            });
            break;
          case 'v3':
            client.on(event, (data: any) => {
              fnc(data);
            });
            break;
          case 'v4':
            client.on(event, (data: any) => {
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
  onclose(id: string, fnc: Function) {
    let connectionObj = this.connectionPool[id];
    const { options, clientType, client } = connectionObj;
    switch (clientType) {
      case 'Raw':
        client.on('close', function message(data: any) {
          fnc(data);
        });
        break;
      case 'sockJs':
        client.onclose = function (e: any) {
          fnc(e);
        };
        break;
      case 'socketIo':
        switch (options.socketIoVersion) {
          case 'v2':
            client.on('disconnect', (data: any) => {
              fnc(data);
            });
            break;
          case 'v3':
            client.on('disconnect', (data: any) => {
              fnc(data);
            });
            break;
          case 'v4':
            client.on('disconnect', (data: any) => {
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
  onconnect(id: string, fnc: Function) {
    let that: any = this;
    let connectionObj = this.connectionPool[id];
    const { options, clientType, client } = connectionObj;
    switch (clientType) {
      case 'Raw':
        client.on('open', function message() {
          connectionObj.reconnectCount = options?.reconnectNum || 0;
          fnc();
        });
        break;
      case 'sockJs':
        client.onopen = function (e: any) {
          fnc(e);
        };
        break;
      case 'socketIo':
        switch (options.socketIoVersion) {
          case 'v2':
            client.on('connect', (data: any) => {
              fnc(data);
            });
          case 'v3':
            client.on('connect', (data: any) => {
              fnc(data);
            });
            break;
          case 'v4':
            client.on('connect', (data: any) => {
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
  onerror(id: string, fnc: Function) {
    let that: any = this;
    let connectionObj = this.connectionPool[id];
    const { options, clientType, client } = connectionObj;
    switch (clientType) {
      case 'Raw':
        client.on("error", (error: any) => {
          console.log(JSON.stringify(error), 'error');
          // 异常重连
          if (options.hasOwnProperty('reconnectNum')) {
            if (options.reconnectNum > connectionObj.reconnectCount && client?.readyState != 1) {
              that.reConnect(id, connectionObj);
            }
          }
        });
        break;
      case 'sockJs':
        client.onerror = function (e: any) {
          fnc(e);
        };
        break;
      case 'socketIo':
        switch (options.socketIoVersion) {
          case 'v2':
            client.on('connect_error', (data: any) => {
              fnc(data);
            });
            break;
          case 'v3':
            client.on('connect_error', (data: any) => {
              fnc(data);
            });
            break;
          case 'v4':
            client.on('connect_error', (data: any) => {
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
  closeAll(){
    for (const id in this.connectionPool) {
      try {
        let connectionObj = this.connectionPool[id];
      const { client } = connectionObj;
      client.close();
      } catch (error) {
        // error
      }
    }
  }
}

export default socketClient;
