const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: null,
    isChose: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    db.collection("ring").where({
      _openid: app.appData.openid,
    }).get({
      success: function(res){
        if(res.data.length!=0){
          that.setData({isChose: res.data[0].isChose})
        }else{
          db.collection("ring").add({
            data: {isChose: "none"}
          })
          that.setData({ isChose: "none" })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },
  press: function (e) {
    this.setData({
      isChose: e.target.id,
    })
    if (this.data.isPlay) {
      let audio = wx.createAudioContext(this.data.isPlay)
      audio.pause()
    }
    if(e.target.id!='none'&&e.target.id!='shake')this.tryListion(e.target.id);
    else if (e.target.id != 'none'){
        wx.vibrateLong({});
    }
    db.collection("ring").where({
      _openid: app.appData.openid,
    }).get({
      success: function(res){
        db.collection("ring").doc(res.data[0]._id).update({
            data: {
              isChose: e.target.id
            }
        })
      }
    })
  },
  tryListion: function(id){
    let audio = wx.createAudioContext(id)
    audio.seek(0)
    audio.play()
    this.setData({ isPlay: audio.audioId })
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