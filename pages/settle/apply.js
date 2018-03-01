// pages/settle/apply.js
var util = require('../../utils/util.js');
Page({
  data: {
    provide: [],
    city: [],
    area: [],
    selectValue: [],
    isShowArea: false,
    address: {}
  },

  onLoad: function (options) {
    this.setData({
      shop_type: options.type,
      user_id: options.user_id
    });
    this.listCity();
  },

  getAddress: function (addressId) {
    util.ajax({
      url: util.getApiUrl("weixinapp/getAddress"),
      data: {
        address_id: addressId
      }
    }, function (data) {
      this.setData({
        address: data,
        areatext: data.provide_name + data.city_name + data.area_name
      });
    }, this);
  },

  listCity: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/listCityData"),
      data: {}
    }, function (data) {
      this.data.rlt = data;
      if (data.provide.length > 0) {
        this.setSelect();
      }
    }, this);
  },

  setSelect: function (provideId, cityId, areaId) {
    var selectValue = this.data.selectValue;

    if (!provideId) {
      provideId = this.data.rlt.provide[0].provide_id;
      selectValue[0] = 0;
    } else {
      for (var i in this.data.rlt.provide) {
        if (this.data.rlt.provide[i].provide_id == provideId) {
          selectValue[0] = i;
          break;
        }
      }
    }

    var city = [];
    for (var i in this.data.rlt.city) {
      if (this.data.rlt.city[i].provide_id == provideId) {
        city.push(this.data.rlt.city[i]);
      }
    }
    if (!cityId) {
      cityId = city[0].city_id;
      selectValue[1] = 0;
    } else {
      for (var i in city) {
        if (city[i].city_id == cityId) {
          selectValue[1] = i;
          break;
        }
      }
    }

    var area = [];
    for (var i in this.data.rlt.area) {
      if (this.data.rlt.area[i].city_id == cityId) {
        area.push(this.data.rlt.area[i]);
      }
    }
    if (!areaId) {
      areaId = area[0].area_id;
      selectValue[2] = 0;
    } else {
      for (var i in area) {
        if (area[i].area_id == areaId) {
          selectValue[2] = i;
          break;
        }
      }
    }

    this.setData({
      provide: this.data.rlt.provide,
      city: city,
      area: area,
      selectValue: selectValue
    });

  },

  bindChange: function (e) {
    var lastValue = this.data.lastValue;
    if (!lastValue) lastValue = [0, 0, 0];

    // 比较哪个被滚动
    var val = e.detail.value;
    if (val[0] != lastValue[0]) {
      this.setSelect(this.data.provide[val[0]].provide_id);
      val = [val[0], 0, 0]

    } else if (val[1] != lastValue[1]) {
      this.setSelect(this.data.provide[val[0]].provide_id, this.data.city[val[1]].city_id);
      val = [val[0], val[1], 0]
    }
    this.data.lastValue = val;

    this.setData({
      selectValue: val
    });
  },

  showArea: function () {
    this.setData({
      isShowArea: !this.data.isShowArea
    });

    if (!this.data.isShowArea) {
      var val = this.data.selectValue;
      this.data.address.provide_id = this.data.provide[val[0]].provide_id;
      this.data.address.city_id = this.data.city[val[1]].city_id;
      this.data.address.area_id = this.data.area[val[2]].area_id;
      this.setData({
        areatext: this.data.provide[val[0]].provide_name
        + this.data.city[val[1]].city_name
        + this.data.area[val[2]].area_name
      });

    }
  },

  submit: function () {
    if (!this.checkPhone)return;
    if (!this.check()) return;
    if (!this.data.isAgreen){
      wx.showToast({
        title: "同意协议才能提交申请",
        icon: 'none'
      })
      return;
    }
    this.data.address.is_default = this.data.address.is_default ? 1 : 0;
    util.ajax({
      url: util.getApiUrl("weixinapp/addShop"),
      data: {
        shop_type: this.data.shop_type,
        shop_info_linkphone: this.data.shop_info_linkphone,
        shop_info_linkname: this.data.shop_info_linkname,
        shop_name: this.data.shop_name,
        city_id: this.data.address.city_id,
        recommend_user_id: this.data.user_id
      }
    }, function (data) {
      wx.navigateBack({
        delta:2
      })
    }, this);
  },

  check: function () {
    if (!this.data.shop_info_linkphone || !this.data.shop_info_linkname || !this.data.shop_name || !this.data.address.city_id) {
      wx.showToast({
        title: "请完善信息再提交申请",
        icon: 'none'
      })
      return;
    }
    if (!util.isPhone(this.data.shop_info_linkphone)) {
      wx.showToast({
        title: "请填写正确的手机号",
        icon: 'none'
      })
      return;
    }
    return true;
  },
  
  changePhone: function (e) {
    this.setData({
      shop_info_linkphone: e.detail.value
    })
  },

  checkboxChange: function (e) {
    this.setData({
      isAgreen: e.detail.value.length > 0
    });
  },

  changeName:function(e){
    this.setData({
      shop_info_linkname: e.detail.value
    })
  },

  changeShopName:function(e){
    this.setData({
      shop_name: e.detail.value
    })
  },

  bindcodeInput: function (e) {
    this.setData({
      vercode: e.detail.value
    })
  },

  thisTimeInterval: function () {
    var time = this.data.timespan;
    var that = this;
    setInterval(function () {
      if (time == 0) {
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
    if (this.data.timespan && this.data.timespan > 0) return;
    util.ajax({
      method: "POST",
      data: {
        phone: this.data.shop_info_linkphone
      },
      url: util.getApiUrl("weixinapp/getPhoneVercode")
    }, function (data) {
      this.setData({
        timespan: 60,
        vercode: data
      });
      this.thisTimeInterval();

    }, this);
  },

  checkPhone: function () {
    util.ajax({
      method: "POST",
      data: {
        phone: this.data.shop_info_linkphone,
        code: Number(this.data.vercode)
      },
      url: util.getApiUrl("weixinapp/checkPhoneVercode")
    }, function (data) {
      if (data) {
        return true;
      } else {
        wx.showToast({
          title: "验证码错误",
          icon: "none"
        })
        return;
      }

    }, true);
  }
})