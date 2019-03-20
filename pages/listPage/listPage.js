// pages/listPage/listPage.js// index/list.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    currentId:0,
    itemsList: [],
    page: 1,
    onBottom: true,
    triangle:3,
    type:""
  },
  onLoad(op){
  console.log(op)
    let id = op.id;
    let isRebate = op.type;//0非折扣入口，1折扣入口,2为大分类
    if (op.name) {
      wx.setNavigationBarTitle({
        title: op.name,
      })
    }else{
      wx.setNavigationBarTitle({
        title: "商品列表",
      })
    }
    this.setData({
      shop_id:id,
      isRebate:isRebate,
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
    this.itemsList(id, 1, "sales");
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
    this.itemsList(this.data.shop_id,1,type);
  },
  details(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    main.toDetails(e, "goodsDetails")
  },
  onReachBottom: function () {
    let page = this.data.page + 1;
    this.setData({
      page: page
    })
    if (this.data.onBottom) {
      this.itemsList(this.data.shop_id, this.data.page,this.data.type);
    }
  },
  itemsList(id,page,type){
    let json = {
      id:id,
      size:10,
      page:page,
      type:type
    }
    let list = this.data.itemsList;
    let isRebate = this.data.isRebate;
    let url = "home/goods_list";
    if (isRebate==1){
      url = "home/dis_goods";
    } else if (isRebate == 2) {
      url = "home/cate_goods";
    }
    util.http(url, json, 'post').then(res => {
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
  goTop() {//回到顶部
    if (wx.pageScrollTo) {
      wx.pageScrollTo({ scrollTop: 0 })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  // 获取滚动条当前位置 
  onPageScroll(e) {
    if (e.scrollTop > 300) {
      this.setData({ floorstatus: true });
    } else {
      this.setData({ floorstatus: false });
    }
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
