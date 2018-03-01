var config = require('config.js');

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  cache: {},

  formatTime: function (date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  },

  getDate: function (str) {
    if (!str) return;
    str = str.split(' ');
    var date_str = str[0];
    var time_str = "";
    if (str.length > 1)
      time_str = str[1];
    date_str = date_str.split('-');
    time_str = time_str.split(':');
    var date = new Date();
    date.setFullYear(date_str[0], date_str[1] - 1, date_str[2]);
    date.setHours(time_str[0], time_str.length > 1 ? time_str[1] : 0, time_str.length > 2 ? time_str[2] : 0, time_str.length > 3 ? time_str[3] : 0);

    var minute = date.getMinutes();
    var hour = date.getHours();
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var now = new Date();
    var now_day = now.getDate();
    var now_month = now.getMonth() + 1;
    var now_year = now.getFullYear();
    if (year == now_year && month == now_month && day == now_day) {
      return "今天 " + (hour < 10 ? ("0" + hour) : hour) + ":" + (minute < 10 ? ("0" + minute) : minute)
    }
    else {
      return year + "/" + (month < 10 ? ("0" + month) : month) + "/" + (day < 10 ? ("0" + day) : day)
    }
  },
  
  timespanToString: function (timespan, format) {
    console.log(timespan)
    if (!timespan) return "--";

    var date = new Date(timespan);
    var o = {
      "M+": date.getMonth() + 1, //month
      "d+": date.getDate(), //day
      "h+": date.getHours(), //hour
      "m+": date.getMinutes(), //minute
      "s+": date.getSeconds(), //second
      "q+": Math.floor((date.getMonth() + 3) / 3), //quarter
      "S": date.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format))
      format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));

    for (var k in o) {
      if (new RegExp("(" + k + ")").test(format)) {
        format = format.replace(RegExp.$1,
          RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
      }
    }

    return format;
  },

  getTime: function (strtime) {
    var minute = 60 * 1000;// 1分钟 
    var hour = 60 * minute;// 1小时 
    var day = 24 * hour;// 1天 
    var month = 31 * day;// 月 
    var year = 12 * month;// 年 

    var date;
    if (strtime instanceof Date) {
      date = strtime
    }
    else if (/^\d+$/.test(strtime)) {
      strtime = parseInt(strtime + "000");
      date = new Date(strtime);
    }
    else {
      strtime = strtime.split(' ');
      var date_str = strtime[0];
      var time_str = "";
      if (strtime.length > 1)
        time_str = strtime[1];
      date_str = date_str.split('-');
      time_str = time_str.split(':');
      date = new Date();
      date.setFullYear(date_str[0], date_str[1] - 1, date_str[2]);
      date.setHours(time_str[0], time_str.length > 1 ? time_str[1] : 0, time_str.length > 2 ? time_str[2] : 0, time_str.length > 3 ? time_str[3] : 0);
    }
    var diff = new Date() - date;

    if (diff > year) {
      var r = Math.floor(diff / year);
      return r + "年前";
    }
    if (diff > month) {
      var r = Math.floor(diff / month);
      return r + "月前";
    }
    if (diff > day) {
      var r = Math.floor(diff / day);
      return r + "天前";
    }
    if (diff > hour) {
      var r = Math.floor(diff / hour);
      return r + "小时前";
    }
    if (diff > minute) {
      var r = Math.floor(diff / minute);
      return r + "分钟前";
    }
    return "刚刚";
  },

  getDevice: function (deviceType) {
    switch (deviceType) {
      case 0:
        return "";
      case 1:
        return "来自iPhone";
      case 2:
        return "来自Android";
      case 3:
        return "来自微信小程序";
      default:
        return "";
    }
  },

  getUrl: function (path, defaultUrl) {
    defaultUrl || (defaultUrl = "../../images/3.jpg");

    if (!path) return defaultUrl || null;

    if (path.indexOf("http") == 0) {
      return path;
    }

    if (path.indexOf("/") == 0) {
      return config.fileRoot + path;
    } else {
      return config.fileRoot + "/sites/default/uploads/" + path;
    }
  },

  getApiUrl: function (method, param, baseurl) {
    baseurl = baseurl || config.Api;

    var url;
    if (method && method.indexOf("http://") >= 0)
      url = method;
    else {
      url = baseurl.replace("{method}", method);
    }

    if (param) {
      for (var key in param) {
        if (url.indexOf("?") < 0) url += "?";
        else url += "&";
        url += key + "=" + param[key];
      }
    }
    return url;
  },

  ajax: function (option, callback, thisObj) {
    option.data = option.data || {};
    this.cache.token || (this.cache.token = wx.getStorageSync("token"));
    option.data.token = this.cache.token;

    wx.request({
      url: option.url,
      method: "POST",
      data: option.data,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        if (res && res.data && res.data.resultCode == 0) {
          if (callback) {
            if (thisObj) {
              callback.call(thisObj, res.data.data);
            } else {
              callback(res.data.data);
            }
          }

          return;
        }
      },
      fail: function () {

      },
      complete: function () {

      }
    })
  },

  append: function (arr1, arr2) {
    for (var index in arr2) {
      var item = arr2[index];

      arr1.push(item);
    }
  },

  extend: function (obj1, obj2) {
    for (var key in obj2) {
      obj1[key] = obj2[key];
    }
  },

  isPhone: function (phone) {
    return /^1[34578]\d{9}$/.test(phone) || /^((0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/.test(phone);
  },
  
  dealHtmlLink: function (html) {
    var reg = /<a.*?href="(.*?)".*?>.*?<\/a>/g;
    var match = reg.exec(html);
    while (match) {
      var temp = match[0],
        link = match[1];

      //html = html.replace('href="' + link + '"', "onclick=\"AppBridge.urlOpen({url:'" + link + "'})\"");

      match = reg.exec(html);
    }
    return html;
  },

  setKeyword: function (item_id, item_type, elIds) {

  },

  checkToken: function (callback) {

  },

  concatStyle: function (htmlData) {
    if (!htmlData) return;
    for (var index in htmlData) {
      var item = htmlData[index];

      if (item.attr && item.attr.style && item.attr.style.length > 0) {
        if (item.attr.style instanceof Array)
          item.attr.style = item.attr.style.join(" ");
      }

      if (item.child && item.child.length > 0) {
        this.concatStyle(item.child);
      }
    }
  },

  isEmptyObject: function (obj) {
    if (!obj) return true;

    var hasAttr = false;
    for (var i in obj) {
      hasAttr = true;
      break;
    }

    return hasAttr;
  },

  changeStyle: function (key) {
    var rlt = "";
    for (var i = 0; i < key.length; i++) {
      var c = key.charAt(i),
        code = c.charCodeAt();

      if (code >= 65 && code <= 90) {
        rlt += "-";
        rlt += String.fromCharCode(code + 32);
      } else {
        rlt += c;
      }
    }
    return rlt;
  },

  cleanHtml: function (content) {
    var reg = /<.*?>/g;
    return content.replace(reg, "");
  },

  loginWx: function () {
    var that = this;
    wx.login({
      success: function (res) {
        wx.getUserInfo({
          withCredentials: true,
          success: function (d) {
            that.ajax({
              url: that.getApiUrl("weixinapp/loginWx"),
              data: {
                code: res.code,
                encryptedData: d.encryptedData,
                iv: d.iv
              }
            }, function (data) {
              wx.setStorage({
                key: "token",
                data: data
              });
            });
          }
        });
      }
    })
  },

  getUserInfo: function (callback, noAuthorize) {
    function _getUserInfo() {
      wx.getUserInfo({
        success: function (res) {
          var userInfo = res.userInfo
          callback(userInfo);
        }
      })
    }

    wx.authorize({
      scope: 'scope.userInfo',
      success() {
        _getUserInfo();
      }
    })
  },

  getEnumData: function (callback, thisObj) {
    this.ajax({
      url: this.getApiUrl("data/listEnumData"),
      data: {}
    }, function (data) {
      if (thisObj) {
        callback.call(thisObj, data);
      } else {
        callback(data);
      }
    });

  },

  //计算时间间隔
  getLeftTime: function (begin_time, span) {
    var end_time = new Date(begin_time);
    end_time.setHours(end_time.getHours() + span);

    var dateDiff = new Date(end_time).getTime() - new Date().getTime();   //时间差的毫秒数
    //计算出相差天数
    var days = Math.floor(dateDiff / (24 * 3600 * 1000));
    //计算出小时数
    var leave1 = dateDiff % (24 * 3600 * 1000);    //计算天数后剩余的毫秒数
    var hours = Math.floor(leave1 / (3600 * 1000));
    //计算相差分钟数
    var leave2 = leave1 % (3600 * 1000);      //计算小时数后剩余的毫秒数
    var minutes = Math.floor(leave2 / (60 * 1000));
    //计算相差秒数
    var leave3 = leave2 % (60 * 1000);      //计算分钟数后剩余的毫秒数
    var seconds = Math.round(leave3 / 1000);
    var result = "";
    if (days > 0)
      result += days + "天";
    if (hours > 0)
      result += hours + "小时";
    if (minutes > 0)
      result += minutes + "分钟";
    return result;

  },

  timeGMTToString: function (str, format) {
    if (!str) return;
    str = str.split(' ');
    var date_str = str[0];
    var time_str = "";
    if (str.length > 1)
      time_str = str[1];
    date_str = date_str.split('-');
    time_str = time_str.split(':');
    var date = new Date();
    date.setFullYear(date_str[0], date_str[1] - 1, date_str[2]);
    date.setHours(time_str[0], time_str.length > 1 ? time_str[1] : 0, time_str.length > 2 ? time_str[2] : 0, time_str.length > 3 ? time_str[3] : 0);
    return this.dateToString(date, format);
  },

  dateToString: function (date, format) {
    var o = {
      "M+": date.getMonth() + 1, //month
      "d+": date.getDate(), //day
      "h+": date.getHours(), //hour
      "m+": date.getMinutes(), //minute
      "s+": date.getSeconds(), //second
      "q+": Math.floor((date.getMonth() + 3) / 3), //quarter
      "S": date.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format))
      format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));

    for (var k in o) {
      if (new RegExp("(" + k + ")").test(format)) {
        format = format.replace(RegExp.$1,
          RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
      }
    }

    return format;
  },

  getWeek: function (str) {
    var weekday = new Array(7);
    weekday[0] = "星期日";
    weekday[1] = "星期一";
    weekday[2] = "星期二";
    weekday[3] = "星期三";
    weekday[4] = "星期四";
    weekday[5] = "星期五";
    weekday[6] = "星期六";
    return weekday[new Date(str).getDay()];
  }
}
