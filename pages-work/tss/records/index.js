const tss = require('../../../utils/tss.js')
const alert = require('../../../utils/alert.js')
import PC from '../../../project.config.js'

Page({

  data: {
    tableList: [],
    cellHeight: '',
    app_host: PC.app_host
  },

  onLoad: function (options) {
    const _this = this
    wx.getSystemInfo({
      success: function (res) {
        var windowWidth = res.windowWidth;
        _this.setData({
          cellHeight: (windowWidth / 3) + 'px',
          imageHeight: (windowWidth / 12) + 'px'
        })
      },
      complete: function () {
        _this.getRecords()
      }
    })
    tss.query({
      url: tss.url('wxapi') + 'users',
      completion: res => {
        if (res.failed) {
          alert.error(res.errorMsg)
        }
        getApp().globalData.userPartner = res.data
      }
    })
  },

  onPullDownRefresh: function () {
    this.getRecords()
    wx.stopPullDownRefresh()
  },

  getRecords: function () {
    const url = tss.url('wxapi') + 'rctables'
    tss.getJSON({
      url,
      completion: res => {
        if (res.failed) {
          return alert.error()
        }

        var _complete = []; // 录入表个数不足12个补齐12个格子
        if (res.data.length < 12) {
          _complete.length = 12 - res.data.length
        }
        this.setData({
          tableList: res.data.concat(_complete)
        })
      }
    })
  },

  openRecord: function (e) {
    const ds = e.currentTarget.dataset
    var write = ds.permissions.indexOf('1') > -1, // 录入权限
        fix   = ds.permissions.indexOf('5') > -1; // 维护权限

    wx.navigateTo({
      url: `record/index?recordid=${ds.recordid}&write=${write}&fix=${fix}`
    })
  }
})