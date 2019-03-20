// pages/search/search.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    hidden: true,
    currentId:1,
    searchValue:'',
    searchHistory:[]
  },
  onLoad(options) {
    this.setData({
      HeaderList: [{
        name: "商品",
        id: 1
      }, {
        name: "店铺",
        id: 2
      }]
    })
    this.initData();
    this.searchHistory();
  },
  initData(){
    this.setData({
      onBottom: true,
      page: 1,
      list: []
    })
  },
  searchHistory() {
    let token = app.globalData.token;
    util.http('home/history_search', {}, 'get', token).then(res => {
      if (res.code == 200) {
        this.setData({
          searchHistory:res.data
        })
      }
    })
  },
  list(page) {
    let token = app.globalData.token;
    let json = {
      size: 10,
      page: page,
      keywords: this.data.searchValue,
      type: this.data.currentId
    }
    let list = this.data.list;
    util.http('home/search', json, 'post',token).then(res => {
      if (res.code == 200) {
        if (res.data.data != '') {
          for (let item of res.data.data) {
            list.push(item)
          }
          this.setData({
            list: list
          })
        } else {
          if (page > 1) {
            this.data.onBottom = false;
          }
        }
      }
    })
  },
  onReachBottom() {
    if (this.data.currentId == 2) {
      let page = this.data.page + 1;
      this.setData({
        page: page
      })
      if (this.data.onBottom) {
        this.list(this.data.good_id, this.data.page)
      }
    }
  },
  bindfocus() {
    if (this.data.hidden) {
      this.setData({
        hidden: !this.data.hidden
      })
    }
  },
  bindconfirm(e) {
    let value = e.currentTarget.dataset.value;
    if (value) {
      this.setData({
        searchValue: value
      })
    }
    if (this.data.searchValue != '') {
      this.initData();
      this.list(1);
    }else{
      wx.showToast({
        title: '请输入内容',
        icon:"none"
      })
    }
  },
  searchValue(e) {
    this.setData({
      searchValue: e.detail.value
    })
    if (e.detail.value==""){
      this.searchHistory();
    }
  },
  s_cancel(e) {
    if (!this.data.hidden) {
      this.setData({
        hidden: !this.data.hidden,
        searchValue: '',
        list: []
      })
      let formId = e.detail.formId;
      main.collectFormIds(formId);
      wx.navigateBack()
    }
  },
  details(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    main.toDetails(e, "goodsDetails")
  }, 
  toList(e) {
    let id = e.currentTarget.dataset.id;
    this.setData({
      currentId: id,
    })
    this.initData();
    if (this.data.searchValue != "") {
      this.list(1);
    }
  },
  toStore(e){
    main.toDetails(e, "store")
  }
})