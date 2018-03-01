var util = require('../../utils/util.js'),
  config = require('../../utils/config.js');

Page({
    data: {
      config: config,
      city_picker_index: 0,
      city_array: ['杭州市'],
    },

    onLoad: function (options) {

    },

    onShow: function() {
      this.setData({
        city: getApp().globalData.city
      });
      this.getLocation();
      this.listAd();
      this.listShopCate();
    },

    onShareAppMessage: function () {
    },
    
    getLocation: function(){
        var that = this;

        if(this.data.city){
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

    listAd: function(){
        var that = this;
        util.ajax({
            url: util.getApiUrl("weixinapp/listAd"),
            data: {
                ad_position: 1
            }
        }, function (data) {
            that.setData({
                adList: data
            });
        });
    },

    listShopCate: function () {
        var that = this;
        util.ajax({
            url: util.getApiUrl("weixinapp/listShopCate"),
            data: {
                shop_type: 1
            }
        }, function (data) {
            // 添加一个全部
            data.unshift({});

            // 分页（10个分一页）
            var rlt = [], child = [];
            for(var i = 0; i < data.length; i++){
                var item = data[i];
                child.push(item);

                if ((i + 1) % 10 == 0){
                    rlt.push(child);
                    child = [];
                }
            }
            if (child.length > 0){
                rlt.push(child);
            }

            that.setData({
                cateList: rlt
            });
        });
    },

    listNeerbyShop: function(){
        var that = this;
        util.ajax({
            url: util.getApiUrl("weixinapp/listNearbyShop"),
            data: { 
                lat: that.data.location.latitude,
                lon: that.data.location.longitude,
                city_id: that.data.city.city_id,
                pageIndex: 0,
                pageSize: 20
            }
        }, function (data) {
            if(data.count){
              for (var i in data.list) {
                data.list[i].distance = data.list[i].distance ? data.list[i].distance.toFixed(1): null;
              }
            }
            that.setData({
                nearShopTitle: data.list.slice(0,5),
                nearShop: data.list,
                nearShopCount: data.count
            });
        });
    },

    toShop: function(e){
        var shopid = e.currentTarget.dataset.shopid;
        wx.navigateTo({
            url: "/pages/shop/shop?shopid=" + shopid
        });
    },

    toCate: function(e){
        var cateid = e.currentTarget.dataset.cateid;
        if (!cateid){
            wx.navigateTo({
                url: "/pages/cate/cate?shop_type=1"
            });
        } else {
            wx.navigateTo({
                url: "/pages/search/search?shop_cate_id=" + cateid
            });
        }
    },

    doSearch: function(e){
        var searchString = e.detail.value;
        if (!searchString) return;

        wx.navigateTo({
            url: "/pages/search/search?searchString=" + searchString
        });
    },

    changeCity: function(){
      wx.navigateTo({
        url: "/pages/city/city"
      });
    }
})