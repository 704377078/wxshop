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
    var order_status = options.orderStatus;
    if (order_status == '68')
      order_status = [6, 8]
    this.data.searchParam = {
      order_type: options.orderType,
      order_status: order_status
    };

    util.getEnumData(function (data) {
      this.setData({
        enumData: data
      });
    }, this);
  },

  onShow: function () {
    this.listOrder(true);
  },

  listOrder: function (refresh) {
    if (this.data._loading) return;
    this.data._loading = true;

    if (refresh) {
      this.setData({
        pageIndex: 0,
        pageSize: 15,
        list: [],
        loadall: false
      });
    }

    var p = {
      pageIndex: this.data.pageIndex,
      pageSize: this.data.pageSize
    };

    util.extend(p, this.data.searchParam);

    util.ajax({
      url: util.getApiUrl("weixinapp/listOrder"),
      data: p
    }, function (data) {
      if (data.length > 0) {
        data.map(a => a.can_return = a.itemList.filter(item => item.return_status != 1 && item.return_status != 2).length > 0);
        data.map(a => a.rebate = parseFloat((a.money_discount * a.order_price).toFixed(2)));
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

  updateOrder: function (orderId) {
    var index;
    for (var i in this.data.list) {
      if (this.data.list[i].order_id == orderId) {
        index = i;
        break;
      }
    }

    util.ajax({
      url: util.getApiUrl("weixinapp/getOrder"),
      data: {
        order_id: orderId
      }
    }, function (data) {
      this.data.list[index] = data;
      this.setData({
        list: this.data.list
      });
    }, this);
  },

  onReachBottom: function () {
    if (this.data.loadall) return;

    this.data.pageIndex++;
    this.listOrder();
  },

  delOrder: function (e) {
    var that = this;
    wx.showModal({
      title: "取消订单",
      content: "确定取消订单吗？",
      success: function (res) {
        if (!res.confirm) return;

        var index = e.currentTarget.dataset.index;
        var order = that.data.list[index];

        util.ajax({
          url: util.getApiUrl("weixinapp/delOrder"),
          data: {
            order_id: order.order_id
          }
        }, function (data) {
          this.setData({
            pageIndex: 0,
            pageSize: 15,
            list: [],
            loadall: false
          });
          this.listOrder();
          wx.showToast({
            title: "取消成功"
          });
        }, that);
      }
    });


  },

  goPay: function (e) {
    var index = e.currentTarget.dataset.index;
    var order_id = this.data.list[index].order_id;
    wx.navigateTo({
      url: "/pages/pay/order?order_id=" + order_id
    });
  },

  toOrderDetail: function (e) {
    var order_id = e.currentTarget.dataset.orderid;
    var order_status = e.currentTarget.dataset.orderstatus;
    wx.navigateTo({
      url: "/pages/my/orderdetail?order_id=" + order_id
    });
  },

  toApplyReturn: function (e) {
    var order_id = e.currentTarget.dataset.orderid;
    wx.navigateTo({
      url: "/pages/my/applyreturn?order_id=" + order_id
    });
  },

  toGrade: function (e) {
    var order_id = e.currentTarget.dataset.orderid;
    wx.navigateTo({
      url: "/pages/my/grade?order_id=" + order_id
    });
  },

  confirmReceipt: function (e) {
    var order_id = e.currentTarget.dataset.orderid;
    util.ajax({
      url: util.getApiUrl("weixinapp/confirmReceipt"),
      data: {
        order_id: order_id,
      }
    }, function (data) {
      this.onShow();
    }, this);
  },

  toShop: function (e) {
    var shop_id = e.currentTarget.dataset.shopid;
    console.log(shop_id);
    wx.redirectTo({
      url: "/pages/shop/shop?shopid=" + shop_id
    });
  }

})