var util = require('../../utils/util.js');

Page({
    data: {
        
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getShop(options.shopid);
    },

    getShop: function (shopid) {
        util.ajax({
            url: util.getApiUrl("weixinapp/getShop"),
            data: {
                shop_id: shopid
            }
        }, function (data) {
            this.setMapData(data);
        }, this);
    },

    setMapData: function(shop){
        var that = this;
        wx.getLocation({
            success: function (res) {
                that.setData({
                    markers: [
                        {
                            longitude: shop.shop_info_lon,
                            latitude: shop.shop_info_lat,
                            iconPath: "/images/61.png",
                            callout: {
                                content: "<view style='font-weight:bold;font-size:16px;'>" + shop.shop_name + "</view><br/><view style='color:#666666;'>110人消费 | 评分4.0</view>",
                                bgColor: "#ffffff",
                                display: "ALWAYS",
                                padding: 10,
                                boxShadow: "1px 1px 2px rgba(0,0,0,0.4)"
                            }
                        }
                    ],

                    polyline: [{
                        points: [{
                            longitude: res.longitude,
                            latitude: res.latitude
                        }, {
                            longitude: shop.shop_info_lon,
                            latitude: shop.shop_info_lat
                        }],
                        color: "#FF0000DD",
                        width: 2,
                        dottedLine: true
                    }]
                });
            }
        });
    },

    toSelf: function(){
        var mapCtx = wx.createMapContext('map');
        mapCtx.moveToLocation();
    }
})
