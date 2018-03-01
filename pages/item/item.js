var util = require('../../utils/util.js'),
  config = require('../../utils/config.js'),
  WxParse = require('../../wxParse/wxParse.js');

Page({
    data: {
        config: config
    },

    onLoad: function (options) {
        this.setData({
          item_id: options.itemid
        });

        this.listImg();
        this.getItem();
        this.listSpec();
        this.getItemLastComment();
        this.getCarItemCount();
        this.checkUserFavoriteItem();
    },

    onShareAppMessage: function () {
    },

    listImg: function(){
        util.ajax({
            url: util.getApiUrl("weixinapp/listItemImg"),
            data: {
                item_id: this.data.item_id
            }
        }, function (data) {
            this.setData({
                itemImgList: data
            });
        }, this);
    },

    getItem: function(){
        util.ajax({
            url: util.getApiUrl("weixinapp/getItem"),
            data: {
                item_id: this.data.item_id
            }
        }, function (data) {
            WxParse.wxParse('parseItemMemo', 'html', data.item_memo, this, 0);
            this.setData({
                itemData: data
            });
            this.updateUserCurShopId(data.shop_id);
        }, this);
    },

    updateUserCurShopId: function (shopId) {
        util.ajax({
            url: util.getApiUrl("weixinapp/updateUserCurShopId"),
            data: {
                shop_id: shopId
            }
        }, function (data) {

        }, this);
    },

    listSpec: function () {
        util.ajax({
            url: util.getApiUrl("weixinapp/listItemSpec"),
            data: {
                item_id: this.data.item_id
            }
        }, function (data) {
            this.setData({
                specList: data
            });
        }, this);
    },

    getItemLastComment: function(){
        util.ajax({
            url: util.getApiUrl("weixinapp/getItemLastComment"),
            data: {
                item_id: this.data.item_id
            }
        }, function (data) {
          if (data.commentCount)
            data.create_time = util.getTime(data.create_time);
          this.setData({
              comment: data
          });
        }, this);
    },

    selectSpec: function(e){
        var specid = e.currentTarget.dataset.specid;
        var parentid = e.currentTarget.dataset.parentid;

        this.data.specData = this.data.specData || {};
        this.data.specData[parentid] = specid;
        this.setData({
            specData: this.data.specData
        });

        // 检查是否所有的规格都已经选择
        var rlt = true,
            specIdList = [];
        for (var i in this.data.specList){
            if (this.data.specList[i].parent_spec_id) continue;

            var childSpecid = this.data.specData[this.data.specList[i].item_spec_id];
            rlt = rlt && childSpecid;
            specIdList.push(childSpecid);
        }
        if (rlt){
            this.getStock(specIdList);
        }
    },

    getStock: function (specIdList){
        util.ajax({
            url: util.getApiUrl("weixinapp/getItemSkuBySpecIds"),
            data: {
                item_id: this.data.item_id,
                specIdList: specIdList
            }
        }, function (data) {
            this.setData({
                sku: data,
                buyCount: 1
            });
        }, this);
    },

    changeBuyCount: function(e){
        var changeType = e.currentTarget.dataset.type;
        var count = this.data.buyCount || 0;
        if (changeType == 0){ // 减少
            if (count <= 1) return;

            count--;
        } else { // 增加
            if (count >= this.data.sku.sku_count) return;

            count++;
        }

        this.setData({
            buyCount: count
        });
    },

    addToCar: function(){
        if (this.data.buyCount > (this.data.sku.sku_count || 0)) {
            wx.showModal({
                title: "提示",
                content: "库存不足",
                confirmText: "知道啦"
            });
            return;
        }

        util.ajax({
            url: util.getApiUrl("weixinapp/addUserCarItem"),
            data: {
                sku_id: this.data.sku.sku_id,
                buy_count: this.data.buyCount
            }
        }, function (data) {
            wx.showToast({
                title: "已加入购物车"
            });

            this.setData({
                carItemCount: this.data.carItemCount + 1
            });
        }, this);
    },

    addToBuy: function () {
      if (!this.data.sku){
        wx.showModal({
          title: "提示",
          content: "请选择规格",
          confirmText: "知道啦"
        });
      }
      if (this.data.buyCount > (this.data.sku.sku_count || 0)) {
        wx.showModal({
          title: "提示",
          content: "库存不足",
          confirmText: "知道啦"
        });
      }
      wx.navigateTo({
        url: "/pages/pay/order?sku_id=" + this.data.sku.sku_id + "&buy_count=" + this.data.buyCount
      });
    },

    getCarItemCount: function(){
        util.ajax({
            url: util.getApiUrl("weixinapp/getCarItemCount"),
            data: {}
        }, function (data) {
            this.setData({
                carItemCount: data
            });
        }, this);
    },

    toCar: function(){
        var pages = getCurrentPages();
        wx.navigateBack({
            delta: pages.length - 1
        });

        wx.switchTab({
            url: "/pages/main/my"
        });

        wx.navigateTo({
            url: "/pages/pay/car"
        });
    },

    toFavorite: function(){
        util.ajax({
            url: util.getApiUrl("weixinapp/updateUserFavoriteItem"),
            data: {
                item_id: this.data.item_id
            }
        }, function (data) {
            if (data){
                wx.showToast({
                    title: "收藏成功"
                });
            } else{
                wx.showToast({
                    title: "取消收藏"
                });
            }
            
            this.setData({
                isFavorite: data
            });
            this.getItem();
        }, this);
    },

    checkUserFavoriteItem: function(){
        util.ajax({
            url: util.getApiUrl("weixinapp/checkUserFavoriteItem"),
            data: {
                item_id: this.data.item_id
            }
        }, function (data) {
            this.setData({
                isFavorite: data
            });
        }, this);
    },

    toShop: function(){
        wx.navigateBack();

        wx.navigateTo({
            url: "/pages/shop/shop?shopid=" + this.data.itemData.shop_id
        });
    },

    toComments: function () {
      wx.navigateTo({
        url: "/pages/item/item_comments?item_id=" + this.data.item_id + "&shopid=" + this.data.itemData.shop_id
      });
    }

})