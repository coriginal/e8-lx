const _App = getApp().globalData
import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js')
import {
  formatDate
} from '../../../utils/util.js'

Page({

  data: {
    searchValue: '8699123'
  },


  onLoad: function (options) {
    this.doScanOrder()
    // this.getOrderInfoByCode()
  },
  doScanOrder() {
    this.setData({ showNothing: false })
    wx.scanCode({
      scanType: 'barCode',
      success: res => {
        let searchValue = res.result
        this.setData({
          searchValue
        })
        wx.setNavigationBarTitle({
          title: `当前识别单号：${searchValue}`
        })
        this.getOrderInfoByCode(res.result)
      },
      fail: res => {
        wx.showModal({
          title: '识别失败',
          content: '是否重新进行扫码',
          confirmText: '重新扫码',
          cancelText:'返回',
          success: res => {
            if (res.confirm) {
              this.doScanOrder()
            } else {
              wx.navigateBack()
            }
          }
        })
      }
    })
  },
  getOrderInfoByCode(scode = '8600008325') {
    wx.showLoading({
      title: '查询中...', mask: true
    })
    tss.query({
      url: `${tss.url('sql')}tms_order`,
      params: {
        scode
      },
      completion: res => {
        if (res.failed) {
          wx.showModal({
            content: res.errorMsg
          })
          wx.hideLoading()
          return
        }
        const order = res.data[0]
        this.setData({
          order,
          showNothing: order ? false : true
        })
        wx.hideLoading()
      }
    })
  },
  takePhoto() {
    wx.chooseImage({
      sizeType: 'compressed',
      success: (res) => {
        console.log(res)
        wx.showLoading({
          title: '上传中...', mask: true
        })
        tss.uploadImagesAsync({
          recordId: '-6',
          itemId: `${this.data.order.id}`,
          uName: _App.user.uName,
          uToken: _App.user.uToken,
          filePaths: res.tempFilePaths,
          completion: res => {
            console.log(res)
            if (res.failed) {
              wx.showModal({
                content: res.errorMsg
              })
              return
            }
            wx.showToast({
              title: '上传成功！', icon: 'none'
            })
          }
        })
      },
      fail: res => {
        wx.hideLoading()
      }
    })
  }
})