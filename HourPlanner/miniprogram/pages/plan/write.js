// miniprogram/pages/plan/write.js
var app = getApp()
var util = require('../../utils.js'); 
const db = wx.cloud.database()
Page({
  data: {
    target: '',
    target_number: 0,
    start: util.formatTime(new Date()).substring(0, 10),
    date: '',
    id: ''
  },
  onLoad: function (options) {
    var that= this
    if (that.options.target){
      that.setData({
        target: that.options.target,
        date: that.options.date,
        id: that.options.id
    })
    }
  },
  target: function(e){
    this.setData({
      target: e.detail.value,
      target_number: e.detail.cursor
    })
  },
  finish: function(e){
    var that=this
    if(that.data.id){
      db.collection('motivation').doc(that.data.id).update({
        data: {
          target: that.data.target,
          date: that.data.date
        },
        success: function (res) {
          wx.navigateBack({
            url: 'plan'
          })
        }
      })
    }
    else {
      if(that.data.target!=''&&that.data.date!=''){
        db.collection('motivation').add({
          data:{
            target: that.data.target,
            date: that.data.date
         },
          success: function(res){
            wx.navigateBack({
             url: 'plan'
            })
         }
        })
     }else if(that.data.target==''){
       wx.showToast({
         title: '请输入目标',
         icon: 'none'
       })
       if(that.data.date==''){
         wx.showToast({
           title: '请输入日期',
           icon: 'none'
         })
       }
     }
    }
  },
  chosing: function (e) { //时间选择器，通过将当前日期和目标日期化为一个8位十进制整数，调用计算剩余天数的函数
    this.setData({
      date: e.detail.value,
    })
  },
  onReady: function () {

  },
  onShow: function () {

  },
  onHide: function () {

  },
  onUnload: function () {

  },
  onPullDownRefresh: function () {

  },
  onReachBottom: function () {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})