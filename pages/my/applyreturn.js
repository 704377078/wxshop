var util = require('../../utils/util.js'),
  config = require('../../utils/config.js');

Page({
  data: {
    reason_picker_index: 0,
    item_picker_index: 0,
    reason_array: ['商品质量问题', '商品与描述不符', '少见或破损', '涉嫌假货', '其他'],
    imgList: [],
    config:config
  },

  onLoad: function (options) {
    this.data.order_id = options.order_id;
    this.listOrderItemList();
  },

  pickerChange: function (e) {
    this.setData({
      reason_picker_index: e.detail.value
    });
  },

  listOrderItemList: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/listOrderItemList"),
      data: {
        order_id: this.data.order_id
      }
    }, function (data) {
      var itemList = data.filter(item => item.return_status != 1 && item.return_status != 2);
      var max_return_money = itemList[0].buy_count * itemList[0].sku_price;
      this.setData({
        itemList: itemList,
        item_array: itemList.map(a => a.item_name),
        max_return_money: max_return_money,
        returnItem: itemList[0]
      });
    }, this);
  },

  itemPickerChange: function (e) {
    var max_return_money = this.data.itemList[e.detail.value].buy_count * this.data.itemList[e.detail.value].sku_price;
    this.setData({
      item_picker_index: e.detail.value,
      max_return_money: max_return_money,
      returnItem: this.data.itemList[e.detail.value]
    });
  },

  /* 上传图片 */
  addPhoto: function () {
    var that = this;
    wx.chooseImage({
      success: function (res) {
        for (var i in res.tempFilePaths) {
          that.data.imgList.push({
            imgurl: res.tempFilePaths[i],
            preview: res.tempFilePaths[i]
          });
        }
        that.setData({
          imgList: that.data.imgList
        });
      }
    });
  },

  /* 删除图片 */
  delPhoto: function (event) {
    this.data.imgList.splice(event.currentTarget.dataset.index, 1);
    this.setData({
      imgList: this.data.imgList
    });
  },

  applyOrderReturn: function (params) {
    util.ajax({
      url: util.getApiUrl("weixinapp/applyOrderReturn"),
      data: params
    }, function (data) {
      // var pages = getCurrentPages();
      // var prevPage = pages[pages.length - 2];  //上一个页面
      wx.navigateBack();
    }, this);
  },

  /* 提交表单 */
  submit: function (e) {
    var that = this;

    if (e.detail.value.return_money > this.data.max_return_money || e.detail.value.return_money <= 0) {
      wx.showToast({
        title: '退款金额不合理'
      });
      return;
    }

    var params = {
      order_id: this.data.order_id,
      order_item_id: this.data.returnItem.order_item_id,
      return_count: this.data.returnItem.buy_count,
      return_money: e.detail.value.return_money,
      reason: this.data.reason_array[this.data.reason_picker_index],
      memo: e.detail.value.memo
    }

    // 处理图片
    if (this.data.imgList.length > 0) {
      var localUrls = this.data.imgList.map(function (item) { return item.imgurl; });
      // 上传图片
      var imglist = [],
        index = 0;
      for (var i in localUrls) {
        wx.uploadFile({
          url: util.getApiUrl("upload/uploadfile"),
          filePath: localUrls[i],
          name: 'attachment',
          formData: {
            'fileName': 'filename.' + localUrls[i].split('.').pop()
          },
          success: function (res) {
            index++;
            var data = JSON.parse(res.data)
            if (data.data) {
              imglist.push({
                imgurl: data.data.path
              });
            }
            if (index >= localUrls.length) {
              // 发表
              params.imgList = imglist;
              that.applyOrderReturn(params);
            }
          }
        });
      }
    } else {
      this.applyOrderReturn(params);
    }
  }

})