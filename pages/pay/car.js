var util = require('../../utils/util.js'),
  config = require('../../utils/config.js');

Page({
    data: {
      config:config
    },

    onLoad: function (options) {
    },

    onShow: function () {
      this.listUserCarItem();
    },

    changeBuyCount: function (e) {
        var changeType = e.currentTarget.dataset.type,
            shopindex = e.currentTarget.dataset.shopindex,
            itemindex = e.currentTarget.dataset.itemindex,
            item = this.data.shopList[shopindex].itemList[itemindex];

        if (changeType == 0) { // 减少
            if (item.buy_count <= 1) return;

            item.buy_count--;
        } else { // 增加
            if (item.buy_count >= item.sku_count) return;

            item.buy_count++;
        }

        this.data.shopList[shopindex].itemList[itemindex].buy_count = item.buy_count;

        util.ajax({
            url: util.getApiUrl("weixinapp/updateUserCarItemBuyCount"),
            data: {
                car_item_id: item.car_item_id,
                buy_count: item.buy_count
            }
        }, function (data) {
            this.setData({
                shopList: this.data.shopList
            });
            
            // 计算总金额
            this.getTotalPrice();
        }, this);
    },

    listUserCarItem: function(){
        util.ajax({
            url: util.getApiUrl("weixinapp/listUserCarItem"),
            data: {}
        }, function (data) {
            this.setData({
                shopList: data
            });
        }, this);
    },

    selectItem: function(e){
        var selectType = e.currentTarget.dataset.type,
            item = e.currentTarget.dataset.item,
            shop = e.currentTarget.dataset.shop;

        var selectedItem = this.data.selectedItem || {};
        var selectedShop = this.data.selectedShop || {};
        var selectedAll = this.data.selectedAll;
        var totalMoney = 0;
        if (selectType == 1){ // 选中商店
            if (selectedShop[shop.shop_id]){
                selectedShop[shop.shop_id] = false;

                for (var i in shop.itemList) {
                    selectedItem[shop.itemList[i].car_item_id] = false;
                }
            } else {
                selectedShop[shop.shop_id] = true;

                for (var i in shop.itemList) {
                    selectedItem[shop.itemList[i].car_item_id] = true;
                }
            }
        } else if (selectType == 2) { // 选中商品
            selectedItem[item.car_item_id] = !selectedItem[item.car_item_id];

            if (selectedItem[item.car_item_id]){
                selectedShop[shop.shop_id] = true;
            } else {
                var hasSelectedChild = false;
                for (var i in shop.itemList){
                    hasSelectedChild = hasSelectedChild || selectedItem[shop.itemList[i].car_item_id];
                }

                if (!hasSelectedChild){
                    selectedShop[shop.shop_id] = false;
                }
            }
        } else if (selectType == 3) { // 全选
            selectedAll = !selectedAll;
            for (var i in this.data.shopList) {
                var shop = this.data.shopList[i];
                selectedShop[shop.shop_id] = selectedAll;

                for (var j in shop.itemList){
                    selectedItem[shop.itemList[j].car_item_id] = selectedAll;
                }
            }
        }

        if (selectType == 1 || selectType == 2){
            // 检查是否全选
            selectedAll = true;
            for (var i in this.data.shopList) {
                var shop = this.data.shopList[i];
                for (var j in shop.itemList) {
                    selectedAll = selectedAll && selectedItem[shop.itemList[j].car_item_id];
                }
            }
        }

        this.setData({
            selectedItem: selectedItem,
            selectedShop: selectedShop,
            selectedAll: selectedAll
        });

        // 计算总金额
        this.getTotalPrice();
    },

    getTotalPrice: function(){
        var selectedItem = this.data.selectedItem || {};
        var totalMoney = 0;
        for (var i in this.data.shopList) {
            var shop = this.data.shopList[i];
            for (var j in shop.itemList) {
                if (selectedItem[shop.itemList[j].car_item_id]) {
                    totalMoney += shop.itemList[j].sku_price * shop.itemList[j].buy_count;
                }
            }
        }

        this.setData({
            totalMoney: totalMoney
        });
    },

    delUserCarItem: function(){
        var that = this;
        wx.showModal({
            title: "删除",
            content: "确定删除选中的商品吗？",
            confirmText: "确定删除",
            confirmColor: "#d9534f",
            success: function(res){
                if (res.confirm){
                    var carItemIdList = [];
                    for (var i in that.data.selectedItem){
                        if (that.data.selectedItem[i]) {
                            carItemIdList.push(i);
                        }
                    }

                    util.ajax({
                        url: util.getApiUrl("weixinapp/delUserCarItem"),
                        data: {
                            carItemIdList: carItemIdList
                        }
                    }, function () {
                        wx.showToast({
                            title: "已删除"
                        });
                        // 更新商品列表
                        this.listUserCarItem();
                        return;
                    }, that);
                }
            }
        });
    },

    toBuy: function(){
        if (!this.data.selectedItem) return;

        var carItemIdList = [];
        for (var i in this.data.selectedItem) {
            if (this.data.selectedItem[i]) {
                carItemIdList.push(i);
            }
        }

        if (carItemIdList.length == 0) return;

        util.ajax({
            url: util.getApiUrl("weixinapp/checkOrder"),
            data: {
                carItemIdList: carItemIdList
            }
        }, function (data) {
            if (data && !data.result) { // 订单生生成失败
                if (data.errorType == 'not_enough') { 
                    wx.showModal({
                        title: "购买失败",
                        content: "存在库存不足的商品，请重新选择后再次提交",
                        confirmText: "确定",
                        success: function (res) {
                            
                        }
                    });
                } else if (data.errorType == 'offsale') {
                    wx.showModal({
                        title: "购买失败",
                        content: "选中的商品已经下架，请重新选择",
                        confirmText: "确定",
                        success: function (res) {

                        }
                    });
                }

                // 更新商品列表
                this.listUserCarItem();
                return;
            }

            wx.navigateTo({
                url: "/pages/pay/order?carItemIdList=" + carItemIdList.join(',')
            });
        }, this);
    }
})