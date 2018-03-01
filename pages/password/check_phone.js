// pages/password/check_phone.js
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    timespan:0,
    code:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      phone: Number(options.phone)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  }, 

  bindcodeInput: function (e) {
    this.setData({
      vercode: e.detail.value
    })
  },

  thisTimeInterval:function(){
    var time = this.data.timespan;
    var that = this;
    setInterval(function () {
      if (time==0) {
        clearInterval(this.thisTimeInterval);
        return;
      }
      time--;
      that.setData({
        timespan: time
      });
    }, 1000);
    
  },

  verify: function () {
    if (this.data.timespan && this.data.timespan > 0)return;
    util.ajax({
      method: "POST",
      data: {
        phone: this.data.phone
      },
      url: util.getApiUrl("weixinapp/getPhoneVercode")
    }, function (data) {
      this.setData({
        timespan: 60,
        vercode: data
      });
      this.thisTimeInterval();
     
    },this);
  },

  checkPhone:function(){
    util.ajax({
      method: "POST",
      data: {
        phone: this.data.phone,
        code: Number(this.data.vercode)
      },
      url: util.getApiUrl("weixinapp/checkPhoneVercode")
    }, function (data) {
      if(data){
        wx.navigateTo({
          url: "/pages/password/update_password"
        });
      }else{
        wx.showToast({
          title: "验证码错误",
          icon: "none"
        })
      }
       
    }, true);
  },
 
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})