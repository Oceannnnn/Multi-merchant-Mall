// pages/coupons/coupons.js
const app = getApp();
const util = require('../../utils/util.js');
Page({
  data: {
    index: -1
  },
  onLoad(op) {
    this.init(op.id)
  },
  init(id) {
    let token = app.globalData.token;
    util.http('order/after_sale_refund', {
      id: id
    }, 'post', token).then(res => {
      if (res.code == 200) {
        let hidden = 0;
        if (res.data.info.shipping_name!=''){
          hidden = 1
        }else{
          hidden = 0
        }
        this.setData({
          info: res.data,
          details: res.data.info,
          id: id,
          hidden: hidden
        })
      }
    })
  },
  bindshippingChange(e) {
    let value = e.detail.value;
    let shipping = this.data.info.shipping;
    let shipping_id = shipping[value].id;
    this.setData({
      index: value,
      shipping_id: shipping_id
    })
  },
  bindinput(e){
    this.setData({
      number: e.detail.value
    })
  },
  comfirm(){
    let id = this.data.id;
    let number = this.data.number;
    let shipping_id = this.data.shipping_id;
    if (!shipping_id){
      wx.showToast({
        title: '请选择物流公司',
        icon: 'none'
      })
      return
    } else if (!number){
      wx.showToast({
        title: '物流单号',
        icon: 'none'
      })
      return
    }
    let token = app.globalData.token;
    let json = {
      id:id,
      number: number,
      shipping_id: shipping_id
    }
    util.http('order/refund_add', json, 'post', token).then(res => {
      if (res.code == 200) {
        wx.showToast({
          title: '提交成功',
          icon:'success'
        })
        setTimeout(() => {
          this.init(id)
        }, 500)
      }
    })
  },
  bindtap() {
    this.setData({
      hidden: 0
    })
  }
})