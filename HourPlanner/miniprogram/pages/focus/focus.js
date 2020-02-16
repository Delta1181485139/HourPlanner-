const timeChoosing=["自定义","10min","20min","30min","40min","50min","60min","70min","80min","90min","100min","110min","120min","130min","140min","150min","160min","170min","180min"]
var index = 0
var definedTime
const app = getApp()   
const db = wx.cloud.database();
const ctx = wx.createCanvasContext('Canvas');
var startY
var moveY
var circleX
var circleY
function bar(start,end){ //半圆条随用户自定义或选择时间大小变化的弧度
  ctx.beginPath()
  ctx.setStrokeStyle('#ffffff')
  ctx.setShadow(0, 0, 0, 'black')
  ctx.setLineWidth(1);
  ctx.arc(circleX, circleY * 0.36, circleX * 0.5, 0, 2 * Math.PI)
  ctx.setFillStyle('#ffffff')
  ctx.fill()
  ctx.stroke()

  ctx.beginPath()
  ctx.setStrokeStyle('#585858')
  ctx.arc(circleX, circleY * 0.36, circleX * 0.4737, 0, 2 * Math.PI)
  ctx.setFillStyle('#585858')
  ctx.fill()
  ctx.stroke()

  ctx.beginPath()
  ctx.setStrokeStyle('#c4f8e3')
  ctx.arc(circleX, circleY * 0.36, circleX * 0.4474, 0, 2 * Math.PI)
  ctx.setFillStyle('#c4f8e3')
  ctx.fill()
  ctx.stroke()

  ctx.beginPath()
  ctx.setStrokeStyle('#72f5c1')
  ctx.arc(circleX, circleY * 0.36, circleX * 0.3947, 0, 2 * Math.PI)
  ctx.setFillStyle('#72f5c1')
  ctx.fill()
  ctx.stroke()

  ctx.beginPath()
  ctx.setStrokeStyle('#c3c3c3')
  ctx.arc(circleX, circleY * 0.36, circleX * 0.2895, 0, 2 * Math.PI)
  ctx.setFillStyle('#c3c3c3')
  ctx.fill()
  ctx.stroke()

  ctx.beginPath()
  ctx.setStrokeStyle('#ffffff')
  ctx.arc(circleX*0.83, circleY * 0.28, circleX * 0.08, 0, 2 * Math.PI)
  ctx.setFillStyle('#ffffff')
  ctx.fill()
  ctx.stroke()

  ctx.beginPath()
  ctx.setStrokeStyle('#2dccc1')
  ctx.setShadow(0, 0, 10, '#2dccc1')
  ctx.setLineWidth(15);
  ctx.setLineCap('round');
  ctx.arc(circleX, circleY*0.36, circleX*0.6, start, end)
  ctx.stroke()
  ctx.draw()
}
Page({
  data: {
    keyBoard:false,   
    inputValue: '', 
    timeChoosing, 
    modelInput: true,
    min: ''
  },
  onLoad: function (options){
    this.setData({modelInput: true})
    db.collection('focusing').where({ //进入到该页面时删除数据库中该用户未完成的专注记录
      _openid: app.appData.openid,
      done: false
    }).get({
      success: function(res){
        for(var i=0;i<res.data.length;i++){
          db.collection('focusing').doc(res.data[i]._id).remove()
        }
      }
    })
    wx.getSystemInfo({ //获取屏幕信息
      success: function (res) {
        circleX = res.windowWidth/2
        circleY = res.windowHeight
      }
    })
    bar(0, Math.PI) //绘图
  },
  bindChange: function (e) { 
    const val = e.detail.value;
    index = val;
    bar(0, Math.PI+index[0]*Math.PI/18)  
    //根据自定义数值绘图
  },
  bindtouchstart: function(e){  //保存触屏起始位置
    startY = e.touches[0].pageY
  },
  bindtouchmove: function(e){ //根据触屏移动距离决定动画拉伸距离
    moveY = e.touches[0].pageY
    var sub = moveY - startY
    if (Math.PI + index[0] * Math.PI / 18 - sub * Math.PI / 720 > Math.PI){
    bar(0, Math.PI + index[0] * Math.PI / 18 - sub * Math.PI / 720 > 2 * Math.PI ? 2 * Math.PI : Math.PI + index[0] * Math.PI / 18 - sub * Math.PI / 720)
    }
    else bar(0, Math.PI)
  },
  goToBeginninng: function (e) { //带参数跳转至计时界面
    if (index!=0) {
      wx.navigateTo({
        url: 'begin?time=' + timeChoosing[index],
      })
    }
    else {   
      this.setData({
        modelInput: false,
        keyBoard: true
      })
      bar(Math.PI,Math.PI) 
    }
  },
  cancelM: function(e){ 
    this.setData({
      modelInput: true
    })
    bar(0, Math.PI)
  },
  confirmM: function(e){   
    this.setData({
      inputValue: undefined
    })
    if(definedTime!='')
    wx.navigateTo({
      url: 'begin?time='+definedTime,
    })
  },
  userDefined: function(e){  //自定义时间
    definedTime=e.detail.value
    bar(Math.PI, definedTime<180?Math.PI+Math.PI*definedTime/180:2*Math.PI)
    this.setData({
      inputValue: definedTime,
    })
  },
  onReady: function () {
 
  },
  onShow: function () {
    this.onLoad()
  },
  onHide: function () {
    this.onLoad()
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