var util = require('../../utils/util.js'),
  config = require('../../utils/config.js');

Page({
  data: {
    tab: 1,
    config: config
  },

  onLoad: function (options) {
    this.getLocation();
    this.listRecommendRank();
    this.getRecommendRank();
    this.setData({
      user_id: options.user_id
    });
  },

  getLocation: function () {
    var that = this;
    wx.getLocation({
      success: function (res) {
        that.data.location = res;
        that.listRecommendShop();
      }
    });
  },

  onReachBottom: function () {
    if (this.data.loadall) return;

    this.data.pageIndex++;
    this.listRecommendShop();
  },

  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      return {
        title: '优价通',
        path: '/pages/settle/type?user_id=' + this.data.user_id,
        imageUrl: '/images/logo.png'
      }
    }
  },

  listRecommendShop: function () {
    if (this.data._loading) return;
    this.data._loading = true;
    util.ajax({
      url: util.getApiUrl("weixinapp/listRecommendShop"),
      data: {
        lat: this.data.location.latitude,
        lon: this.data.location.longitude,
        pageIndex: 0,
        pageSize: 20
      }
    }, function (data) {
      console.log(data)
      if (!data.list.length) return;
      var dataList = data.list;
      console.log(dataList)
      for (var i in dataList) {
        if (dataList[i].distance)
          dataList[i].distance = dataList[i].distance.toFixed(1);
      }

      if (dataList.length > 0) {
        var list = this.data.list||[];
        util.append(list, dataList);
        this.setData({
          list: list
        });
      }
      else {
        this.setData({
          loadall: true
        });
      }

      this.data._loading = false;
    }, this);
  },

  listRecommendRank:function(){
    util.ajax({
      url: util.getApiUrl("weixinapp/listRecommendRank"),
      data: {
        pageIndex: 0,
        pageSize: 20
      }
    }, function (data) {
      if(!data)return;
      this.setData({
        rankList: data.list
      });
    }, this);
  },

  getRecommendRank:function(){
    util.ajax({
      url: util.getApiUrl("weixinapp/getRecommendRank"),
      data: {}
    }, function (data) {
      this.setData({
        myRank: data
      });
    }, this);
  },

  toShop: function (e) {
    var shopid = e.currentTarget.dataset.shopid;
    wx.navigateTo({
      url: "/pages/shop/shop?shopid=" + shopid
    });
  },

  changeTab: function (e) {
    var tab = e.currentTarget.dataset.tab;
    if (tab != this.data.tab) {
      this.setData({
        tab: tab
      });
    }
  }
})