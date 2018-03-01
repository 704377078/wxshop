var config = require('../../utils/config.js');

Page({
  data: {
    config: config
  },

  onLoad: function (options) {
    this.setData({
      money: options.money
    });
  }
})