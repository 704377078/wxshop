// pages/password/update_password.js
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type:1,
    password:"",
    oldPassword:"",
    passwordLength:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.has_pay_pwd){
      this.setData({
        type: 3
      })
    }
   
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

  toSetPasswprd:function(e){
    this.setData({
      password: e.detail.value,
      passwordLength: e.detail.cursor
    })
  },

  nextPassword:function(){
    if (this.data.passwordLength!=6)return;
    var oldPassword = this.data.password;
    this.data.password = "";
    this.setData({
      type:2,
      password:"",
      oldPassword: oldPassword,
      passwordLength:0
    })
    
  },

  checkPassword:function(e){

    if (this.data.password != this.data.oldPassword){
      wx.showToast({
        title:"密码不一致",
        icon: 'none'
      })
      this.setData({
        type: 1,
        password: "",
        oldPassword: "",
        passwordLength: 0
      })
    }else{
      this.upsertUserPayPwd();
    }
  },

  upsertUserPayPwd:function(){
    util.ajax({
      method: "POST",
      data: {
        pay_pwd: this.data.password,
        old_pay_pwd: this.data.forePassword
      },
      url: util.getApiUrl("weixinapp/upsertUserPayPwd")
    }, function (data) {
      wx.showToast({
        title: "密码设置成功",
        complete: function () {
          wx.navigateBack({
            delta: 2
          })
        }
      })
     
    }, this);
  },

  checkSecurityCode:function(){
    if (this.data.passwordLength != 6) return;
    util.ajax({
      method: "POST",
      data: {
        pay_pwd: this.data.password
      },
      url: util.getApiUrl("weixinapp/checkUserPayPwd")
    }, function (data) {
      if(data){
        this.setData({
          type: 1,
          password: "",
          oldPassword: "",
          passwordLength: 0,
          forePassword: this.data.password
        })
      }else{
        wx.showToast({
          title: "密码错误",
          icon: "none"
        })
        this.setData({
          password: "",
          oldPassword: "",
          passwordLength: 0
        })
      }
      
    }, this);
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