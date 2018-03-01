var util = require('../../utils/util.js'),
  config = require('../../utils/config.js');

Page({
    data: {
        pageIndex: 0,
        pageSize: 15,
        list: [],
        loadall: false,
        config:config
    },

    onLoad: function (options) {
        this.setSize();
        this.listShopCate();
    },

    onShow: function(){
      this.setData({
        pageIndex: 0,
        pageSize: 15,
        list: [],
        loadall: false
      });
      this.setData({
        city: getApp().globalData.city
      });
      this.getLocation();
    },

    setSize: function(){
        var res = wx.getSystemInfoSync();
        this.setData({
            windowWidth: res.windowWidth
        });
    },

    listShopCate: function () {
        util.ajax({
            url: util.getApiUrl("weixinapp/listShopCate"),
            data: {}
        }, function (data) {
            this.setData({
                cateList: data
            });
        }, this);
    },

    getLocation: function () {
      var that = this;

      if (this.data.city) {
        // 获取附件店铺
        wx.getLocation({
          success: function (res) {
            that.setData({
              location: res
            });

            that.listNeerbyShop();
          }
        });
      } else {
        util.ajax({
          url: util.getApiUrl("weixinapp/getUserCity"),
          data: {}
        }, function (data) {
          that.setData({
            city: data
          });

          // 获取附件店铺
          wx.getLocation({
            success: function (res) {
              that.setData({
                location: res
              });

              that.listNeerbyShop();
            }
          });
        });
      }
    },

    listNeerbyShop: function () {
        if (this.data._loading) return;
        this.data._loading = true;
        
        util.ajax({
            url: util.getApiUrl("weixinapp/listNearbyShop"),
            data: {
                lat: this.data.location.latitude,
                lon: this.data.location.longitude,
                city_id: this.data.city.city_id,
                shop_cate_id: this.data.shop_cate_id,
                pageIndex: 0,
                pageSize: 20
            }
        }, function (data) {
            data = data.list;
            for (var i in data) {
                data[i].distance = data[i].distance ? data[i].distance.toFixed(1) : null;
            }

            if (data.length > 0) {
                var list = this.data.list;
                util.append(list, data);
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

    doSearch: function (e) {
        this.setData({
            pageIndex: 0,
            pageSize: 15,
            list: [],
            loadall: false,
            shop_cate_id: e.currentTarget.dataset.cateid
        });
        this.listNeerbyShop();
    },

    onReachBottom: function () {
        if (this.data.loadall) return;

        this.data.pageIndex++;
        this.listNeerbyShop();
    },

    toShop: function (e) {
        var shopid = e.currentTarget.dataset.shopid;
        wx.navigateTo({
            url: "/pages/shop/shop?shopid=" + shopid
        });
    }
})