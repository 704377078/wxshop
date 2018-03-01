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
        this.data.address = options.address || {};
        this.listCity();
        if (options.addressid){
            this.getAddress(options.addressid);
        }
    },

    getAddress: function(addressId) {
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

    onHide: function () {

    },

    listCity: function(){
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

    setSelect: function(provideId, cityId, areaId){
        var selectValue = this.data.selectValue;

        if (!provideId) {
            provideId = this.data.rlt.provide[0].provide_id;
            selectValue[0] = 0;
        } else{
            for(var i in this.data.rlt.provide){
                if (this.data.rlt.provide[i].provide_id==provideId){
                    selectValue[0] = i;
                    break;
                }
            }
        }

        var city = [];
        for (var i in this.data.rlt.city){
            if (this.data.rlt.city[i].provide_id==provideId){
                city.push(this.data.rlt.city[i]);
            }
        }
        if (!cityId){
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
        if (!lastValue) lastValue = [0,0,0];

        // 比较哪个被滚动
        var val = e.detail.value;
        if (val[0] != lastValue[0]){
            this.setSelect(this.data.provide[val[0]].provide_id);
            val = [val[0],0,0]

        } else if (val[1] != lastValue[1]){
            this.setSelect(this.data.provide[val[0]].provide_id, this.data.city[val[1]].city_id);
            val = [val[0], val[1], 0]
        }
        this.data.lastValue = val;

        this.setData({
            selectValue: val
        });
    },

    showArea: function() {
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

    changeModel: function(e){
        var key = e.currentTarget.dataset.key;
        this.data.address[key] = e.detail.value;
    },

    save: function(){
      if (!this.check())return;
        this.data.address.is_default = this.data.address.is_default ? 1 : 0;
        util.ajax({
            url: util.getApiUrl("weixinapp/upsertUserAddress"),
            data: this.data.address
        }, function (data) {
            var pages = getCurrentPages();
            var prevPage = pages[pages.length - 2];  //上一个页面
            prevPage.editSuccess(data, !this.data.address.address_id);

            wx.navigateBack();
        }, this);
    },

    check:function(){
      if (!this.data.address.address_user_name || !this.data.address.city_id || !this.data.address.address_detail){
        wx.showToast({
          title: "请完善收货信息",
          icon: 'none'
        })
        return;
      }
      if (!util.isPhone(this.data.address.linkphone)){
        wx.showToast({
          title: "请填写正确的手机号",
          icon: 'none'
        })
        return;
      }
      return true;
    },

    changedefault: function(){
        this.data.address.is_default = !this.data.address.is_default;
        this.setData({
            address: this.data.address
        });
    }
})