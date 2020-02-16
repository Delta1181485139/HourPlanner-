// miniprogram/pages/record/record.js
const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hello: '',
    focusDuration: 0,
    assignmentNum: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    let now = new Date().getHours();
    if (now < 5) that.setData({ hello: '凌晨了，注意早点休息噢' });
    else if (now < 8) that.setData({ hello: '早上好' });
    else if (now < 11) that.setData({ hello: '上午好' });
    else if (now < 13) that.setData({ hello: '中午好' });
    else if (now < 18) that.setData({ hello: '下午好' });
    else that.setData({ hello: '晚上好' });
    let i = 0;
    let s = 0;
    let count = 0;
    db.collection('focusing').where({
      _openid: app.appData.openid,
      done: true
    }).count({
      success: function (res) { 
        count = res.total
        while (i < parseInt((count / 20))+1) {
          db.collection('focusing').where({
            _openid: app.appData.openid,
            done: true
          }).skip(20 * i).get({
            success: function (res) {
              for (let j = 0; j < res.data.length; j++) { s += res.data[j].duration; }
                that.setData({ focusDuration: s })
            },
          })
          i++;
        }
      }
    })
    db.collection('assignment').where({
      _openid: app.appData.openid,
      complete: true
    }).count({
      success: function(res){
        that.setData({ assignmentNum: res.total })
      }
    })
  },
  planshow: function(e){
    var that=this
    wx.navigateTo({
      url: 'planshow?assignmentNum='+that.data.assignmentNum,
    })
  },
  focusshow: function(e){
    wx.navigateTo({
      url: 'focusshow',
    })
  },
  setup: function(e){
    wx.navigateTo({
      url: 'setup',
    })
  },
  help: function (e) {
    wx.navigateTo({
      url: 'help',
    })
  },
  share: function (e) {
    wx.showShareMenu({
      withShareTicket: true
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.onLoad()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})