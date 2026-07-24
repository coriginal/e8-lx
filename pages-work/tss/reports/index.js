const tss = require('../../../utils/tss.js')
const alert = require('../../../utils/alert.js')
import PC from '../../../project.config.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    app_host: PC.app_host
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getReportURL()
  },

  onPullDownRefresh: function () {
    this.getReportURL()
    wx.stopPullDownRefresh()
  },

  getReportURL:function(){
    const _url = tss.url('wxapi')
    tss.getJSON({
      url: _url + 'wxreports',
      completion: res => {
        if (res.failed) {
          return alert.error()
        }
        this.setData({ list: res.data });
        if (!res.data.length) {
          alert.notice('当前没有可查看的报表')
        }
      }
    })  
  },

  openReport: function(e){
    const ds = e.target.dataset
    if (ds.wxurl) {
      wx.navigateTo({ url: ds.wxurl })
    }
    else{
      wx.navigateTo({
        url: `report/index?reportid=${ds.reportid}&coldefs=${ds.coldefs}`,
      })
    }
  }
})