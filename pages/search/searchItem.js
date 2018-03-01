var util = require('../../utils/util.js'),
  config = require('../../utils/config.js');

Page({
    data: {
        pageIndex: 0,
        pageSize: 15,
        list: [],
        loadall: false,
        orderType: 1,
        config: config
    },

    onLoad: function (options) {
        this.data.shopCateId = options.shop_cate_id
        this.data.searchString = options.searchString;

        this.listItem();
    },

    inputSearch: function (e) {
        this.data.searchString = e.detail.value;
    },

    doSearch: function () {
        this.setData({
            pageIndex: 0,
            pageSize: 15,
            list: [],
            loadall: false,
            orderType: 1
        });
        this.listItem();
    },

    listItem: function () {
        if (this.data._loading) return;
        this.data._loading = true;

        util.ajax({
            url: util.getApiUrl("weixinapp/listOnlineItemSearch"),
            data: {
                searchString: this.data.searchString,
                shop_cate_id: this.data.shopCateId,
                orderByType: this.data.orderType,
                pageIndex: this.data.pageIndex,
                pageSize: this.data.pageSize
            }
        }, function (data) {
            if (data.length > 0) {
                var list = this.data.list;
                util.append(list, data);
                this.setData({
                    list: list
                });
            }
            else {
                this.data.loadall = true;
            }

            this.data._loading = false;
        }, this);
    },

    toItem: function(e){
        var itemid = e.currentTarget.dataset.itemid;
        wx.navigateTo({
            url: "/pages/item/item?itemid=" + itemid
        });
    },

    changeOrder: function (e) {
      this.setData({
        pageIndex: 0,
        pageSize: 15,
        list: [],
        loadall: false
      });

      this.setData({
        orderType: e.currentTarget.dataset.ordertype
      });
      this.listItem();
    }
})