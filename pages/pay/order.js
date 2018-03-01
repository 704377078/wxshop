var util = require('../../utils/util.js'),
  config = require('../../utils/config.js');

Page({
  data: {
    config: config
  },
  onShow: function () {
    this.getUser();
  },

  onLoad: function (options) {
    if (options.carItemIdList) {
      this.data.carItemIdList = options.carItemIdList.split(',');
      this.listUserCarItem();
      this.getUserDefaultAddress();
    } else if (options.sku_id && options.buy_count) {
      this.data.sku_id = options.sku_id;
      this.data.buy_count = options.buy_count;
      this.getItemBySkuId();
      this.getUserDefaultAddress();
    } else if (options.order_id) {
      this.data.order_id = options.order_id;
      this.listOrderItem();
      this.getOrderAddress();
    }
    this.getUserMoney();
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

  listOrderItem: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/listOrderItem"),
      data: {
        order_id: this.data.order_id
      }
    }, function (data) {
      var totalPrice = 0;
      for (var i in data) {
        var shop = data[i];
        shop.totalPrice = 0;
        shop.itemCount = 0;
        for (var j in shop.itemList) {
          var item = shop.itemList[j];
          shop.totalPrice += item.sku_price * item.buy_count;
          shop.itemCount += item.buy_count;
        }

        totalPrice += shop.totalPrice;
      }

      this.setData({
        shopList: data,
        totalPrice: totalPrice
      });
    }, this);
  },

  listUserCarItem: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/listUserCarItem"),
      data: {
        carItemIdList: this.data.carItemIdList
      }
    }, function (data) {
      var totalPrice = 0;
      for (var i in data) {
        var shop = data[i];
        shop.totalPrice = 0;
        shop.itemCount = 0;
        for (var j in shop.itemList) {
          var item = shop.itemList[j];
          shop.totalPrice += item.sku_price * item.buy_count;
          shop.itemCount += item.buy_count;
        }

        totalPrice += shop.totalPrice;
      }

      this.setData({
        shopList: data,
        totalPrice: totalPrice
      });
    }, this);
  },

  getItemBySkuId: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/getItemBySkuId"),
      data: {
        sku_id: this.data.sku_id,
        buy_count: this.data.buy_count
      }
    }, function (data) {
      var totalPrice = 0;
      for (var i in data) {
        var shop = data[i];
        shop.totalPrice = 0;
        shop.itemCount = 0;
        for (var j in shop.itemList) {
          var item = shop.itemList[j];
          shop.totalPrice += item.sku_price * item.buy_count;
          shop.itemCount += item.buy_count;
        }

        totalPrice += shop.totalPrice;
      }

      this.setData({
        shopList: data,
        totalPrice: totalPrice
      });
    }, this);
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

  checkboxChange: function (e) {
    this.setData({
      isUseMoney: e.detail.value.length > 0
    });
  },

  toSelectAddress: function () {
    wx.navigateTo({
      url: "/pages/address/select"
    });
  },

  selectAddressSuccess: function (addressId) {
    util.ajax({
      url: util.getApiUrl("weixinapp/getAddress"),
      data: {
        address_id: addressId
      }
    }, function (data) {
      this.setData({
        address: data
      });
    }, this);
  },

  toPay: function () {
    if (!this.data.address.address_user_name) {
      wx.showModal({
        title: "提醒",
        content: "请选择地址"
      });
      return;
    }

    if (this.data.isUseMoney) {  //选择余额支付但没有输入密码
      if (this.data.userInfo.has_pay_pwd){  //判断是否设置了密码，未设置要跳转过去设置
        this.setData({
          flag: true
        })
        return;
      }else{
        this.addPassword();
      }
      
    } else {
      this.doPay();
    }
  },

  addPassword: function () {
    if (!this.data.userInfo.phone) {
      wx.showToast({
        title: "请先绑定手机号",
        icon: 'none'
      })
      return;
    }
    wx.navigateTo({
      url: "/pages/password/check_phone?phone=" + this.data.userInfo.phone
    });

  },

  doPay: function() {
    if (this.data.carItemIdList) {
      this.addOrder();
    } else if (this.data.sku_id && this.data.buy_count) {
      this.addOrder();
    } else if (this.data.order_id) {
      this.updateOrder();
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
          this.doPay();
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

  showPay: function (data, callback) {
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
            if (callback) callback();
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
      if (callback) callback();
      wx.redirectTo({
        url: "/pages/pay/paysuccess?money=" + total_price
      });
    }
  },

  addOrder: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/addOnlineOrder"),
      data: {
        carItemIdList: this.data.carItemIdList,
        sku_id: this.data.sku_id,
        buy_count: this.data.buy_count,
        address: this.data.address,
        isBalancePay: this.data.isUseMoney
      }
    }, function (data) {
      this.showPay(data);
    }, this);
  },

  updateOrder: function () {
    if (this.data.isUseMoney) {

    }
    util.ajax({
      url: util.getApiUrl("weixinapp/updateOnlineOrder"),
      data: {
        order_id: this.data.order_id,
        address: this.data.address,
        isBalancePay: this.data.isUseMoney
      }
    }, function (data) {
      var that = this;
      this.showPay(data, function () {
        // 更新订单列表
        // var pages = getCurrentPages();
        // var prevPage = pages[pages.length - 2];  //上一个页面
        // prevPage.updateOrder(that.data.order_id);
      });
    }, this);
  },

  getOrderAddress: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/getOrder"),
      data: {
        order_id: this.data.order_id,
        order_type: 1
      }
    }, function (data) {
      var address = {
        "provide_name": "",
        "city_name": "",
        "area_name": "",
        "address_detail": data.express_address,
        "address_user_name": data.express_username,
        "linkphone": data.express_phone
      }
      this.setData({
        address: address
      });
    }, this);
  },

  getUserDefaultAddress: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/getUserDefaultAddress"),
      data: {}
    }, function (data) {
      this.setData({
        address: data,
      });
    }, this);
  }

})