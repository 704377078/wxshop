var util = require('../../utils/util.js');

Page({
    data: {

    },

    onLoad: function (options) {
        this.data.shop_type = options.shop_type; // 1：线下店铺 2：网店
        this.listShopCate();
    },

    listShopCate: function () {
        util.ajax({
            url: util.getApiUrl("weixinapp/listShopCate"),
            data: {
                shop_type: this.data.shop_type
            }
        }, function (data) {
            this.setData({
                parentList: data
            });

            if (data.length > 0){
                this.listChildCate(data[0]);
            }
        },this);
    },

    changeTab: function(e){
        var index = e.currentTarget.dataset.index;
        this.listChildCate(this.data.parentList[index]);
    },

    listChildCate: function(parent){
        this.setData({
            selectedParentCate: parent
        });

        if (!this.data.cacheChild) this.data.cacheChild = {};
        if (this.data.cacheChild[parent.shop_cate_id]) {
            this.setData({
                childList: this.data.cacheChild[parent.shop_cate_id]
            });
            return;
        }

        util.ajax({
            url: util.getApiUrl("weixinapp/listShopCate"),
            data: {
                parent_id: parent.shop_cate_id,
                shop_type: this.data.shop_type
            }
        }, function (data) {
            this.setData({
                childList: data
            });
            this.data.cacheChild[parent.shop_cate_id] = data;
        }, this);
    },

    toSearch: function(e){
        var cateid = e.currentTarget.dataset.cateid;
        if (!cateid){
            cateid = this.data.selectedParentCate.shop_cate_id
        }

        if(this.data.shop_type==1){
            wx.navigateTo({
                url: "/pages/search/search?shop_cate_id=" + cateid
            });
        } else{
            wx.navigateTo({
                url: "/pages/search/searchItem?shop_cate_id=" + cateid
            });
        }
        
    }
})