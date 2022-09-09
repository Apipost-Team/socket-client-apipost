import socketIo2 from 'socket.io-client2';
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
    if (Object.prototype.toString.call(this.connectionPool[target_id]?.client) === "[object Object]" && JSON.stringify(this.connectionPool[target_id]?.client) != '{}') {
      this.close(target_id);
    }
    this.connectionPool[target_id] = {
      id: target_id,
      client: {},
      options: {},
      reconnectCount: 0,
    }
    let connectionObj = this.connectionPool[target_id];
    connectionObj.options.url = url;
    connectionObj.options.socketIoVersion = socketConfig.socketIoVersion;
    connectionObj.clientType = method;
    if (socketConfig && socketConfig instanceof Object) {
      switch (method) {
        case 'Raw':
          connectionObj.options.handshakeTimeout = parseInt(socketConfig.shakeHandsTimeOut);
          connectionObj.options.maxPayload = socketConfig.informationSize * 1024 * 1024;
          connectionObj.options.reconnectNum = parseInt(socketConfig.reconnectNum);
          connectionObj.options.reconnectTime = parseInt(socketConfig.reconnectTime);
          connectionObj.options.followRedirects = true;
          if (request && request.hasOwnProperty('header') && request.header.hasOwnProperty('parameter') && request.header.parameter instanceof Array) {
            connectionObj.options.headers = {};
            for (const header of request.header.parameter) {
              if (header?.key && (!header.hasOwnProperty('is_checked') || header.is_checked > 0)) {
                connectionObj.options.headers[header.key] = header?.value || '';
              }
            }
          }
          break;
        case 'SockJs':
          connectionObj.options.timeout = parseInt(socketConfig?.shakeHandsTimeOut);
          connectionObj.options.server = socketConfig?.sockJsServer;
          break;
        case 'Socket.IO':
          connectionObj.options.reconnectionAttempts = socketConfig?.reconnectNum ? parseInt(socketConfig.reconnectNum) : 0;
          connectionObj.options.reconnectionDelay = parseInt(socketConfig.reconnectTime);
          connectionObj.options.socketIoEventListeners = socketConfig.socketIoEventListeners;
          if (connectionObj.options.timeout > 0) connectionObj.options.timeout = parseInt(socketConfig.shakeHandsTimeOut);
          connectionObj.options.path = socketConfig.shakeHandsPath;
          if (request && request.hasOwnProperty('header') && request.header.hasOwnProperty('parameter') && request.header.parameter instanceof Array) {
            connectionObj.options.extraHeaders = {};
            for (const header of request.header.parameter) {
              if (header?.key && (!header.hasOwnProperty('is_checked') || header.is_checked > 0)) {
                connectionObj.options.extraHeaders[header.key] = header?.value || '';
              }
            }
          }
          // switch (socketConfig.socketIoVersion) {
          //   case 'v3':
          //     break;
          //   default:
          //     break;
          // }
          break;
        default:
          break;
      }
    }
  }
  createClient(target_id: string) {
    let connectionObj = this.connectionPool[target_id];

    if (typeof connectionObj == 'object') {
      const { options, clientType } = connectionObj;
      if (typeof options == 'object') {
        switch (clientType) {
          case 'Raw':
            connectionObj.client = new WebSocket(options.url, {}, options);
            console.log('OPEN', connectionObj?.client?.readyState);
            break;
          case 'SockJs':
            connectionObj.client = new sockJs(options.url, {}, options);
            break;
          case 'Socket.IO':
            switch (options.socketIoVersion) {
              case 'v2':
                connectionObj.client = socketIo2(options.url, { path: options.path })
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
    }
  }
  connect(api: any) {
    try {
      // 初始化配置options
      this.initOptions(api);
      // 连接client
      this.createClient(api?.target_id);
    } catch (error) {
      this.close(api?.target_id);
      console.log('连接error', error);
    }
  }

  reConnect(id: string) {
    let that = this;
    try {
      let connectionObj = this.connectionPool[id];
      let reconnectTime = 5000;

      if (typeof connectionObj == 'object') {
        if (typeof connectionObj.options == 'object') {
          reconnectTime = connectionObj.options.reconnectTime
        }

        connectionObj.reconnectCount++
        setTimeout(() => {
          that.connect(id);
        }, reconnectTime);
      }
    } catch (error) {

    }
  }
  send(id: string, data: any, event: any = '') {
    try {
      let connectionObj = this.connectionPool[id];

      if (typeof connectionObj == 'object') {
        const { options, clientType, client } = connectionObj || {};
        switch (clientType) {
          case 'Raw':
            client?.send(data);
            break;
          case 'SockJs':
            client?.send(data);
            break;
          case 'Socket.IO':
            switch (options.socketIoVersion) {
              case 'v2':
                client?.emit(event, data);
                break;
              case 'v3':
                client?.emit(event, data);
                break;
              case 'v4':
                client?.emit(event, data);
                break;
              default:
                break;
            }
            break;
          default:
            break;
        }
      }
    } catch (error) {

    }
  }
  close(id: string) {
    try {
      let connectionObj = this.connectionPool[id];

      if (typeof connectionObj == 'object') {
        const { client, clientType } = connectionObj || {};
        switch (clientType) {
          case 'Raw':
            client?.close();
            client?.terminate();
            break;
          case 'SockJs':
            client?.close();
            break;
          case 'Socket.IO':
            client?.disconnect();
            break;
          default:
            client?.close();
            break;
        }
      }
      if (this.connectionPool && this.connectionPool.hasOwnProperty(id)) {
        delete this.connectionPool[id];
      }
    } catch (error) {

    }
  }
  onmessage(id: string, fnc: Function, event: string = '') {
    try {
      let connectionObj = this.connectionPool[id];
      if (typeof connectionObj == 'object') {
        const { options, clientType, client } = connectionObj || {};
        if (client === undefined || Object.prototype.toString.call(client) !== '[object Object]') {
          return
        }
        switch (clientType) {
          case 'Raw':
            client.on('message', function message(data: any) {
              fnc(data);
            });
            break;
          case 'SockJs':
            client.onmessage = function (e: any) {
              fnc(e.data);
            };
            break;
          case 'Socket.IO':
            if (Array.isArray(options.socketIoEventListeners) && options.socketIoEventListeners.length > 0) {
              options.socketIoEventListeners.forEach((item: any) => {
                if ((!item.hasOwnProperty('is_checked') || item.is_checked > 0) && item.hasOwnProperty('key') && item.key && item.key.length > 0) {
                  client.on(item.key, (data: any) => {
                    fnc(data);
                  });
                }
              });
            }
            client.on('message', (data: any) => {
              fnc(data);
            });
            break;
          default:
            break;
        }
      }
    } catch (error) {

    }
  }
  onclose(id: string, fnc: Function) {
    console.log("监听连接断开");

    try {
      let connectionObj = this.connectionPool[id];

      if (typeof connectionObj == 'object') {
        const { options, clientType, client } = connectionObj || {};
        if (client === undefined || Object.prototype.toString.call(client) !== '[object Object]') {
          return
        }
        switch (clientType) {
          case 'Raw':
            client.removeEventListener('close');
            client.onclose = function message(data: any) {
              console.log("Raw连接断开");
              fnc(data);
            }
            break;
          case 'SockJs':
            client.onclose = function (e: any) {
              fnc(e);
            };
            break;
          case 'Socket.IO':
            client.on('disconnect', (data: any) => {
              console.log(555);
              fnc(data);
            });
            break;
          default:
            break;
        }
      }
    } catch (error) {

    }
  }
  onconnect(id: string, fnc: Function) {
    console.log('监听连接成功');

    try {
      let that: any = this;
      let connectionObj = this.connectionPool[id];
      if (typeof connectionObj == 'object') {
        const { options, clientType, client } = connectionObj || {};
        if (client === undefined || Object.prototype.toString.call(client) !== '[object Object]') {
          return
        }
        switch (clientType) {
          case 'Raw':
            client.removeEventListener('open');
            client.onopen = function message() {
              console.log('Raw连接成功');
              connectionObj.reconnectCount = options?.reconnectNum || 0;
              fnc();
            }
            break;
          case 'SockJs':
            client.onopen = function (e: any) {
              fnc(e);
            };
            break;
          case 'Socket.IO':
            switch (options.socketIoVersion) {
              case 'v2':
                client.on('connect', (data: any) => {
                  fnc(data);
                });
                break;
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
    } catch (error) {

    }
  }
  onerror(id: string, fnc: Function) {
    console.log("监听连接异常");
    try {
      let that: any = this;
      let connectionObj = this.connectionPool[id];
      if (typeof connectionObj == 'object') {
        const { options, clientType, client } = connectionObj || {};
        if (client === undefined || Object.prototype.toString.call(client) !== '[object Object]') {
          return
        }
        switch (clientType) {
          case 'Raw':
            client.removeEventListener('error');
            client.onerror = (error: any) => {
              console.log("Raw连接异常");
              // 异常重连
              if (options.hasOwnProperty('reconnectNum')) {
                if (options.reconnectNum > connectionObj.reconnectCount && client?.readyState != 1) {
                  that.reConnect(id);
                  fnc(error?.message || String(error));
                } else {
                  fnc(error?.message || String(error));
                }
              } else {
                fnc(error?.message || String(error));
              }
            }
            break;
          case 'SockJs':
            client.onerror = function (e: any) {
              fnc(e);
            };
            break;
          case 'Socket.IO':
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
    } catch (error) {

    }
  }

  closeAll() {
    for (const id in this.connectionPool) {
      try {
        let connectionObj = this.connectionPool[id];
        if (typeof connectionObj == 'object') {
          const { client } = connectionObj || {};
          client?.close();
        }
      } catch (error) {
        // error
      }
    }
    this.connectionPool = {};
  }
}

export default socketClient;
