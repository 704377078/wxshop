var util = require('../../utils/util.js');

Page({

  data: {
    beneficiary_user_id:null,
    recharge_type: 1
  },

  onLoad: function (options) {
  
  },

  submit: function (e) {
    var that = this;
    //console.log(e);
    var money = e.detail.value.money;
    var phone = e.detail.value.phone;
    if(!money){
      wx.showToast({
        title: "请输入金额",
        icon: 'none'
      });
      return
    }
    if (this.data.recharge_type==2){
      if (!util.isPhone(phone)) {
        wx.showToast({
          title: "请输入正确的手机号码",
          icon: 'none'
        });
        return;
      }
      util.ajax({
        url: util.getApiUrl("weixinapp/getUserByPhone"),
        data: {
          phone: phone
        }
      }, function (data) {
        var that = this;
        if(data.user_id){
          wx.showModal({
            title: '提示',
            content: '请确认充值用户：'+ data.wx_nickname,
            success: function (res) {
              if (res.confirm) {
                //console.log('用户点击确定')
                that.addRechargeWeixinOrder(data.user_id, money);
              } 
            }
          });
        } else {
          wx.showModal({
            title: '提示',
            content: '用户不存在',
            showCancel:false
          });
        }
      }, this);
    } else {
      this.addRechargeWeixinOrder(null,money);
    }
  },

  addRechargeWeixinOrder:function(user_id,total_price){
    util.ajax({
      url: util.getApiUrl("weixinapp/addRechargeWeixinOrder"),
      data: {
        total_price: total_price,
        beneficiary_user_id: user_id
      }
    }, function (data) {
      this.showPay(data);
    }, this);
  },

  showPay: function (data) {
    var weixin_order_id = data.weixin_order_id;
    var pay_money = data.pay_money;
    var total_price = data.total_price;

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
  },

  pickerChange: function (e) {
    var recharge_type = e.currentTarget.dataset.type;
    if (recharge_type != this.data.recharge_type) {
      this.setData({
        recharge_type: parseInt(recharge_type)
      });
    }

  }

})