// pages/confirmationOrder/confirmationOrder.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    goodsList: [],
    coupon_num:0,
    coupon:0,
    coupon_id:'',
    isdiscount:true,
    couponBack:0,
    balance: 0,
    payMethod: 0,
    balanceUse:2,
    addressId:0
  },
  onLoad(op) {
    this.setData({
      type:op.type
    })
    this.init()
    main.uploadFormIds();
  },
  onShow() {
    if (this.data.couponBack == 1) {
      this.count(this.data.coupon_index);
    }
  },
  init(){
    let orderData = wx.getStorageSync('orderData');
    this.setData({
      goodsList: orderData.orderInfo,
      balance: orderData.balance,
      tuan_id: orderData.group_id,
      info: orderData.info
    })
    if (orderData.info!=''){
      this.setData({
        location: orderData.info.address,
        addressId: orderData.info.id,
        name: orderData.info.name,
        phone: orderData.info.mobile
      })
    }
    let goodsList = orderData.orderInfo;
    let orderPrice = 0;
    for (var i = 0; i < goodsList.length; i++) {
      goodsList[i].status.sparePrice = goodsList[i].status.orderPrice;
      if (goodsList[i].status.postage > 0) {
        goodsList[i].status.orderPrice = goodsList[i].status.postage + goodsList[i].status.orderPrice;
      }
      orderPrice += goodsList[i].status.orderPrice;
      goodsList[i].status.allPrice = goodsList[i].status.orderPrice;
    }
    orderPrice = orderPrice.toFixed(2)
    this.setData({
      allPrice: orderPrice,
      orderPrice: orderPrice,
      goodsList: goodsList
    })

  },
  orderAddress(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    wx.navigateTo({
      url: '../myadd/myadd?isChoose=1',
    })
  },
  useCoupon(e) {
    let id = e.currentTarget.dataset.id;
    let price = e.currentTarget.dataset.price;
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '../useCoupon/useCoupon?price=' + price + '&id=' + id + '&index=' + index
    })
  },
  choosePay(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    let that = this;
    wx.showActionSheet({
      itemList: ['余额支付', '微信支付'],
      success(res) {
        let index = res.tapIndex;
        let payMethod = 0;
        let balanceUse = 2;
        if (index == 0) {
          payMethod = 1;
          balanceUse = 1;
        } else {
          payMethod = 0;
          balanceUse = 2;
        }
        that.setData({
          payMethod: payMethod,
          balanceUse: balanceUse
        })
      }
    })
  },
  calculation(balance) {
    let allPrice = this.data.allPrice;
    let orderPrice = this.data.allPrice;
    let diffPrice = balance - orderPrice;
    if (orderPrice < balance) {
      allPrice = orderPrice.toFixed(2);
    }else{
      allPrice = (orderPrice - balance).toFixed(2);
    }
    this.setData({
      allPrice: allPrice,
      orderPrice: allPrice
    })
  },
  count(index) {
    let list = this.data.goodsList; 
    let allPrice = this.data.allPrice;
    let orderPrice = this.data.orderPrice;
    if (list[index].coupon_sum != 0) {
      if (!list[index].isdiscount) {
        list[index].status.orderPrice = (Number(list[index].status.allPrice) - Number(list[index].coupon_sum)).toFixed(2);
      } else {
        list[index].status.orderPrice = ((list[index].status.sparePrice * (list[index].coupon_sum / 10)) + list[index].status.postage).toFixed(2);
      }
    }else{
      list[index].status.orderPrice = (list[index].status.sparePrice + list[index].status.postage).toFixed(2);
    }
    let all = 0;
    for (var i = 0; i < list.length; i++) {
      all += Number(list[i].status.orderPrice);
    }
    allPrice = all.toFixed(2);
    this.setData({
      goodsList: list,
      allPrice: allPrice
    })
  },
  comfirm(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    let info = this.data.info;
    if (info == ''){
      wx.showToast({
        title: '请选择你的地址',
        icon:'none',
        duration:1000
      })
      return
    }
    let allPrice = Number(this.data.allPrice);
    let balance = Number(this.data.balance);
    let payMethod = this.data.payMethod;
    if (payMethod == 1) {
      if (balance < allPrice) {
        wx.showToast({
          title: '余额不足',
          icon: 'none',
          duration: 1000
        })
        this.setData({
          payMethod: 0
        })
        return
      }
    }
    this.setData({
      disabled: true
    })
    var token = app.globalData.token;
    // let balance = 0;
    let address = this.data.addressId;
    let balanceUse = this.data.balanceUse;
    let list = this.data.goodsList; 
    let coupon = [];
    for (var i = 0; i < list.length; i++) {
      let json = {};
      if (list[i].coupon_id == undefined) {
        list[i].coupon_id = 0;
      }
      json.id = list[i].coupon_id;
      json.store_id = list[i].store_id;
      coupon.push(json)
    }
    coupon = JSON.stringify(coupon)
    let json = {
      address: address,
      coupon: coupon,
      balance: balanceUse,//1为余额，2微信
      type:this.data.type,//2为拼团，0为其他
      group_id: this.data.tuan_id
    }
    util.http('order/place', json, 'post', token).then(res => {
      if (res.code == 200) {
        let payType = res.data.payType;
        let order_id = res.data.order_id;
        let id = res.data.id;
        this.pay(order_id, id, token, payType)
      }
    })
  },
  pay(order_id, id, token, payType) {
    let that = this;
    let url = ""
    if (payType == 1) {
      url = "pay/balancePay"
    } else {
      url = "pay/wx_pay"
    }
    util.http(url, { order_id: order_id }, 'post', token).then(res => {
      let payResults = 0;
      if (payType == 1) {
        if (res.code == 200) {
          that.setData({
            disabled: false
          })
          payResults = 1;
        } else {
          payResults = 0;
        }
        setTimeout(() => {
          wx.reLaunch({
            url: '../payResults/payResults?payResults=' + payResults + '&id=' + id + '&status=' + that.data.type,
          })
        }, 500)
      } else {
        wx.requestPayment({
          'timeStamp': res.timeStamp,
          'nonceStr': res.nonceStr,
          'package': res.package,
          'signType': res.signType,
          'paySign': res.paySign,
          'success': function (res) {
            that.setData({
              disabled: false
            })
            payResults = 1;
            setTimeout(() => {
              wx.reLaunch({
                url: '../payResults/payResults?payResults=' + payResults + '&id=' + id + '&status=' + that.data.type,
              })
            }, 500)
          },
          'fail': function (res) {
            that.setData({
              disabled: false
            })
            payResults = 0;
            setTimeout(() => {
              wx.reLaunch({
                url: '../payResults/payResults?payResults=' + payResults + '&id=' + id + '&status=' + that.data.type,
              })
            }, 500)
          }
        })
      }
    })
  }
})