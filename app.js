var util = require('/utils/util.js');

App({
    onLaunch: function () {
        util.loginWx();
    },

    globalData: {"city":null}
})