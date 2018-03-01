var util = require('../../utils/util.js'),
    config = require('../../utils/config.js');

Page({
    data: {
        comment_pageIndex: 0,
        comment_list: [],
        comment_loadall: false,
        config: config
    },

    onLoad: function (options) {
        this.setData({
            shop_id: options.shopid
        });

        this.getShop();
        this.listComment();
        this.getShopCommentHasImgCount();
        this.checkUserFavoriteShop();
    },

    updateUserFavoriteShop: function(){
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

    getShop: function () {
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

    changeCommentTab: function(e){
        var searchType = e.currentTarget.dataset.type;
        this.setData({
            comment_hasImg: searchType == 1 ? null : 1,
            comment_pageIndex: 0,
            comment_list: [],
            comment_loadall: false
        });
        this.listComment();
    },

    listComment: function(){
        if (this.data._loading) return;

        this.setData({
            _loading: true
        });

        util.ajax({
            url: util.getApiUrl("weixinapp/listShopComment"),
            data: {
                shop_id: this.data.shop_id,
                hasImg: this.data.comment_hasImg,
                pageIndex: this.data.comment_pageIndex,
                pageSize: 15
            }
        }, function (data) {
            for (var i in data.list){
                data.list[i].create_time = util.getTime(data.list[i].create_time);
            }

            if (data.list.length > 0){
                var commentList = this.data.comment_list;
                util.append(commentList, data.list);
                this.setData({
                    comment_list: commentList
                });
            } 
            else {
                this.setData({
                    comment_loadall: true
                });
            }

            if (!this.data.commentCount) {
                this.setData({
                    commentCount: data.count
                });
            }

            this.setData({
                _loading: false
            });
        }, this);
    },

    getShopCommentHasImgCount: function(){
        util.ajax({
            url: util.getApiUrl("weixinapp/getShopCommentHasImgCount"),
            data: {
                shop_id: this.data.shop_id
            }
        }, function (data) {
            this.setData({
                commentHasImgCount: data
            });
        }, this);
    },

    toShopMap: function(){
      var showInfo = this.data.shop;
      var content = showInfo.total_user_count + "人消费 | 评分" + showInfo.shop_score;
      if (!showInfo.shop_info_lat) return;
      wx.openLocation({
        latitude: Number(showInfo.shop_info_lat),
        longitude: Number(showInfo.shop_info_lon),
        name: showInfo.shop_name,
        address: content
      })

        // wx.navigateTo({
        //     url: "/pages/shop/map?shopid=" + this.data.shop.shop_id
        // });
    },

    /**
     * 页面触底事件
     */
    onReachBottom: function () {
        if (this.data.comment_loadall) return;

        this.setData({
            comment_pageIndex: this.data.comment_pageIndex + 1
        });
        this.listComment();   
    },

    callphone: function(){
        if (!this.data.shop.shop_info_linkphone) return;

        wx.makePhoneCall({
            phoneNumber: this.data.shop.shop_info_linkphone
        });
    }
})