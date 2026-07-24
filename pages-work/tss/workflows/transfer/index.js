const lc = require('../../../../utils/listenerCenter.js')
const alert = require('../../../../utils/alert.js')
const tss = require('../../../../utils/tss.js')
import user from '../../../../utils/user.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hidden: false,
    list: [],
    itemid: '',
    recordid: '',
    color: getApp().globalData.btnColor || '#224b9b'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      itemid: options.itemid,
      recordid: options.recordid
    })
    lc.addListener(lc.event.refresh, this.__wxWebviewId__.toString(), res => {
      if (res) {
        this.data.list.push({ name: res.name, value: res.value })
        this.setData({
          list: this.data.list
        })
        this.setData({
          hidden: true
        })
      }
    })
  },

  onUnload: function () {
    lc.removeListener(lc.event.refresh, this.__wxWebviewId__.toString())
  },

  addPerson: function (e) {
    const type = e.detail.value;
    wx.navigateTo({
      url: `../translist/index?type=${type}&recordid=${this.data.recordid}&itemid=${this.data.itemid}`
    })
  },
  delPerson: function (e) {
    this.setData({
      hidden: false,
      list: e.detail.list
    })
  },
  submit: function (e) {
    if (!this.data.list.length) {
      alert.notice('请选择转审人')
      return
    }
    wx.showLoading({ title: '正在提交' })
    const tbName = this.data.recordid
    tss.save({
      url: tss.url('xdata') + 'transApprove' + '/' + tbName,
      params: {
        id: this.data.itemid,
        opinion: e.detail.value.opinion,
        target: this.data.list[0].value
      },
      completion: res => {
        wx.hideLoading()
        if (res.failed) {
          alert.error(res.errorMsg)
          return
        }
        lc.emitEvent(lc.event.refresh)
        wx.navigateBack()
      }
    })
  }
})