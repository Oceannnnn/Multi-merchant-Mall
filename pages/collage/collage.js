// pages/collage/collage.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    collageList: [],
    HeaderList: [],
    page:1,
    onBottom:true
  },
  onLoad(op) {
    this.setData({
      type:op.type
    })
    wx.setNavigationBarTitle({
      title: op.name,
    })
    this.init(op.type)
    main.uploadFormIds();
  },
  init(type) {
    let url = '';
    if (type == 1){
      url = 'promotion/nine_category'
    } else {
      url = 'promotion/group_category'
    }
    util.http(url, {}, 'get').then(res => {
      if (res.code == 200) {
        if (res.data == '') return
        this.setData({
          HeaderList: res.data,
          currentId: res.data[0].id
        })
        this.collageList(res.data[0].id, 10, 1, type)
      }
    })
  },
  details(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    main.toDetails(e, "goodsDetails")
  },
  toList(e) {
    let id = e.currentTarget.dataset.id;
    let type = this.data.type;
    this.setData({
      currentId: id,
      collageList: [],
      page: 1,
      onBottom: true
    })
    this.collageList(id, 10, 1, type);
  },
  onReachBottom() {
    let page = this.data.page + 1;
    this.setData({
      page: page
    })
    if (this.data.onBottom) {
      this.collageList(this.data.currentId, 10, this.data.page, this.data.type);
    }
  },
  collageList(id, size, page, type) {
    let json = {
      id: id,
      size: size,
      page: page
    }
    let url = '';
    if (type == 1) {
      url = 'promotion/nine_list'
    } else {
      url = 'promotion/group_list'
    }
    let list = this.data.collageList;
    util.http(url, json, 'post').then(res => {
      if (res.code == 200) {
        if (res.data.data != '') {
          for (let item of res.data.data) {
            list.push(item)
          }
          this.setData({
            collageList: list
          })
        } else {
          if (page < 2) return
          this.data.onBottom = false;
        }
      }
    })
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