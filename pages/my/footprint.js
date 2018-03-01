var util = require('../../utils/util.js'),
  config = require('../../utils/config.js');
  
Page({
    data: {
        shop_type: 1,
        pageIndex: 0,
        pageSize: 15,
        list: [],
        loadall: false,
        config: config
    },

    onLoad: function (options) {
        this.getLocation();
    },

    getLocation: function () {
        var that = this;
        wx.getLocation({
            success: function (res) {
                that.data.location = res;
                that.listUserHistory();
            }
        });
    },

    listUserHistory: function () {
        if (this.data._loading) return;
        this.data._loading = true;

        util.ajax({
            url: util.getApiUrl("weixinapp/listUserHistory"),
            data: {
                lat: this.data.location.latitude,
                lon: this.data.location.longitude,
                shop_type: this.data.shop_type,
                pageIndex: this.data.pageIndex,
                pageSize: this.data.pageSize
            }
        }, function (data) {
            for (var i in data) {
                if (data[i].distance)
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
        }, this);
    },

    onReachBottom: function () {
        if (this.data.loadall) return;

        this.data.pageIndex++;
        this.listUserHistory();
    },

    toShop: function (e) {
        var shopid = e.currentTarget.dataset.shopid;
        wx.navigateTo({
            url: "/pages/shop/shop?shopid=" + shopid
        });
    },

    pickerChange: function (e) {
      var shop_type = e.currentTarget.dataset.shoptype;
      if(shop_type!=this.data.shop_type){
        this.setData({
          shop_type: shop_type,
          pageIndex: 0,
          list: [],
          loadall: false
        });

        this.listUserHistory();
      }

    }

})