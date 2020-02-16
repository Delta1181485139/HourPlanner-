// miniprogram/pages/plan/editor.js
var app=getApp()
const db = wx.cloud.database()
var util = require('../../utils.js'); 
Page({
  data: {
    title_number: 0,
    context_number: 0,
    title:'',
    context:'',
    id: null
  },
  onLoad: function (options) {
    var that=this
    if (that.options.id){
      db.collection('assignment').doc(that.options.id).get({ //从数据库获取当前任务信息
        success: function(res){
         that.setData({
            title: res.data.title,
            context: res.data.context,
            id: that.options.id
         })
       }
     })
    }
  },
  title_number: function(e){ //监听标题输入框
    this.setData({ 
      title: e.detail.value,
      title_number: e.detail.cursor
    })
  },
  context_number: function (e) { //监听备注输入框
    this.setData({
      context: e.detail.value,
      context_number: e.detail.cursor
    })
  },
  finish: function(e){ //响应点击完成按钮
    var that=this;
    if (this.data.title != ''){
      if(this.data.id){
        db.collection('assignment').doc(that.data.id).update({
          data: {
            title: that.data.title,
            context: that.data.context,
          }
        })
      }else{
        db.collection('assignment').add({
          data:{
            title: that.data.title,
            context: that.data.context,
            complete: false
          }
        })
      }
      wx.navigateBack({
        url: 'plan',
      })
    }else{
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      })
    }
  },
  onPullDownRefresh: function () {
    this.onLoad()
    wx.stopPullDownRefresh()
  },
  onReachBottom: function () {

  },
  onShareAppMessage: function () {

  }
})