//app.js
App({
  onLaunch: function () {
    var that = this
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    this.globalData = {}
    wx.setTabBarStyle({
      color: 'black',
      selectedColor: '#009e96',
      backgroundColor: 'white',
      backgroundColor: 'white',
      borderStyle: 'white'
    })
    wx.getSystemInfo({
      success: function(res) {
        that.appData.isIOS = res.system.indexOf('iOS') != -1 ? true : false
      },
    })
    wx.cloud.callFunction({
      name: 'getOpenid',
      success: function (res) {
        that.appData.openid = res.result.openId
      },
    })
  },
  appData: {
    openid: null,
    isIOS: null
  },
})
