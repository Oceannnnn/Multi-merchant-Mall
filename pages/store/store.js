// pages/store/store.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    currentId: 0,
    itemsList: [],
    page: 1,
    onBottom: true,
  },
  onLoad(op) {
    this.setData({
      id:op.id,
      tabTxt: [
        {
          name: '销量',
          tab: 0,
          type: "sales"
        },
        {
          name: '最新',
          tab: 1,
          type: "time"
        },
        {
          name: '价格',
          tab: 2,
          type: "price_asc"
        },
        {
          name: '人气',
          tab: 3,
          type: "collect"
        }]
    })
    this.init(op.id)
    this.itemsList(op.id, 1, "sales");
  },
  init(id) {
    let token = app.globalData.token;
    util.http("store/info", {id:id}, 'post', token).then(res => {
      if (res.code == 200) {
        this.setData({
          info:res.data,
          collect: res.data.is_collect,
          store_collect: res.data.store_collect
        })
        wx.setNavigationBarTitle({
          title: res.data.store_name
        })
      }
    })
  },
  contentBtn(e) {
    let fromid = e.currentTarget.dataset.fromid;
    let toid = e.currentTarget.dataset.toid;
    wx.navigateTo({
      url: '../chat/chat?&fromid=' + fromid + '&toid=' + toid
    })
  },
  collageSore(e) {//收藏店铺
    if (app.globalData.userInfo) {
      let token = app.globalData.token;
      let collect = e.currentTarget.dataset.collectstore;
      let id = e.currentTarget.dataset.id;
      let store_collect = this.data.store_collect
      this.setData({
        collect: !this.data.collect
      })
      if (collect == 1) {
        store_collect = store_collect - 1
      } else {
        store_collect = store_collect + 1
      }
      this.setData({
        store_collect: store_collect
      })
      util.http('store/collect_store', { id: id }, 'post', token).then(res => { })
    } else {
      main.goLogin(1)
    }
  },
  filterTab(e) {
    let tab = e.currentTarget.dataset.tab;
    let triangle = this.data.triangle;
    let type = e.currentTarget.dataset.type;
    let tabTxt = this.data.tabTxt;
    if (tab == 2) {
      this.setData({
        triangle: 0,
      })
      tabTxt[2].type = "price_desc";
      if (triangle == 0) {
        triangle = 1;
        tabTxt[2].type = "price_asc";
      } else {
        triangle = 0;
        tabTxt[2].type = "price_desc";
      }
    } else {
      triangle = 3;
    }
    this.setData({
      tabTxt: tabTxt,
      currentId: tab,
      triangle: triangle,
      itemsList: [],
      page: 1,
      onBottom: true,
      type: type
    })
    this.itemsList(this.data.id, 1, type);
  },
  details(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    main.toDetails(e, "goodsDetails")
  },
  onReachBottom() {
    let page = this.data.page + 1;
    this.setData({
      page: page
    })
    if (this.data.onBottom) {
      this.itemsList(this.data.id, this.data.page, this.data.type);
    }
  },
  itemsList(id, page, type) {
    let json = {
      store_id: id,
      size: 10,
      page: page,
      type: type
    }
    let list = this.data.itemsList;
    let isRebate = this.data.isRebate;
    util.http("store/goods_list", json, 'post').then(res => {
      if (res.code == 200) {
        if (res.data.data != '') {
          for (let item of res.data.data) {
            list.push(item)
          }
          this.setData({
            itemsList: list
          })
        } else {
          if (page > 1) {
            this.data.onBottom = false;
          }
        }
      }
    })
  },
  onShareAppMessage() {
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1];
    let url = "/" + currentPage.route;
    return {
      title: '分享不仅仅是一种生活，更是收获',
      path: url
    }
  }
})