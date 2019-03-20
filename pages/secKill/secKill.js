// pages/secKill/secKill.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {},
  onLoad(op) {
    main.uploadFormIds();
  },
  onShow() {
    this.setData({
      isSecKill: 1,
      secKillList: [],
      page: 1,
      onBottom: true,
      show: 0,
      timer:null
    })
    this.times();
  },
  times() {
    util.http('promotion/sec_nav', {}, 'get').then(res => {
      if (res.code == 200) {
        this.setData({
          HeaderList: res.data.item,
          status:1
        })
        this.countDown(res.data.time)
        for (var i = 0; i < res.data.item.length; i++) {
          if (res.data.item[i].status == 1) {
            this.setData({
              seckilltime: "a" + res.data.item[i].timestamp,
            })
            this.secKillList(1, res.data.item[i].timestamp)
          }
        }
      }
    })
  },
  toList(e) {
    let timestamp = e.currentTarget.dataset.timestamp;
    let status = e.currentTarget.dataset.status;
    this.setData({
      currentId: timestamp,
      show: 1,
      seckilltime: "a" + timestamp,
      page: 1,
      secKillList: [],
      status: status
    })
    this.secKillList(1, timestamp);
  },
  secKillList(page, timestamp){
    let json = {
      size: 10,
      page: page,
      timestamp: timestamp
    }
    let list = this.data.secKillList;
    util.http('promotion/sec_list', json, 'post').then(res => {
      if (res.code == 200) {
        if (res.data.data != '') {
          for (let item of res.data.data) {
            list.push(item)
          }
          this.setData({
            secKillList: list
          })
        } else {
          if (page > 1) {
            this.data.onBottom = false;
          }
        }
      }
    })
  },
  onReachBottom() {
    let page = this.data.page + 1;
    this.setData({
      page: page
    })
    if (this.data.onBottom) {
      this.secKillList(this.data.page, this.data.currentId);
    }
  },
  countDown(times) {
    let _this = this;
    let timer = _this.data.timer;
    timer = setInterval(function () {
      times--
      let time = main.countDown(times, 0)
      let h = time.split(":")[0];
      let m = time.split(":")[1];;
      let s = time.split(":")[2];
      _this.setData({
        h: h,
        m: m,
        s: s
      })
      if (times <= 0) {
        clearInterval(timer);
        _this.times();
        _this.secKillList(1)
      }
    }, 1000);
    _this.setData({
      timer: timer
    })
  },
  details(e) {
    main.toDetails(e, "goodsDetails")
  },
  onHide() {
    clearInterval(this.data.timer);
  },
  onShareAppMessage() {
    let invite_code = ""
    if (wx.getStorageSync("invite_code")) {
      invite_code = wx.getStorageSync("invite_code");
    }
    return {
      title: '分享不仅仅是一种生活，更是收获',
      path: '/pages/index/index?invite_code=' + invite_code
    }
  }
})