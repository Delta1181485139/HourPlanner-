// miniprogram/pages/plan/plan.js
var app=getApp()
var util = require('../../utils.js');   //应用utils中的获取当前时间
const db = wx.cloud.database()
Page({
data: {
    windowsHeight: 0,  //屏幕高度
    currentTab:0,  //初始页号
    queue: null,
    show: false,
    three: false,
    isExist: false,
    addCountdown: false,
    countdown: null,
    remain: null,
},
onLoad: function (options) {
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowsHeight: res.windowHeight
        });
      } //获取屏幕高度
    });
    db.collection('assignment').where({
      _openid: app.appData.openid,
      complete: false
    }).get({
      success: function(res){
        if (res.data.length != 0) { that.setData({ show: true }) } else that.setData({ show: false })
        if (res.data.length >= 3) { that.setData({ three: true }) } else that.setData({ three: false })
        that.setData({queue: res.data})
      }
    })
    db.collection('motivation').where({
      _openid: app.appData.openid,
    }).get({
      success: function(res){
        if (res.data.length > 0){
          var s = parseInt(util.formatTime(new Date()).substr(0, 4) + util.formatTime(new Date()).substr(5, 2) + util.formatTime(new Date()).substr(8, 2))
          var f = parseInt(res.data[0].date.substr(0, 4) + res.data[0].date.substr(5, 2) + res.data[0].date.substr(8, 2))
          that.setData({ addCountdown: true })
            that.setData({
              countdown: res.data,
              remain: that.dayNum(s, f)
            })
          }
        else that.setData({ addCountdown: false })
        }
      })
},
slideSwitch :function(e){ //滑动切换页面
    this.setData({currentTab: e.detail.current})
},
clickSwitch :function(e){ //点击切换页面
  if(this.data.currentTab===e.target.dataset.current){
    return false;
  }else{
    this.setData({
      currentTab: e.target.dataset.current
    })
  }
},
longpress: function(e){ //长按编辑
  var that = this
  wx.showActionSheet({
    itemList: ['完成任务', '查看', '删除任务'],
    success(res) {
      if (res.tapIndex == 0) {
        let d=new Date()
        db.collection('assignment').doc(e.target.dataset.id).update({
          data:{
            date: util.formatTime(new Date()).substring(0, 10),
            order: new Date().getTime(),
            complete: true
          },
          success: function(res){
            that.onLoad()
          }
        })
      }
      else if(res.tapIndex == 1){
        wx.navigateTo({
            url: 'editor?id=' + e.target.dataset.id,
        })
      } else {
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
      }
    }
  })
},
onShow: function () {
  this.onLoad()
},
add_item: function (e) { //响应加号按钮，创建新任务
    var that = this
    db.collection('assignment').where({
      _openid: app.appData.openid,
      complete: false
    }).get({
      success: function(res){
          console.log(res)
          if(res.data.length>=3){}
          else{
            wx.showModal({
              title: '创建新的任务',
              success(res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: 'editor',
                  })
                }
              } 
            })
          }
      }
    })
},
//********************************以下为countdown页******************************************* */
newCountdown:function(e){
  wx.showModal({
    title: '提示',
    content: '要新建一个倒计时吗？',
    success: function(res){
      if(res.confirm){
        wx.navigateTo({
          url: 'write',
        })
      }
    }
  })
},
correct: function (e) { //响应右上角加号点击事件，询问修改或删除（即简单的修改标志位及保存的内容）
    var that = this
    wx.showActionSheet({
      itemList: ['修改', '清空'],
      success: function (res) {
        if (res.tapIndex != 1) {
          db.collection('motivation').where({
            _openid: app.appData.openid,
          }).get({
            success: function(res){
              wx.navigateTo({
                url: 'write?target='+res.data[0].target+'&date='+res.data[0].date+'&id='+res.data[0]._id
              })
            }
          })
        }
        else {
          wx.showModal({
            title: '清空当前倒计时?',
            confirmText: '清空',
            confirmColor: 'red',
            success(res) {
              if (res.confirm) {
                db.collection('motivation').doc(e.currentTarget.dataset.id).remove({
                  success: function(res){
                    that.onLoad()
                    console.log(res)
                  }
                })
              }
            }
          })
        }
      },
    })
  },
  dayNum: function (s, f) { //计算日期s和日期f之间相差的天数
    var sum = 0
    var i
    var month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    var sy = parseInt(s / 10000)
    var sm = parseInt((s - sy * 10000) / 100)
    var sd = (s - sy * 10000 - sm * 100)
    var fy = parseInt(f / 10000)
    var fm = parseInt((f - fy * 10000) / 100)
    var fd = (f - fy * 10000 - fm * 100)   //先从两个整数中提取相应的年月日数据存在不同变量中
    if (sy != fy) { //如果不同年
      month[1] = this.isLeap(sy) ? 29 : 28
      for (sum = month[sm - 1] - sd, i = sm; i < 12; i++)sum += month[i]
      for (i = sy + 1; i < fy; i++)sum += this.isLeap(i) ? 366 : 365
      month[1] = this.isLeap(fy) ? 29 : 28
      for (i = 0; i < fm - 1; i++)sum += month[i]
      sum += fd
      return sum
    } else if (sm != fm) { //如果同年不同月
      month[1] = this.isLeap(sy) ? 29 : 28
      for (sum = month[sm - 1] - sd, i = sm; i < fm - 1; i++)sum += month[i]
      sum += fd
      return sum
    } else if (sd != fd) { //如果同月不同天
      sum = fd - sd
      return sum
    } else return sum //同天
  },
  isLeap: function (y) {  //判断y是否为闰年
    if (y % 4 != 0) return false
    else if (y % 400 == 0) return true
    else if (y % 100 != 0) return true
    else return false
  },
  onHide: function () {

  },
  onUnload: function () {

  },
  onPullDownRefresh: function () {
    this.onLoad()
    wx.stopPullDownRefresh()
  },
  onReachBottom: function () {

  },
  onShareAppMessage: function () {

  },

})