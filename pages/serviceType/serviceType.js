// pages/serviceType/serviceType.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {},
  onLoad(op) {
    this.setData({
      id: op.id,
      order_id: op.order_id,
      type:op.type//tyoe:1 退货退款/2为投诉
    })
    let list = [];
    if (op.type == 1){
      list = [{
        icon:"tuikuanshouhou",
        head:"仅退款",
        text:"未收到货（包含未签收）",
        type:2
      }, {
        icon: "tianmaojisutuikuan",
        head: "退货退款",
        text: "已收到货，需要退换已收到的货物",
        type: 3
      }]
    } else {
      list = [{
        icon: "tousu1",
        head: "发货问题（基础投诉）",
        text: "缺货/错发/漏发/少发等...",
        type: 0
      }]
    }
    this.setData({
      list: list
    })
  },
  toNext(e) {
    let type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: '../refund/refund?type=' + type + '&id=' + this.data.id + '&order_id=' + this.data.order_id
    })
  }
})