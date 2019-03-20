//app.js
const util = require('utils/util.js');
App({
  onLaunch: function (op) {
    this.init() 
  },
  globalData: {
    userInfo: null,
    state:0,
    phone:"",
    token:'',
    distributor:0,
    balance:0,
    integral: 0,
    globalFormIds: []
  },
  init() {
    if (wx.getStorageSync('httpClient')) {
      this.globalData.state = wx.getStorageSync('httpClient').state;
      this.globalData.userInfo = wx.getStorageSync('httpClient').userInfo;
      this.globalData.distributor = wx.getStorageSync('httpClient').distributor;
    }
    if (wx.getStorageSync('distributor')) this.globalData.distributor = wx.getStorageSync('distributor')
    if (wx.getStorageSync('token')) this.globalData.token = wx.getStorageSync('token')
    if (wx.getStorageSync('member')) {
      this.globalData.balance = wx.getStorageSync('member').balance
      this.globalData.integral = wx.getStorageSync('member').integral
    }
  }
})