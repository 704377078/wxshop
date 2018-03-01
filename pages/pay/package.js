var util = require('../../utils/util.js'),
  config = require('../../utils/config.js');

Page({
  data: {
    log_type: '',
    pageIndex: 0,
    list: [],
    loadall: false,
    config: config
  },

  onLoad: function (options) {
    util.getEnumData(function (data) {
      this.setData({
        enumData: data
      });
    }, this);
  },

  onShow: function() {
    this.setData({
      log_type: '',
      pageIndex: 0,
      list: [],
      loadall: false
    });
    this.getUserPackageTotal();
    this.listUserMoneyLog();
  },

  getUserPackageTotal: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/getUserPackageTotal"),
      data: {
      }
    }, function (data) {
      this.setData({
        user_money: data.user_money,
        fanli: data.fanli
      });
    }, this);
  },
  
  listUserMoneyLog: function () {
    if (this.data._loading) return;

    this.setData({
      _loading: true
    });

    util.ajax({
      url: util.getApiUrl("weixinapp/listUserMoneyLog"),
      data: {
        log_type: this.data.log_type,
        pageIndex: this.data.pageIndex,
        pageSize: 10
      }
    }, function (data) {
      if (data.list.length > 0) {
        var list = this.data.list;
        util.append(list, data.list);
        this.setData({
          list: list
        });
      }
      else {
        this.setData({
          loadall: true
        });
      }

      this.setData({
        _loading: false
      });
    }, this);
  },

  onReachBottom: function () {
    if (this.data.loadall) return;

    this.setData({
      pageIndex: this.data.pageIndex + 1
    });
    this.listUserMoneyLog();
  },

  changeLogType: function (e) {
    var log_type = e.currentTarget.dataset.logtype;
    if(log_type!=this.data.log_type){
      this.setData({
        log_type: log_type,
        pageIndex: 0,
        list: [],
        loadall: false
      });
      this.listUserMoneyLog();
    }
  },

  recharge: function () {
    wx.navigateTo({
      url: "/pages/pay/recharge"
    });
  },
  
  withdraw: function () {
    wx.showToast({
      title: "提现功能暂未开放",
      icon: 'none'
    });
  },

})