var util = require('../../utils/util.js'),
  config = require('../../utils/config.js');

Page({
  data: {
    config: config
  },

  onLoad: function (options) {
    this.data.shop_id = options.shopid;
    this.getShop();
    this.getUserMoney();
  },

  onShow: function () {
    this.getUser();
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

  checkboxChange: function (e) {
    this.setData({
      isBalancePay: e.detail.value.length > 0
    });
  },

  getUser: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/getUser"),
      data: {}
    }, function (data) {
      this.setData({
        userInfo: data
      });
    }, this);
  },

  checkPay: function () {
    if (this.data.userInfo.has_pay_pwd) {  //判断是否设置了密码，未设置要跳转过去设置
      this.setData({
        flag: true
      })
      return;
    } else {
      wx.navigateTo({
        url: "/pages/password/check_phone?phone=" + this.data.userInfo.phone
      });
    }
  },

  toSetPasswprd: function (e) {
    var that = this;
    this.setData({
      password: e.detail.value,
      passwordLength: e.detail.cursor
    })
    if (e.detail.cursor == 6) {
      util.ajax({
        method: "POST",
        data: {
          pay_pwd: this.data.password
        },
        url: util.getApiUrl("weixinapp/checkUserPayPwd")
      }, function (data) {
        if (data) {
          this.addOrder();
        } else {
          wx.showModal({
            title: "提示",
            content: "密码错误,请重试",
            confirmText: "重试",
            complete: function (e) {
              that.setData({
                password: "",
                passwordLength: 0
              })
              if (e.cancel) {
                that.hideFlag();
              }

            }
          })
        }
      }, this);
    }
  },

  hideFlag: function () {
    this.setData({
      flag: false
    })
  },

  toPay: function () {
    if (this.data.isBalancePay) {
      this.checkPay();
    } else {
      this.addOrder();
    }

  },

  addOrder: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/addUnderlineOrder"),
      data: {
        shop_id: this.data.shop_id,
        isBalancePay: this.data.isBalancePay,
        total_price: this.data.total_price
      }
    }, function (data) {
      this.showPay(data);
    }, this);
  },

  showPay: function (data) {
    var weixin_order_id = data.weixin_order_id;
    var pay_money = data.pay_money;
    var total_price = data.total_price;

    if (pay_money > 0) {
      util.ajax({
        url: util.getApiUrl("weixinapp/getWeixinPayData"),
        data: {
          weixin_order_id: weixin_order_id
        }
      }, function (payParam) {
        wx.requestPayment({
          timeStamp: payParam.timeStamp,
          nonceStr: payParam.nonceStr,
          "package": payParam.package,
          signType: payParam.signType,
          paySign: payParam.paySign,
          success: function (res) {
            wx.redirectTo({
              url: "/pages/pay/paysuccess?money=" + total_price
            });
          },
          fail: function (res) {
            wx.showModal({
              title: "提醒",
              content: "支付失败"
            });
          }
        });
      }, this);
    } else {
      wx.redirectTo({
        url: "/pages/pay/paysuccess?money=" + total_price
      });
    }
  },

  getUserMoney: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/getUserMoney"),
      data: {}
    }, function (data) {
      this.setData({
        userMoney: data || 0
      });
    }, this);
  },

  moneyChange: function (e) {
    this.setData({
      total_price: e.detail.value
    });
  }
})