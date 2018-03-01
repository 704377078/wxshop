var util = require('../../utils/util.js'),
  config = require('../../utils/config.js');

Page({
  data: {
    config: config
  },

  onLoad: function (options) {
    this.setData({
      order_id: options.order_id
    });
  },

  onShow: function(){
    this.getOrder();
    this.listExpressTraces();
  },

  getOrder: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/getOrder"),
      data: {
        order_id: this.data.order_id,
        order_type: 1
      }
    }, function (data) {
      data.left_time = util.getLeftTime(data.create_time,1);
      //判断是否可以退货
      data.can_return = data.itemList.filter(item => item.return_status != 1 && item.return_status != 2).length > 0;
      this.setData({
        order: data
      });
    }, this);
  },

  delOrder: function () {
    var that = this;
    wx.showModal({
      title: "取消订单",
      content: "确定取消订单吗？",
      success: function (res) {
        if (!res.confirm) return;

        util.ajax({
          url: util.getApiUrl("weixinapp/delOrder"),
          data: {
            order_id: that.data.order_id
          }
        }, function (data) {
          wx.navigateBack({
            delta: 1
          });
        }, that);
      }
    });
  },

  goPay: function () {
    var order_id = this.data.order.order_id;
    wx.navigateTo({
      url: "/pages/pay/order?order_id=" + order_id
    });
  },

  toApplyReturn: function () {
    var order_id = this.data.order.order_id;
    wx.navigateTo({
      url: "/pages/my/applyreturn?order_id=" + order_id
    });
  },

  toGrade: function (e) {
    var order_id = this.data.order.order_id;
    var item_id = e.currentTarget.dataset.itemid || '';
    wx.navigateTo({
      url: "/pages/my/grade?order_id=" + order_id + "&item_id=" + item_id
    });
  },

  toReturnDetail: function () {
    var order_id = this.data.order.order_id;
    wx.navigateTo({
      url: "/pages/my/returndetail?order_id=" + order_id
    });
  },

  toLogistics: function () {
    var order_id = this.data.order.order_id;
    wx.navigateTo({
      url: "/pages/my/logistics?order_id=" + order_id
    });
  },

  confirmReceipt: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/confirmReceipt"),
      data: {
        order_id: this.data.order_id,
      }
    }, function (data) {
      this.onShow();
    }, this);
  },

  copyOrderNo: function () {
    wx.setClipboardData({
      data: this.data.order.order_no,
      success: function (res) {
        wx.showToast({
          title: '订单编号已复制',
        })
      }
    });
  },

  listExpressTraces: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/listExpressTraces"),
      data: {
        order_id: this.data.order_id
      }
    }, function (data) {
      var expressInfo = '暂无物流信息'
      if(data.length){
        expressInfo = data.pop().AcceptStation
      }
      this.setData({
        expressInfo: expressInfo
      });
    }, this);
  }

})