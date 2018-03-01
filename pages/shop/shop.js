var util = require('../../utils/util.js'),
  config = require('../../utils/config.js');

Page({
    data: {
      config: config
    },

    onLoad: function (options) {
        var shop_id = options.shopid || decodeURIComponent(options.scene);
        this.setData({
            shop_id: shop_id
        });

        this.getShop();
        this.listShopGroup();
        this.checkUserFavoriteShop();
        this.updateUserCurShopId();
        this.updateUserHistory();
    },

    onShow: function(){
      this.listShopItem();
    },

    onShareAppMessage: function () {
    },

    updateUserCurShopId: function(){
        util.ajax({
            url: util.getApiUrl("weixinapp/updateUserCurShopId"),
            data: {
                shop_id: this.data.shop_id
            }
        }, function (data) {
            
        }, this);
    },

    updateUserHistory: function () {
        util.ajax({
            url: util.getApiUrl("weixinapp/updateUserHistory"),
            data: {
                shop_id: this.data.shop_id
            }
        }, function (data) {

        }, this);
    },

    updateUserFavoriteShop: function () {
        util.ajax({
            url: util.getApiUrl("weixinapp/updateUserFavoriteShop"),
            data: {
                shop_id: this.data.shop_id
            }
        }, function (data) {
            this.setData({
                isFavorite: data
            });
        }, this);
    },

    checkUserFavoriteShop: function () {
        util.ajax({
            url: util.getApiUrl("weixinapp/checkUserFavoriteShop"),
            data: {
                shop_id: this.data.shop_id
            }
        }, function (data) {
            this.setData({
                isFavorite: data
            });
        }, this);
    },

    getShop: function(){
        util.ajax({
            url: util.getApiUrl("weixinapp/getShop"),
            data: {
                shop_id: this.data.shop_id
            }
        }, function (data) {
            data.shop_score = data.shop_score.toFixed(1);

            this.setData({
                shop: data
            });

            wx.setNavigationBarTitle({
                title: data.shop_name
            });
        }, this);
    },

    listShopGroup: function(){
        util.ajax({
            url: util.getApiUrl("weixinapp/listShopGroup"),
            data: {
                shop_id: this.data.shop_id
            }
        }, function (data) {
            this.setData({
                groupList: data
            });
            if (data.length > 0){
                this.setData({
                    selectedGroupId: data[0].item_group_id
                });
            }
        }, this);
    },

    listShopItem: function () {
        util.ajax({
            url: util.getApiUrl("weixinapp/listShopItem"),
            data: {
                shop_id: this.data.shop_id
            }
        }, function (data) {
            this.setData({
                itemList: data
            });
        }, this);
    },

    chooseShopGroup: function(e){
        var groupid = e.currentTarget.dataset.groupid;
        this.setData({
            selectedGroupId: groupid
        });
    },

    showShopMain: function() {
        wx.navigateTo({
            url: "/pages/shop/shopmain?shopid=" + this.data.shop.shop_id
        });
    },

    toSendCs: function(){
        wx.navigateTo({
            url: "/pages/my/sendCsMsg?shopid=" + this.data.shop.shop_id
        });
    },

    toPay: function(){
        wx.navigateTo({
            url: "/pages/pay/pay?shopid=" + this.data.shop.shop_id
        });
    },

    toItem: function (e) {
      var itemid = e.currentTarget.dataset.itemid;
      var shoptype = e.currentTarget.dataset.shoptype;
      if(shoptype=='1')
          return;
      wx.navigateTo({
        url: "/pages/item/item?itemid=" + itemid
      });
    }
})