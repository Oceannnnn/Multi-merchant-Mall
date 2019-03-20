// pages/classify/classify.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    curIndex: 0
  },
  onLoad(op) {
    this.init(op.id)
    main.uploadFormIds();
  },
  init(id) {
    util.http('store/category', {
      store_id: id
    }, 'post').then(res => {
      if (res.code == 200) {
        if (res.data != '') {
          this.setData({
            navLeftItems: res.data,
            navRightItems: res.data,
            curNav: res.data[0].sc_id
          })
        }
      }
    })
  },
  toList(e) {
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    this.setData({
      curNav: id,
      curIndex: index
    })
  },
  listPage(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    main.toDetails(e, "listPage")
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