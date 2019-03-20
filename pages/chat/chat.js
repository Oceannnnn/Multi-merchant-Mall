// pages/chat/chat.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
const websocket = require('../../utils/websocket.js');
Page({
  data: {
    id: '',
    newslist: [],
    from_head: {},
    to_head: {},
    userInfo: {},
    scrollTop: 0,
    page: 1,
    increase: false, //图片添加区域隐藏
    aniStyle: false, //动画效果
    message: "",
    previewImgList: []
  },
  onLoad(op) {
    if (op.id) {
      this.setData({
        id: op.id
      })
    }
    this.setData({
      toid: op.toid,
      fromid: op.fromid,
      // userInfo: wx.getStorageSync('httpClient').userInfo
    })
    this.init(op.fromid, op.toid);
  },
  onUnload() {
    wx.closeSocket();
  },
  init(fromid, toid) {
    this.changeNoRead(fromid, toid);
    this.newslist(1);
    util.http('chat/m_get_user', {
      fromid: fromid,
      toid: toid
    }, 'post').then(res => {
      if (res.code == 200) {
        let fromuser = res.data.fromuser;
        let touser = res.data.touser;
        this.setData({
          from_head: fromuser.head_img,
          from_name: fromuser.nick_name,
          to_name: touser.nick_name,
          to_head: touser.head_img
        })
        wx.setNavigationBarTitle({
          title: touser.nick_name
        })
      }
    })
    util.http('chat/goods', {
      goods_id: this.data.id,
    }, 'post').then(res => {
      if (res.code == 200) {
        this.setData({
          goods: res.data
        })
      }
    })
    //调通接口
    websocket.connect(this.data.userInfo, function (res) { })
    //接受服务器消息
    let that = this;
    wx.onSocketMessage(function (res) {
      let msg = JSON.parse(res.data);
      let newslist = that.data.newslist;
      let type = msg.type;
      switch (type) {
        case "init":
          let bild = '{"type":"bind","fromid":"' + fromid + '"}';
          wx.sendSocketMessage({
            data: bild,
          });
          return;
        case "text":
          msg['chat_type'] = 1;
          break;
        case "image":
          msg['chat_type'] = 2;
          break;
        case "goods":
          msg['chat_type'] = 3;
          break;
      }

      newslist.push(msg);
      that.setData({
        newslist: newslist
      });
      that.changeNoRead(fromid, toid);
      that.bottom();
    });

  },
  newslist(page) {
    let json = {
      size: 10,
      page: page,
      fromid: this.data.fromid,
      toid: this.data.toid
    }
    let list = this.data.newslist;
    let token = app.globalData.token;
    util.http('chat/m_load', json, 'post', token).then(res => {
      if (res.code == 200) {
        if (res.data.data != '') {
          for (let item of res.data.data) {
            list.unshift(item)
          }
          this.setData({
            newslist: list
          })
        } else {
          if (page > 1) {
            wx.showToast({
              title: '暂无更多聊天',
              icon: 'none'
            })
          }
        }
        if (page == 1) {
          this.bottom();
        }
      }
    })
  },
  chatHistory() {
    let page = this.data.page + 1;
    this.setData({
      page: page
    })
    this.newslist(page);
  },
  //发送消息
  send(e) {
    let status = e.currentTarget.dataset.status;
    let newslist = this.data.newslist;
    let fromid = this.data.fromid;
    let toid = this.data.toid;
    let message = '',
      chat_type = 1,
      sendMsg = new Object(),
      type = "";
    if (status == 1) {
      message = this.data.id;
      chat_type = 3;
      type = "goods";
      let goods = this.data.goods;
      websocket.send('{ "data": "' + message + '", "time": "' + util.formatTime(new Date()) + '","type": "' + type + '","price": "' + goods.price + '","goods_name": "' + goods.name + '","pic": "' + goods.pic + '","fromid": "' + fromid + '","toid": "' + toid + '"}');
    } else if (status == 0) {
      message = this.data.message;
      chat_type = 1;
      type = "text";
      if (message.trim() == "") {
        wx.showToast({
          title: '消息不能为空哦~',
          icon: "none",
          duration: 2000
        })
        return
      }
      websocket.send('{ "data": "' + message + '", "time": "' + util.formatTime(new Date()) + '","type": "' + type + '","fromid": "' + fromid + '","toid": "' + toid + '"}');
    }
    setTimeout(() => {
      this.setData({
        increase: false
      })
    }, 500)
  },
  changeNoRead(fromid, toid) { //标记已读
    util.http('chat/changeNoRead', {
      fromid: fromid,
      toid: toid
    }, 'post').then(res => { })
  },
  //监听input值的改变
  bindChange(res) {
    this.setData({
      message: res.detail.value
    })
  },
  cleanInput() {
    this.setData({
      message: this.data.message
    })
  },
  bindfocus() {
    this.setData({
      increase: false,
      aniStyle: false
    })
  },
  increase() {
    this.setData({
      increase: !this.data.increase,
      aniStyle: !this.data.aniStyle
    })
  },
  //发送图片
  chooseImage() {
    let token = app.globalData.token;
    let fromid = this.data.fromid;
    let toid = this.data.toid;
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: util.u + "chat/uploads",
          filePath: tempFilePaths[0],
          name: 'file',
          header: {
            "Content-Type": "multipart/form-data",
            token: token
          }, //这里是上传图片时一起上传的数据
          success: function (res) {
            if (res.data) {
              let data = res.data;
              data = JSON.parse(data);
              let url = data.data;
              that.setData({
                increase: false
              })
              websocket.send('{ "data": "' + url + '", "time": "' + util.formatTime(new Date()) + '","type": "image", "fromid": "' + fromid + '","toid": "' + toid + '"}');
            }
          }
        })
      }
    })
  },
  Details(e) {
    main.toDetails(e, 'goodsDetails');
  },
  //图片预览
  previewImg(e) {
    var that = this
    //必须给对应的wxml的image标签设置data-set=“图片路径”，否则接收不到
    var res = e.target.dataset.src
    var list = this.data.previewImgList //页面的图片集合数组
    //判断res在数组中是否存在，不存在则push到数组中, -1表示res不存在
    if (list.indexOf(res) == -1) {
      this.data.previewImgList.push(res)
    }
    wx.previewImage({
      current: res, // 当前显示图片的http链接
      urls: that.data.previewImgList // 需要预览的图片http链接列表
    })
  },
  //聊天消息始终显示最底端
  bottom() {
    var query = wx.createSelectorQuery()
    query.select('#flag').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      wx.pageScrollTo({
        scrollTop: res[0].bottom // #the-id节点的下边界坐标
      })
      res[1].scrollTop // 显示区域的竖直滚动位置
    })
  }
})