var util = require('../../utils/util.js'),
  config = require('../../utils/config.js');

Page({
  data: {
    score: 0,
    imgList: [],
    config: config
  },

  onLoad: function (options) {
    this.setData({
      order_id: options.order_id,
      item_id: options.item_id
    });
    if(this.data.item_id){
      this.listOrderItemList();
    }
  },

  changeScore: function(e) {
    var score = e.currentTarget.dataset.score;
    this.setData({
      score: score
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

  /* 提交表单 */
  submit: function (e) {
    var that = this;

    if (!e.detail.value.content) {
      wx.showToast({
        title: '请填写评价内容'
      });
      return;
    }
    if (!this.data.score) {
      wx.showToast({
        title: '请评分'
      });
      return;
    }

    var params = {
      order_id: this.data.order_id,
      item_id: this.data.item_id,
      content: e.detail.value.content,
      score: this.data.score
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
              that.addShopComment(params);
            }
          }
        });
      }
    } else {
      this.addShopComment(params);
    }
  },

  addShopComment: function (params) {
    util.ajax({
      url: util.getApiUrl("weixinapp/addShopComment"),
      data: params
    }, function (data) {
      wx.navigateBack();
    }, this);
  },

  listOrderItemList: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/listOrderItemList"),
      data: {
        order_id: this.data.order_id
      }
    }, function (data) {
      var itemList = data.filter(item => item.item_id == this.data.item_id);
      this.setData({
        item: itemList[0]
      });
    }, this);
  }

})