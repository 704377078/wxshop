var util = require('../../utils/util.js');

Page({

  data: {
  },

  onLoad: function (options) {
    this.listCity();
  },

  chooseCity: function (e) {
    var city_id = e.currentTarget.dataset.cityid;
    var city_name = e.currentTarget.dataset.cityname;
    getApp().globalData.city = {"city_id":city_id,"city_name":city_name}
    wx.navigateBack();
  },

  listCity: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/listShopCity"),
      data: {
        ad_position: 1
      }
    }, function (data) {
      this.setData({
        cityList: data
      });
    }, this);
  }
})