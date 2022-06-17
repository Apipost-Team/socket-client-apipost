import socketClient from '../src/socketClient'


describe('works', () => {

  const client=new socketClient('ws',{
    url:'wss://dev_tools_env_dev_socket.apipost.cn/v6/apipost.io?userToken=0ojRGU5pnY1XiF20n7dl-ijg68pGwAieY07gESFHgJQZIG_Z8fvcHW8687T1Rgj_q7OWs-pgUaq410NuBjXXTIL8RHo_cdnJSt7owpWDm4uHpN-b7sD3VYZOcFlpLaHlc7Tgb4adqVMLf6e3oYrLjedE-CCAmIjcIBm2RVchE-4&terminal=web',
    socketConfig:{
      informationSize: 5, //最大可接收内容大小，单位（MB），0表示不限制
      reconnectNum: 2, //链接意外断开时，最大重新尝试链接次数
      reconnectTime: 5000, // 重连时间间隔，单位毫秒
      shakeHandsPath: "/socket.io", // 设置握手期间应使用的服务器路径
      shakeHandsTimeOut: 0, // socket链接超时等待时长，毫秒为单位，0表示用不超时
      socketEventName: "", // 发送事件名
      socketIoEventListeners: [{ type: '', desc: '' }], //后端监听的事件列表
      socketIoVersion: "v3", // 当请求method为Socket.IO类型时，用于链接服务器所使用的客户端版本
      sockJsServer: '', // 附加到 url 以进行实际数据连接的字符串。默认为随机的 4 位数字。
    },
    request:{
      header:{
        parameter:[{is_checked: 1 ,key : 'auth', value:'xbw'},{is_checked: -1 ,key : 'age', value:'18'}]
      }
    }
  });
  console.log(JSON.stringify(client.client));
  
  it('转换成简要类型', () => {
    expect('success').toBe(`success`);
  });
});

