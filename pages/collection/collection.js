// pages/collection/collection.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    page: 1,
    onBottom: true,
    currentId: 1,
    collectionList:[]
  },
  onLoad() {
    let HeaderList = [{
      name: "宝贝",
      id: 1
    }, {
      name: "店铺",
      id: 2
    }]
    this.setData({
      HeaderList: HeaderList
    })
    this.collectionList(1,1)
    main.uploadFormIds();
  },
  onReachBottom() {
    var page = this.data.page + 1;
    this.setData({
      page: page
    })
    if (this.data.onBottom) {
      this.collectionList(this.data.page, this.data.currentId)
    }
  },
  toList(e) {
    let id = e.currentTarget.dataset.id;
    this.setData({
      currentId: id,
      page: 1,
      onBottom: true,
      collectionList: []
    })
    this.collectionList(1, id)
  },
  collectionList(page, type){
    wx.showLoading({
      title: '加载中'
    });
    var list = this.data.collectionList;
    let token = app.globalData.token
    util.http('user/collect', { size: 10, page: page, type: type}, 'post',token).then(res => {
      if (res.code == 200) {
        if (res.data.data != '') {
          for (let item of res.data.data) {
            list.push(item)
          }
          this.setData({
            collectionList: list
          })
        } else {
          if (page > 1) {
            this.data.onBottom = false;
          }
        }
      }
    })
    wx.hideLoading()
  },
  toStore(e) {
    main.toDetails(e, "store")
  },
  collectionStore(e) {//取消收藏店铺
    let index = e.currentTarget.dataset.index;
    let id = e.currentTarget.dataset.id;
    let collectionList = this.data.collectionList;
    let token = app.globalData.token;
    collectionList.splice(index, 1);
    this.setData({
      collectionList: collectionList
    })
    util.http('store/collect_store', { id: id }, 'post', token).then(res => { })
  },
  goodsDetails(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    main.toDetails(e,"goodsDetails")
  }
})