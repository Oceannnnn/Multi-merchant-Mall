var url = 'wss://stores.fqwlkj.cn:2345';//服务器地址
var socketOpen = false;
var socketMsgQueue = [];
function connect(user, func) {
  wx.connectSocket({
    url: url,
    header: { 'content-type': 'application/json' },
    success: function () {
      // console.log('websocket连接成功~')
    },
    fail: function () {
      console.log('websocket连接失败~')
    }
  })
  wx.onSocketError(function (res) {
    wx.showToast({
      title: 'websocket连接失败，请检查！',
      icon: "none",
      duration: 2000
    })
  })
}
//发送消息1
function send(msg) {
  wx.sendSocketMessage({
    data: msg
  });
  wx.request({
    url: 'https://stores.fqwlkj.cn/api/chat/m_save_message',
    method: "POST",
    data: { "message": msg },
    success: function (res) {},
  })
}
module.exports = {
  connect: connect,
  send: send
}