const db = wx.cloud.database()
const app=getApp()
var start
var end
Page({

  /**
   * 页面的初始数据
   */
  data: {
    color: "white",
    focusDuration: 0,
    year: 0,
    month: 0,
    date: ['日', '一', '二', '三', '四', '五', '六'],
    dateArr: [], //保存日期的数组
    isToday: 0, //表示当天
    isTodayWeek: false, //表示当天的星期
    todayIndex: 0,
    planShow: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let now = new Date(); //获取系统时间，确定当日日期
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    this.dateInit();
    this.setData({
      year: year,
      month: month,
      isToday: '' + year + (month>9?month:('0'+month)) + (now.getDate() > 9 ? now.getDate() : '0' + now.getDate())
    })
    db.collection('focusing').where({ //从数据库获取专注记录
      _openid: app.appData.openid,
      date: this.data.isToday.substring(0, 4) + '-' + this.data.isToday.substring(4, 6) + '-' + this.data.isToday.substring(6, 8),
      done: true
    }).get({
      success: function(res){
        let st
        for (var i = 0, s = 0; i < res.data.length; i++) { s += res.data[i].duration }
        if (s >= 60) st = parseInt(s / 60) + '小时' + s % 60
        that.setData({ focusDuration: s > 60 ? st : s, color: that.color(s) })
      }
    })
    var j = 0;
    that.setData({ planShow: [] }) //在当日日期下还显示当日完成的任务
    db.collection('assignment').where({ //获取任务信息
      _openid: app.appData.openid,
      date: that.data.isToday.substring(0, 4) + '-' + that.data.isToday.substring(4, 6) + '-' + that.data.isToday.substring(6, 8),
      complete: true
    }).count({
      success: function (res) {
        let t = res.total;
        while (j < t / 20) {
          db.collection('assignment').where({
            _openid: app.appData.openid,
            date: that.data.isToday.substring(0, 4) + '-' + that.data.isToday.substring(4, 6) + '-' + that.data.isToday.substring(6, 8),
            complete: true
          }).skip(20 * j).get({
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
      }
    })
  },
  dateInit: function (setYear, setMonth) { //本月的日期
    //全部时间的月份都是按0~11基准，显示月份才+1
    wx.showLoading({
      title: 'loading...',
      mask: true
    })
    let that = this;
    let dateArr = [];//需要遍历的日历数组数据
    let arrLen = 0;//dateArr的数组长度
    let now = setYear ? new Date(setYear, setMonth) : new Date();
    let year = setYear || now.getFullYear();
    let nextYear = 0;
    let month = setMonth || now.getMonth();//没有+1方便后面计算当月总天数
    let nextMonth = (month + 1) > 11 ? 1 : (month + 1);
    let startWeek = new Date(year + ',' + (month + 1) + ',' + 1).getDay();//目标月1号对应的星期
    let dayNums = new Date(year, nextMonth, 0).getDate();//获取目标月有多少天
    let obj = {};
    let num = 0;

    if (month + 1 > 11) {
      nextYear = year + 1;
      dayNums = new Date(nextYear, nextMonth, 0).getDate();
    }
    arrLen = startWeek + dayNums;
    for (let i = 0; i < arrLen; i++) {
      if (i >= startWeek) {
        num = i - startWeek + 1;
        obj = {
          isToday: '' + year + ((month + 1) > 9 ? (month + 1) : '0' + (month + 1)) + (num > 9 ? num :'0'+num),
          dateNum: num,
          duration: 0,
          weight: 5
        }
      } else {
        obj = {};
      }
      dateArr[i] = obj;
    }
    this.setData({
      dateArr: dateArr
    })
    for (let i = startWeek; i < arrLen; i++){
      db.collection('focusing').where({
        _openid: app.appData.openid,
        done: true,
        date: year + '-' + ((month + 1) > 9 ? (month + 1) : ('0' + (month + 1))) + '-' + ((i - startWeek + 1) > 9 ? (i - startWeek + 1) : ('0' + (i - startWeek + 1)))
      }).get({
        success: function (res) {
          let s = 0
          for (let j = 0; j < res.data.length; j++) { s += res.data[j].duration;}
          let array = that.data.dateArr
          array[i].duration = s
          that.setData({
            dateArr: array
          })
        }
      })
    }
    setTimeout(function(){wx.hideLoading()},500)
  },
  lastMonth: function () { //左箭头监听函数，切换至上一月
    //全部时间的月份都是按0~11基准，显示月份才+1
    let year = this.data.month - 2 < 0 ? this.data.year - 1 : this.data.year;
    let month = this.data.month - 2 < 0 ? 11 : this.data.month - 2;
    this.setData({
      year: year,
      month: (month + 1)
    })
    this.dateInit(year, month);
  },
  nextMonth: function () { //右箭头监听函数，切换至下一月
    //全部时间的月份都是按0~11基准，显示月份才+1
    let year = this.data.month > 11 ? this.data.year + 1 : this.data.year;
    let month = this.data.month > 11 ? 0 : this.data.month;
    this.setData({
      year: year,
      month: (month + 1)
    })
    this.dateInit(year, month);
  },
  chosing: function(e){ //选定日期的监听函数
    this.skip(e.currentTarget.dataset.date,e.currentTarget.dataset.date.substring(0, 4), e.currentTarget.dataset.date.substring(4, 6) - 1, e.currentTarget.dataset.date.substring(6, 8))
  },
  skip: function(time,year,month,day){ //对某特定日期的选定
    var that = this
    var d = new Date(year, month, day)
    that.setData({
      isToday: time,
      isTodayWeek: true,
      todayIndex: d.getDay()
    })
    db.collection('focusing').where({ //获取专注信息
      _openid: app.appData.openid,
      date: that.data.isToday.substring(0, 4) + '-' + that.data.isToday.substring(4, 6) + '-' + that.data.isToday.substring(6, 8),
      done: true
    }).get({
      success: function (res) {
        let st
        for (var i = 0, s = 0; i < res.data.length; i++) { s += res.data[i].duration }
        if (s >= 60) st = parseInt(s / 60) + '小时' + s % 60
        that.setData({ focusDuration: s > 60 ? st : s, color: that.color(s) })
      }
    })
    var j = 0;
    that.setData({ planShow: [] })
    db.collection('assignment').where({ //获取任务信息
      _openid: app.appData.openid,
      date: that.data.isToday.substring(0, 4) + '-' + that.data.isToday.substring(4, 6) + '-' + that.data.isToday.substring(6, 8),
      complete: true
    }).count({
      success: function (res) {
        var t = res.total;
        while (j < t / 20) {
          db.collection('assignment').where({
            _openid: app.appData.openid,
            date: that.data.isToday.substring(0, 4) + '-' + that.data.isToday.substring(4, 6) + '-' + that.data.isToday.substring(6, 8),
            complete: true
          }).skip(20 * j).get({
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
          j++
        }
      }
    })
  },
  color: function(d){
    if(d >= 200) return 'gold'
    else if(d>=150) return 'orange'
    else if(d>=100) return 'hotpink'
    else if (d >= 60) return '#d6f'
    else if(d>=30) return 'deepskyblue'
    else if(d>=10) return 'limegreen'
    else return 'white'
  },
  touchstart: function(res){
    start = res.changedTouches[0].pageX
  },
  touchend: function (res) {
    end = res.changedTouches[0].pageX
    if (end - start > 20) this.lastMonth()
    else if (start - end > 20)this.nextMonth()
  },
  del: function (e) {
    var that = this
    console.log(e.target.dataset.id)
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
  time:function(e){//日期的格式转换
    var that = this
    let time = e.detail.value
    let year = parseInt(time.substring(0,4))
    let month = parseInt(time.substring(5,7))
    let day = parseInt(time.substring(8,10))
    this.setData({
      year: year,
      month: month,
      isToday: time.substring(0, 4) + time.substring(5, 7) + time.substring(8, 10)
    })
    this.dateInit(year, month-1);
    this.skip(time.substring(0, 4) + time.substring(5, 7) + time.substring(8, 10), time.substring(0, 4), (parseInt(time.substring(5, 7))-1).toString(), time.substring(8, 10))
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function(){
    this.onLoad()
    wx.stopPullDownRefresh()
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