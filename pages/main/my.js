var util = require('../../utils/util.js');

Page({
  data: {

  },

  onLoad: function (options) {
    this.getUser();
  },

  onShow: function () {
    this.getMyTotalCount();
    this.getOnlineOrderCount();
    this.getUser();
  },

  getUser: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/getUser"),
      data: {}
    }, function (data) {
      var phone
      if (data.phone) {
        phone = data.phone.slice(0, 3) + "****" + data.phone.slice(7);
      }
      this.setData({
        userInfo: data,
        omitPhone: phone
      });
    }, this);
  },

  getOnlineOrderCount: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/getOnlineOrderCount"),
      data: {}
    }, function (data) {
      this.setData({
        onlineOrderCount: data,
        onlineReturnCount: (data[6] || 0) + (data[8] || 0)
      });
    }, this);
  },

  toFavorite: function () {
    wx.navigateTo({
      url: "/pages/my/favorite"
    });
  },

  getMyTotalCount: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/getMyTotalCount"),
      data: {}
    }, function (data) {
      this.setData({
        totalCount: data
      });
    }, this);
  },


  getPhoneNumber: function (e) {
    if (!e.detail.encryptedData) {
      return;
    }

    util.ajax({
      url: util.getApiUrl("weixinapp/updateUserPhone"),
      data: {
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv
      }
    }, function (data) {
      if (!data) return;
      var phone = data.slice(0, 3) + "****" + data.slice(7);
      this.setData({
        omitPhone: phone
      });
      this.data.userInfo.phone = data;
      this.setData({
        userInfo: this.data.userInfo
      });

      wx.showToast({
        title: "绑定成功"
      });
    }, this);
  },

  toCar: function () {
    wx.navigateTo({
      url: "/pages/pay/car"
    });
  },

  showAddress: function () {
    wx.navigateTo({
      url: "/pages/address/select?noselect=1"
    });
  },

  updatePassword: function () {
    if (!this.data.userInfo.phone) {
      wx.showToast({
        title: "请先绑定手机号",
        icon: 'none'
      })
      return;
    }
    if (this.data.userInfo.has_pay_pwd) {
      wx.navigateTo({
        url: "/pages/password/update_password?has_pay_pwd=" + this.data.userInfo.has_pay_pwd
      });
    } else {
      wx.navigateTo({
        url: "/pages/password/check_phone?phone=" + this.data.userInfo.phone
      });
    }

  },

  toOnlineOrder: function (e) {
    var orderstatus = e.currentTarget.dataset.orderstatus || '';
    wx.navigateTo({
      url: "/pages/my/order?orderType=1&orderStatus=" + orderstatus
    });
  },

  toUnderlineOrder: function () {
    wx.navigateTo({
      url: "/pages/my/order?orderType=2"
    });
  },

  toFootprint: function () {
    wx.navigateTo({
      url: "/pages/my/footprint"
    });
  },

  toReturnList: function () {
    wx.navigateTo({
      url: "/pages/my/returnlist"
    });
  },

  toSettle: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/getUserShop")
    }, function (data) {
      if (data.shop_id) {
        wx.showToast({
          title: "您已经申请过入驻了",
          icon: 'none'
        })
      } else {
        wx.navigateTo({
          url: "/pages/settle/type"
        });
      }
    }, this);
  },

  toPackage: function () {
    wx.navigateTo({
      url: "/pages/pay/package"
    });
  },

  toRecommend: function () {
    if (this.data.userInfo.user_id){
      wx.navigateTo({
        url: "/pages/recommend/recommend?user_id=" + this.data.userInfo.user_id
      });
    }
  }
})