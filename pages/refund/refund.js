// pages/refund/refund.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    imgbox: [],
    image: {},
    reasonsIndex: -1,
    goodsIndex: -1,
    explain: '',
    reason_id: ''
  },
  onLoad(op) {
    this.setData({
      id: op.id,
      type: op.type, //tyoe:1 代发货退款/2为仅退款  3为退货退款  0为投诉
      order_id: op.order_id,
      goodsState: [{
        text: "已收到货"
      }, {
        text: "未收到货"
      }]
    })
    if (op.type == 0) {
      wx.setNavigationBarTitle({
        title: "投诉"
      })
    }
    let status = 0;
    if (op.type == 1) {
      status = 3;
    } else if (op.type == 2) {
      status = 1;
    } else if (op.type == 3) {
      status = 2;
    } else if (op.type == 0) {
      status = 4;
    }
    this.init(status, op.id)
  },
  init(status, id) {
    let token = app.globalData.token;
    util.http('order/after_sale', {
      id: id,
      type: status
    }, 'post', token).then(res => {
      if (res.code == 200) {
        this.setData({
          detail: res.data.detail,
          reason: res.data.reason
        })
        if (status != 1) {
          this.setData({
            reasonsArray: res.data.reason
          })
        }
      }
    })
  },
  bindGoodsState(e) {
    let index = e.detail.value;
    let goodsIndex = this.data.goodsIndex;
    let reason = this.data.reason;
    let reasonsArray = [];
    if (index == 0) {
      reasonsArray = reason.is_delivery
    } else {
      reasonsArray = reason.un_delivery
    }
    this.setData({
      goodsIndex: index,
      reasonsArray: reasonsArray
    })
  },
  bindReasonsChange(e) {
    let index = e.detail.value;
    let reasonsArray = this.data.reasonsArray;
    let reason_id = reasonsArray[index].reason_id
    this.setData({
      reasonsIndex: index,
      reason_id: reason_id
    })
  },
  bindChange() {
    wx.showToast({
      title: '请选择货物状态',
      icon: 'none'
    })
  },
  bindTextarea(e) {
    let value = e.detail.value;
    this.setData({
      explain: value
    })
  },
  bindtap() {
    let reason_id = this.data.reason_id;
    let imgbox = JSON.stringify(this.data.imgbox);
    if (reason_id == '') {
      wx.showToast({
        title: '请选择原因',
        icon: 'none'
      })
      return
    }
    let type = this.data.type;
    let id = '';
    let url = '';
    if (type == 0) {
      id = this.data.order_id;
      url = 'order/complain';
    } else {
      id = this.data.id;
      url = 'order/add_refund';
    }
    let subtotal = this.data.detail.subtotal;
    let json = {
      id: id,
      explain: this.data.explain,
      reason_id: reason_id,
      imgbox: imgbox,
      subtotal: subtotal
    }
    let token = app.globalData.token;
    util.http(url, json, 'post', token).then(res => {
      if (res.code == 200) {
        wx.showToast({
          title: '请求成功',
          icon: 'none'
        })
        setTimeout(() => {
          if (type != 0) {
            wx.navigateTo({
              url: '../detailsRefund/detailsRefund?id=' + res.data.id + '&refund=1'
            })
          } else {
            wx.reLaunch({
              url: '../index/index'
            })
          }
        }, 500)
      }
    })
  },
  delImage(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    let card_id = this.data.id;
    let index = e.currentTarget.dataset.deindex;
    let imgbox = this.data.imgbox;
    imgbox.splice(index, 1);
    this.setData({
      imgbox: imgbox
    });
  },
  upload() {
    var imgbox = this.data.imgbox;
    var that = this;
    var n = 3;
    if (3 > imgbox.length > 0) {
      n = 3 - imgbox.length;
    } else if (imgbox.length == 3) {
      n = 1;
    }
    wx.chooseImage({
      count: n, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        // console.log(res.tempFilePaths)
        // 返回选定照片的本地文件路径列表，tempFilePat
        let tempFilePaths = res.tempFilePaths;
        that.uploadimg(tempFilePaths);
      }
    })
  },
  uploadimg(arr) {
    let token = app.globalData.token;
    let id = this.data.id;
    let imgbox = this.data.imgbox;
    if (imgbox == '') {
      imgbox = []
    }
    let image = this.data.image;
    for (var i = 0; i < arr.length; i++) {
      var that = this;
      wx.uploadFile({
        url: util.u + "order/uploads",
        filePath: arr[i],
        name: 'file[]', //这里根据自己的实际情况改,
        formData: {},
        header: {
          "Content-Type": "multipart/form-data",
          token: token
        }, //这里是上传图片时一起上传的数据
        complete: (res) => {
          i++; //这个图片执行完上传后，开始上传下一张
          let data = res.data;
          data = JSON.parse(data);
          let url = data.data;
          image['image'] = url;
          imgbox.push(image);
          image = {}
          that.setData({
            imgbox: imgbox
          });
          if (i >= arr.length) { //当图片传完时，停止调用    
            wx.showToast({
              title: '上传成功',
              icon: 'success'
            })
            return
          } else { //若图片还没有传完，则继续调用函数
            that.uploadimg(arr);
          }
        }
      });
    }
  }
})