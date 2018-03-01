// pages/settle/type.js
Page({
  data: {
  
  },

  onLoad: function (options) {
    this.setData({
      user_id: options.user_id || ''
    });
  },

  apply:function(e){
    var type = e.currentTarget.dataset.shoptype;
    wx.navigateTo({
      url: "/pages/settle/apply?type=" + type + "&user_id=" + this.data.user_id
    });
  }

})