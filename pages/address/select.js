var util = require('../../utils/util.js');

Page({
    data: {

    },

    onLoad: function (options) {
        this.setData({
            noselect: options.noselect
        });
    },

    onShow: function (options) {
      this.listUserAddress();
    },


    listUserAddress: function(){
        util.ajax({
            url: util.getApiUrl("weixinapp/listUserAddress"),
            data: {}
        }, function (data) {
            var selectedAddressId;
            for (var i in data){
                if (data[i].is_default){
                    selectedAddressId = data[i].address_id;
                    break;
                }
            }
            this.setData({
                addressList: data,
                selectedAddressId: selectedAddressId
            });
        }, this);
    },

    onHide: function () {

    },

    toEditAddress: function () {
        wx.navigateTo({
            url: "/pages/address/edit"
        });
    },

    delAddress: function(e){
        var that = this;
        wx.showModal({
            title: '删除',
            content: '确定删除吗？',
            success: function(res){
                if (!res.confirm) return;

                var index = e.currentTarget.dataset.index;
                var addressId = that.data.addressList[index].address_id;
                util.ajax({
                    url: util.getApiUrl("weixinapp/delUserAddress"),
                    data: {
                        address_id: addressId
                    }
                }, function (data) {
                    this.data.addressList.splice(index, 1);
                    this.setData({
                        addressList: this.data.addressList
                    });
                }, that);
            }
        });
    },

    toEdit: function(e){
        var addressid = e.currentTarget.dataset.addressid;
        wx.navigateTo({
            url: "/pages/address/edit?addressid=" + addressid
        });
    },

    editSuccess: function(addressId, isNew){
        util.ajax({
            url: util.getApiUrl("weixinapp/getAddress"),
            data: {
                address_id: addressId
            }
        }, function (data) {
            if (isNew){
                this.data.addressList.unshift(data);
            } else{
                for (var i in this.data.addressList) {
                    if (this.data.addressList[i].address_id == addressId) {
                        this.data.addressList[i] = data;
                        break;
                    }
                }
            }
            
            this.setData({
                addressList: this.data.addressList
            });
        }, this);
    },

    selectAddress: function(e){
        var addressid = e.currentTarget.dataset.addressid;
        this.setData({
            selectedAddressId: addressid
        });
    },

    changeDefault: function(e) {
        var index = e.currentTarget.dataset.index,
            addressid = this.data.addressList[index].address_id;
        util.ajax({
            url: util.getApiUrl("weixinapp/updateUserAddressDefault"),
            data: {
                address_id: addressid
            }
        }, function (data) {
            var list = this.data.addressList;
            for(var i in list){
                if (list[i].address_id == addressid){
                    list[i].is_default = true;
                } else{
                    list[i].is_default = false;
                }
            }
            this.setData({
                addressList: list
            });
        }, this);
    },

    confirm: function() {
        if (!this.data.selectedAddressId) {
            wx.showModal({
                title: "提醒",
                content: "请选择一个地址"
            });
            return;
        }

        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2];  //上一个页面
        prevPage.selectAddressSuccess(this.data.selectedAddressId);
        wx.navigateBack();
    }
})