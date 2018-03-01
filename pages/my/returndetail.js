var util = require('../../utils/util.js'),
  config = require('../../utils/config.js');

Page({
  data: {
    config: config
  },

  onLoad: function (options) {
    this.data.order_id = options.order_id;
  },

  onShow: function () {
    this.getOrderLastReturn();
  },

  getOrderLastReturn: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/getOrderLastReturn"),
      data: {
        order_id: this.data.order_id,
      }
    }, function (data) {
      data.total_money = data.itemList.reduce(function (a, b) { return a + b.buy_count*b.sku_price; }, 0);
      this.setData({
        returnInfo: data
      });
    }, this);
  },

  cancelOrderReturn: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/cancelOrderReturn"),
      data: {
        order_id: this.data.order_id,
        order_return_id: this.data.returnInfo.order_return_id
      }
    }, function (data) {
      wx.navigateBack({
        delta: 1
      });
    }, this);
  },

  toApplyReturn: function () {
    var order_id = this.data.order_id;
    wx.navigateTo({
      url: "/pages/my/applyreturn?order_id=" + order_id
    });
  }
})