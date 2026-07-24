const app = getApp().globalData
import Pages from '../../../../pages.js'
const tss = require('../../../../utils/tss.js')
const alert = require('../../../../utils/alert.js')
const tms = require('../../../../pages/tms.js')
const lc = require('../../../../utils/listenerCenter.js')
import { formatDate } from '../../../../utils/util.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    msg_id: '',
    show_setting: false,
    show_wrap: false,
    week: '',
    today: '',
    hour: '',
    minute: '',
    point: 'show_point',
    loc: '',
    interval: '',
    interval1: '',
    timestamp: '',
    lng_lat: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options._params)
    if (options._params){
      this.setData({
        msg_id: options._params
      })
      tss.query({
        url: tss.url('ENTITY') + 'TaskMsg',
        method:'GET',
        params: { id: options._params },
        completion: res => {
          console.log(res)
          if (res.failed) {
            alert.error(res.errorMsg)
            return
          }
          if (res.data[0].lng_lat) {
            alert.notice('此条记录已回复，无需重复回复')
          }
          else if (res.data[0].id) {
            this.setData({
              show_wrap: true
            })
            this.getWeek()
            this.getLoc()
            this.getSetting()
          }
        }
      })
    }else{
      alert.notice('传递参数错误')
    }
  },

  onUnload: function () {
    clearInterval(this.data.interval)
    clearInterval(this.data.interval1)
    lc.removeListener(lc.event.refresh, this.__wxWebviewId__.toString())

  },
  onPullDownRefresh: function () {
    this.getSetting()
    wx.stopPullDownRefresh()
  },
  onShow() {
    this.interval()
  },
  onHide() {
    clearInterval(this.data.interval)
    clearInterval(this.data.interval1)
  },
  interval: function () {
    const _this = this;
    this.data.interval = setInterval(function () { _this.changePoint(); }, 1000);
    this.data.interval1 = setInterval(function () { _this.getLoc(); }, 300000)
  },
  getSetting: function () {
    const _this = this;
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userLocation'] === false) {
          _this.setData({
            show_setting: true
          })
        }
      }
    })
  },
  callback: function (e) {
    console.log(e)
    if (e.detail.authSetting['scope.userLocation']) {
      this.setData({
        show_setting: false
      })
      this.getLoc()
    }
  },
  getLoc: function () {
    let _this = this;
    tms.getLoc((res)=>{
      console.log(res)
      if (res.lng_lat){
        _this.setData({
          lng_lat: res.lng_lat,
          loc: res.addr,
          show_setting: false
        })
      }else{
        _this.setData({
          show_setting: true
        })
        alert.error('获取地理位置失败。请确认是否允许小程序使用您的位置信息')
      }
    })
  },

  getWeek: function () {
    const today = new Date();
    const weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    this.setData({
      week: weekday[today.getDay()],
      today: formatDate(today, 'yyyy-MM-dd'),
      hour: formatDate(today, 'hh'),
      minute: formatDate(today, 'mm')
    })
  },
  clock: function () {
    if(this.data.lng_lat){
      wx.showLoading({ title: '正在提交' })
      tss.save({
        url: tss.url('tms') + '/task/driver_loc',
        params: { msg_id: this.data.msg_id, location: this.data.loc, lng_lat: this.data.lng_lat },
        completion: res => {
          wx.hideLoading()
          console.log(res)
          if (res.failed) {
            alert.error('发送位置失败 ' + (res.errorMsg || ''))
            return
          }
          else if (res.data.id) {
            alert.notice('发送位置成功')
          }
        }
      })
    }else{
      alert.notice('未获取到位置信息，请退出后重试')
    }
  },
  changePoint: function () {
    this.setData({
      point: 'hide_point'
    })
    const _this = this;
    setTimeout(function () {
      _this.setData({
        point: 'show_point'
      })
      if (formatDate(new Date(), 'mm') != _this.data.minute) {
        _this.getWeek()
      }
    }, 500)
  }

})