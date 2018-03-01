var util = require('../../utils/util.js');

Page({
  data: {
  
  },

  onLoad: function (options) {
    this.setData({
      order_id: options.order_id
    });
    this.getOrder();
    this.listExpressTraces();
  },

  getOrder: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/getOrder"),
      data: {
        order_id: this.data.order_id,
        order_type: 1
      }
    }, function (data) {
      this.setData({
        order: data
      });
    }, this);
  },

  listExpressTraces: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/listExpressTraces"),
      data: {
        order_id: this.data.order_id
      }
    }, function (data) {
      data.map(d => d.date = util.timeGMTToString(d.AcceptTime,'yyyy-MM-dd'));
      data.map(d => d.time = util.timeGMTToString(d.AcceptTime, 'hh:mm'));
      data.map(d => d.week = util.getWeek(d.AcceptTime));
      var firstTrace = data.shift() || null;
      var lastTrace;
      if(data.length>0){
        lastTrace = data[data.length-1];
        if (lastTrace.AcceptStation.indexOf('签收') !== -1){
          data.pop();
        } else {
          lastTrace = null;
        }
      }else{
        lastTrace = null;
      }
      this.setData({
        firstTrace: firstTrace,
        lastTrace: lastTrace,
        expressTraces: data.reverse()
      });
    }, this);
  }
})