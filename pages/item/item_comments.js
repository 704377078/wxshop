var util = require('../../utils/util.js'),
  config = require('../../utils/config.js');

Page({
  data: {
    comment_pageIndex: 0,
    comment_list: [],
    comment_loadall: false,
    config: config
  },

  onLoad: function (options) {
    this.setData({
      shop_id: options.shopid,
      item_id: options.item_id
    });

    this.listComment();
    this.getShopCommentHasImgCount();
  },

  changeCommentTab: function (e) {
    var searchType = e.currentTarget.dataset.type;
    this.setData({
      comment_hasImg: searchType == 1 ? null : 1,
      comment_pageIndex: 0,
      comment_list: [],
      comment_loadall: false
    });
    this.listComment();
  },

  listComment: function () {
    if (this.data._loading) return;

    this.setData({
      _loading: true
    });

    util.ajax({
      url: util.getApiUrl("weixinapp/listShopComment"),
      data: {
        shop_id: this.data.shop_id,
        item_id: this.data.item_id,
        hasImg: this.data.comment_hasImg,
        pageIndex: this.data.comment_pageIndex,
        pageSize: 15
      }
    }, function (data) {
      for (var i in data.list) {
        data.list[i].create_time = util.getTime(data.list[i].create_time);
      }

      if (data.list.length > 0) {
        var commentList = this.data.comment_list;
        util.append(commentList, data.list);
        this.setData({
          comment_list: commentList
        });
      }
      else {
        this.setData({
          comment_loadall: true
        });
      }

      if (!this.data.commentCount) {
        this.setData({
          commentCount: data.count
        });
      }

      this.setData({
        _loading: false
      });
    }, this);
  },

  getShopCommentHasImgCount: function () {
    util.ajax({
      url: util.getApiUrl("weixinapp/getShopCommentHasImgCount"),
      data: {
        shop_id: this.data.shop_id,
        item_id: this.data.item_id
      }
    }, function (data) {
      this.setData({
        commentHasImgCount: data
      });
    }, this);
  },

  onReachBottom: function () {
    if (this.data.comment_loadall) return;

    this.setData({
      comment_pageIndex: this.data.comment_pageIndex + 1
    });
    this.listComment();
  }

});