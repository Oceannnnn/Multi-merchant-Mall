// pages/orderDetails/orderDetails.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {},
  onLoad(op) {
    if (op.refund) {
      this.setData({
        refund: op.refund
      })
    }
    if (op.id) {
      this.setData({
        id: op.id
      })
    }
    this.init(op.id)
    main.uploadFormIds();
  },
  init(id) {
    let token = app.globalData.token;
    util.http('order/after_sale_detail', {
      id: id
    }, 'post', token).then(res => {
      if (res.code == 200) {
        this.setData({
          info: res.data
        })
      }
    })
  },
  revoke(e) {
    let id = e.currentTarget.dataset.id;
    let token = app.globalData.token;
    let that = this;
    wx.showModal({
      content: '撤销后无法再申请退款',
      confirmColor: '#E83D3A',
      success(res) {
        if (res.confirm) {
          util.http('order/repeal', {
            id: id
          }, 'post',token).then(res => {
            if (res.code == 200) {
              wx.showToast({
                title: '撤销成功',
                icon: 'success'
              })
              setTimeout(() => {
                that.init(id)
              }, 500)
            }
          })
        }
      }
    })
  },
  courier(e) {
    main.toDetails(e, "courier");
  },
  onUnload() {
    if (this.data.refund) {
      wx.reLaunch({
        url: '../index/index',
      })
    }
  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.init(this.data.id);
    setTimeout(function() {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1500);
  }
})