const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    planShow: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: 'loading...',
    })
    var that=this
    that.setData({planShow: []})
    let i=0
    while (i < (that.options.assignmentNum/20)){
      db.collection('assignment').where({
        _openid: app.appData.openid,
        complete: true
      }).skip(20*i).get({
       success: function (res) {
         let array = that.data.planShow.concat(res.data)
         array.sort(function (a, b) {
           return b.order - a.order
         })
         that.setData({
            planShow: array,
         })
       }
      })
      i++
    }
    setTimeout(function(){wx.hideLoading()},500)
  },
  del: function (e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定删除此记录？',
      confirmText: '删除',
      confirmColor: 'red',
      success: function (res) {
        if (res.confirm) {
          db.collection('assignment').doc(e.target.dataset.id).remove({
            success: function (res) {
              that.onLoad()
            }
          })
        }
      }
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