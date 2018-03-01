var util = require('../../utils/util.js'),
  config = require('../../utils/config.js');

Page({
    data: {
        pageIndex: 0,
        pageSize: 15,
        list: [],
        loadall: false,
        config: config
    },

    onLoad: function (options) {
        this.data.shopCateId = options.shop_cate_id
        this.data.searchString = options.searchString;

        this.setData({
            orderType: 1
        });
        this.getLocation();
    },

    getLocation: function () {
        var that = this;

        util.ajax({
            url: util.getApiUrl("weixinapp/getUserCity"),
            data: {}
        }, function (data) {
            that.data.city = data;

            // 获取附件店铺
            wx.getLocation({
                success: function (res) {
                    that.data.location = res;
                    that.listShop();
                }
            });
        });
    },

    listShop: function(){
        if (this.data._loading) return;
        this.data._loading = true;

        util.ajax({
            url: util.getApiUrl("weixinapp/listShopSearch"),
            data: {
                lat: this.data.location.latitude,
                lon: this.data.location.longitude,
                city_id: this.data.city.city_id,
                searchString: this.data.searchString,
                shop_cate_id: this.data.shopCateId,
                orderByType: this.data.orderType,
                pageIndex: this.data.pageIndex,
                pageSize:this.data.pageSize
            }
        }, function (data) {
            for (var i in data) {
                data[i].distance = data[i].distance.toFixed(1);
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
        },this);
    },

    inputSearch: function(e){
        this.data.searchString = e.detail.value;
    },

    onReachBottom: function () {
        if (this.data.loadall) return;

        this.data.pageIndex++;
        this.listShop();
    },

    doSearch: function(){
        this.setData({
            pageIndex: 0,
            pageSize: 15,
            list: [],
            loadall: false,
            orderType: 1
        });
        this.listShop();
    },

    changeOrder: function(e){
        this.setData({
            pageIndex: 0,
            pageSize: 15,
            list: [],
            loadall: false
        });

        this.setData({
            orderType: e.currentTarget.dataset.ordertype
        });
        this.listShop();
    },

    toShop: function (e) {
        var shopid = e.currentTarget.dataset.shopid;
        wx.navigateTo({
            url: "/pages/shop/shop?shopid=" + shopid
        });
    }
})