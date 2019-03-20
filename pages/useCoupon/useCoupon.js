// pages/useCoupon/useCoupon.js
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
const app = getApp();
Page({
  data: {
    couponList: [],
    onBottom: true,
    page: 1
  },
  onLoad(op) {
    this.setData({
      price: op.price,
      id:op.id,
      index:op.index
    })
    this.couponList(1, op.price,op.id)
    main.uploadFormIds();
  },
  chooseCoupon(e) {
    let type = e.currentTarget.dataset.type;
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2]; //上一个页面
    let list = prevPage.data.goodsList;
    let index = this.data.index;
    if (type == 0) {
      list[index].coupon_sum = 0;
      list[index].coupon_id = 0;
    } else {
      let coupon = e.currentTarget.dataset.coupon;
      let id = e.currentTarget.dataset.id;
      let isdiscount = e.currentTarget.dataset.isdiscount;
      list[index].coupon_sum = coupon;
      list[index].coupon_id = id;
      list[index].isdiscount = isdiscount;
    }
    prevPage.setData({
      goodsList: list,
      couponBack:1,
      coupon_index: index
    })
    wx.navigateBack();
  },
  onReachBottom() {
    var that = this;
    // 当前页+1
    var page = that.data.page + 1;
    that.setData({
      page: page
    })
    if (this.data.onBottom) {
      this.couponList(this.data.page, this.data.orderPrice)
    }
  },
  couponList(page, price,id) {
    wx.showLoading({
      title: '加载中'
    });
    var list = this.data.couponList;
    var token = app.globalData.token;
    util.http('order/useCoupon', { size: 10, page: page, orderPrice: price, store_id:id}, 'post', token).then(res => {
      if (res.code == 200) {
        if (res.data.data != '') {
          for (let item of res.data.data) {
            list.push(item)
          }
          this.setData({
            couponList: list
          })
        } else {
          this.data.onBottom = false;
        }
        wx.hideLoading();
      }
    })
  }
})