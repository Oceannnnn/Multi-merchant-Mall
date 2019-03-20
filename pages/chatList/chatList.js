// pages/chatList/chatList.js
const app = getApp();
const util = require('../../utils/util.js');
const websocket = require('../../utils/websocket.js');
Page({
  data: {
    chatList: []
  },
  onShow() {
    this.init()
  },
  init() {
    let token = app.globalData.token;
    util.http('chat/get_list', {}, 'get', token).then(res => {
      if (res.code == 200) {
        let chatList = res.data.data
        if (chatList == '') return
        this.setData({
          chatList: chatList,
          fromid: chatList[0].toid,
          userInfo: wx.getStorageSync('httpClient').userInfo
        })
        //调通接口
        websocket.connect(this.data.userInfo, function (res) { })
        //接受服务器消息
        let that = this;
        wx.onSocketMessage(function (res) {
          // debugger
          let msg = JSON.parse(res.data);
          let fromid = that.data.fromid;
          let type = msg.type;
          if (type == 'init') {
            let bild = '{"type":"bind","fromid":"' + fromid + '"}';
            wx.sendSocketMessage({
              data: bild,
            })
            return
          } else if (type == 'text') {
            msg['content'] = msg.data;
          } else if (type == 'image') {
            msg['content'] = "[图片]";
          } else if (type == 'goods') {
            msg['content'] = "[商品]";
          }
          for (var i = 0; i < chatList.length; i++) {
            if (msg.fromid == chatList[i].fromid) {
              chatList[i].last_message = msg;
              chatList[i].countNoread = chatList[i].countNoread + 1
            }
          }
          that.setData({
            chatList: chatList
          })
        });
      }
    })
  },
  onUnload() {
    wx.closeSocket();
  },
  toChat(e) {
    let fromid = e.currentTarget.dataset.fromid;
    let toid = e.currentTarget.dataset.toid;
    wx.navigateTo({
      url: '../chat/chat?fromid=' + fromid + '&toid=' + toid,
    })
  }
})