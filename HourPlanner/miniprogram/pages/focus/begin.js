var t         
var total    
var clk       
var clock     
var haveFocusedOn = 0  
const app = getApp()   
var openid=''
var id=''
const db = wx.cloud.database();
var util = require('../../utils.js');
const ctx = wx.createCanvasContext('Canvas');
var circleX
var circleY
function bar(startH, endH, startM, endM, startS, endS) { //倒计时动画函数
  ctx.setStrokeStyle('#2dccc1');
  ctx.setShadow(0, 0, 20, '#2dccc1')
  ctx.setLineWidth(15);
  ctx.setLineCap('round');
  //hour
  ctx.beginPath()
  ctx.arc(circleX, circleY*0.33, circleX -120, startH, endH)
  ctx.stroke()
  //minute
  ctx.beginPath()
  ctx.arc(circleX, circleY*0.33, circleX -90, startM, endM)
  ctx.stroke()
  //second
  ctx.beginPath()
  ctx.arc(circleX, circleY*0.33, circleX -60, startS, endS)
  ctx.stroke()
  ctx.restore()
  ctx.draw()
}   
Page({
  data: {
    clock,                    
    focusTime:'',        
    screenBackDirection: false,
    isChose: null,
    end: '放弃'
  },
  onLoad: function (options) {
    if (app.appData.openid) {
      openid = app.appData.openid
    }
    t = parseInt(this.options.time);
    switch (this.options.time) {   
      case "自定义": break;
      case "10min": t = 10; break;
      case "20min": t = 20; break;
      case "30min": t = 30; break;
      case "40min": t = 40; break;
      case "50min": t = 50; break;
      case "60min": t = 60; break;
      case "70min": t = 70; break;
      case "80min": t = 80; break;
      case "90min": t = 90; break;
      case "100min": t = 100;  break;
      case "110min": t = 110; break;
      case "120min": t = 120;  break;
      case "130min": t = 130; break;
      case "140min": t = 140; break;
      case "150min": t = 150; break;
      case "160min": t = 160; break;
      case "170min": t = 170; break;
      case "180min": t = 180; break;
    }
    haveFocusedOn = 0
    db.collection('focusing').add({ //向数据库添加未完成的记录
      data: {
        date: util.formatTime(new Date()).substring(0, 10),
        begin: util.formatTime(new Date()).substring(11,19),
        done: false
      },
      success: function (res) {
        id = res._id
      },
    })
    wx.startDeviceMotionListening({}) //开始监听屏幕朝向
    total = t*60;
    wx.getSystemInfo({  //获取屏幕大小信息
      success: function (res) {
        circleX = res.windowWidth / 2
        circleY = res.windowHeight
      }
    })
  },
  onReady: function () {

  },
  onShow: function () {
    var that = this;
    that.dial(total);
    wx.setKeepScreenOn({ 
      keepScreenOn: true
    })
    wx.onDeviceMotionChange(function (res) {  //进行屏幕朝向的信号量赋值以及countdown的递归调用，用于倒计时
      var direction = app.appData.isIOS ? res.gamma : res.beta
      var d = app.appData.isIOS ? 90 : 130
      if (direction > -d&&direction < d) { 
        that.setData({
         screenBackDirection: false ,
        })
      }
      else {
        that.setData({
        screenBackDirection: true
        })
      }
    })
    this.countdown(this);
  },
  countdown: function (that) { //若屏幕朝下进行倒计时，否则暂停
    clock = this.dateformat(total);
    that.setData({
      clock: clock
    }) 
    if (total <= 0) { 
       that.setData({ 
         clock: "计时结束",
         end: "完成",
         focusTime: haveFocusedOn
       });
      db.collection('focusing').doc(id).update({ //倒计时数到0时，对数据库focus表内记录根据id更新
        data: {
          duration: t,
          end: util.formatTime(new Date()).substring(11,19),
          done: true
        },
      })
      db.collection("ring").where({ //从数据库获取用户预设的结束铃声
        _openid: app.appData.openid,
      }).get({
        success: function (res) {
          if (res.data.length != 0) {
            let id = res.data[0].isChose
            if (id != "none") {
              if (id != "shake") {
                let audio = wx.createAudioContext(id) //播放铃声
                audio.play()
              } else {
                wx.vibrateLong({})
              }
            }
          }
        }
      })
       return; 
    }
    clk=setTimeout(function () {
      if (that.data.screenBackDirection) {
        that.dial(total--);
        haveFocusedOn++;
      }
      else{
        that.setData({
          focusTime: haveFocusedOn
        })
        wx.showToast({
          title: '请反转手机使屏幕朝下即开始计时',
          icon:'none'
        })
      }
      that.countdown(that); 
    }, 1000);
  },
  dial: function(total){ //绘制画布，实现按照时针旋转机制
    bar(1.5 * Math.PI, 1.5 * Math.PI + (12 - parseInt(this.dateformat(total).substring(0, 2))) * Math.PI / 6, 1.5 * Math.PI, 1.5 * Math.PI + parseInt(this.dateformat(total).substring(3, 5)) * Math.PI / 30, 1.5 * Math.PI, 1.5 * Math.PI + parseInt(this.dateformat(total).substring(6, 8)) * Math.PI / 30)
  },
  dateformat: function (second) {  //秒数转化为标准时钟格式
    var hr = Math.floor(second / 3600);
    var min = Math.floor((second - hr * 3600) / 60);
    var sec = (second - hr * 3600 - min * 60);
    return (hr > 9 ? hr : "0" + hr) + ":" + (min > 9 ? min : "0" + min) + ":" + (sec > 9 ? sec : "0" + sec);
  },
  giveup: function(e){
    wx.navigateBack({
      url: 'focus',
    })
  },
  onHide: function () {
    clearTimeout(clk) 
  },
  onUnload: function () {
    clearTimeout(clk)
    wx.stopDeviceMotionListening({ 
    })
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