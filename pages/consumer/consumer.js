// pages/consumer/consumer.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    couponList: [],
    page: 1,
    onBottom: true
  },
  onLoad (op) {
    this.setData({
      id:op.id
    })
    this.couponList(1)
    main.uploadFormIds();
  },
  onReachBottom() {
    let page = this.data.page + 1;
    this.setData({
      page: page
    })
    if (this.data.onBottom) {
      this.couponList(this.data.page, this.data.id);
    }
  },
  couponList(page) {
    let json = {
      size: 10,
      page: page,
      store_id:this.data.id
    }
    let list = this.data.couponList;
    let token = app.globalData.token;
    util.http('promotion/store_coupon', json, 'post', token).then(res => {
      if (res.code == 200) {
        for (let item of res.data.data) {
          list.push(item)
        }
        this.setData({
          couponList: list
        })
      } else {
        if (page > 1) {
          this.data.onBottom = false;
        }
      }
    })
  },
  toVoucher(e) {
    let couponList = this.data.couponList;
    let id = e.currentTarget.dataset.coupon_id;
    let index = e.currentTarget.dataset.index;
    if (app.globalData.userInfo) {
      let token = app.globalData.token;
      util.http('promotion/get_coupon', { id: id }, 'post', token).then(res => {
        if (res.code == 200) {
          couponList[index].status = 1;
          this.setData({
            couponList: couponList
          })
          main.toVoucher()
        }
      })
    } else {
      main.goLogin(1)
    }
  }
})