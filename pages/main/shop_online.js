var util = require('../../utils/util.js'),
  config = require('../../utils/config.js');

Page({
    data: {
      config: config
    },

    onLoad: function (options) {
        this.listAd();
        this.listShopCate();
    },

    onShow: function(){
      this.searchShop();
    },

    listAd: function () {
        util.ajax({
            url: util.getApiUrl("weixinapp/listAd"),
            data: {
                ad_position: 2
            }
        }, function (data) {
            this.setData({
                adList: data
            });
        }, this);
    },

    listShopCate: function () {
        util.ajax({
            url: util.getApiUrl("weixinapp/listShopCate"),
            data: {
                shop_type: 2
            }
        }, function (data) {
            // 添加一个全部
            data.unshift({});

            // 分页（10个分一页）
            var rlt = [], child = [];
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                child.push(item);

                if ((i + 1) % 10 == 0) {
                    rlt.push(child);
                    child = [];
                }
            }
            if (child.length > 0) {
                rlt.push(child);
            }

            this.setData({
                cateList: rlt
            });
        }, this);
    },

    searchShop: function(){
        util.ajax({
            url: util.getApiUrl("weixinapp/listOnlineShopSearch"),
            data: {
                orderByType: 4, // 返利排序
                pageIndex:0,
                pageSize:15
            }
        }, function (data) {
            this.setData({
                shopList: data
            });
        }, this);
    },

    toShop: function (e) {
        var shopid = e.currentTarget.dataset.shopid;
        wx.navigateTo({
            url: "/pages/shop/shop?shopid=" + shopid
        });
    },

    toCate: function (e) {
        var cateid = e.currentTarget.dataset.cateid;
        if (!cateid) {
            wx.navigateTo({
                url: "/pages/cate/cate?shop_type=2"
            });
        } else{
            wx.navigateTo({
                url: "/pages/search/searchItem?shop_cate_id=" + cateid
            });
        }
    },

    doSearch: function (e) {
        var searchString = e.detail.value;
        if (!searchString) return;

        wx.navigateTo({
            url: "/pages/search/searchItem?searchString=" + searchString
        });
    }
})