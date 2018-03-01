var util = require('../../utils/util.js'),
  config = require('../../utils/config.js');

Page({
  data: {
    picker_index: 0,
    config: config
  },

  onLoad: function (options) {
    this.listShop(1);
  },

  pickerChange: function (e) {
    var picker_index = e.currentTarget.dataset.index;
    this.setData({
      picker_index: picker_index
    });

    if (picker_index == 0) { // 收藏的店铺
      this.listShop(1);
    } else if (picker_index == 1) {
      this.listShop(2);
    } else if (picker_index == 2) {
      this.listItem();
    }
  },

  getLocation: function (callback) {
    if (this.data.location) {
      callback && callback.call(this);
      return;
    }

    var that = this;
    wx.getLocation({
      success: function (res) {
        that.data.location = res;
        callback && callback.call(that);
      }
    });
  },

  listShop: function (shopType) {
    this.getLocation(function () {
      util.ajax({
        url: util.getApiUrl("weixinapp/listUserFavoriteShop"),
        data: {
          shop_type: shopType,
          lat: this.data.location.latitude,
          lon: this.data.location.longitude
        }
      }, function (data) {
        for (var i in data) {
          if (data[i].distance)
            data[i].distance = data[i].distance.toFixed(1);
        }
        this.setData({
          shopList: data
        });
      }, this);
    });
  },

  listItem: function (shopType) {
    util.ajax({
      url: util.getApiUrl("weixinapp/listUserFavoriteItem"),
      data: {}
    }, function (data) {
      this.setData({
        itemList: data
      });
    }, this);
  },

  toItem: function (e) {
    var itemid = e.currentTarget.dataset.itemid;
    wx.redirectTo({
      url: "/pages/item/item?itemid=" + itemid
    });
  },

  toShop: function (e) {
    var shop_id = e.currentTarget.dataset.shopid;
    wx.redirectTo({
      url: "/pages/shop/shop?shopid=" + shop_id
    });
  }
})