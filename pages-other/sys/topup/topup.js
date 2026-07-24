
import Pages from '../../../pages.js'
import user from '../../../utils/user.js'
const _App = getApp().globalData
const tss = require('../../../utils/tss.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    money_list: [ '5','10','20','30','50', '66', '100', '150', '666', '888', '1000'],
    clickItem: 3
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.queryBanlance()
  },
  // 账户余额
  queryBanlance() {
    tss.query({
      url: tss.url('') + '/api/account',
      params: {},
      completion: res => {
        // console.log('account:', res)
        if (res.failed) {
          console.log('余额请求失败')
          return false
        }
        this.setData({
          balance: (res.data.balance + (res.data.balance_freeze || 0)).toFixed(2),
          balance1: (res.data.balance).toFixed(2),
          balance2: (res.data.balance_freeze || 0).toFixed(2)
        })
      }
    })
  },
  choosePanel({ currentTarget }) {
    let { id } = currentTarget
    this.setData({
      clickItem: id
    })
  },
  confirmTopUp: tss.debounce(function () {
    // confirmTopUp(){
    if (_App.user.isTest) {
      wx.showToast({
        title: '体验者无法充值!', icon: 'none'
      })
      return
    }
    wx.showLoading({ mask: true})
    let params = {
      type: 'com.boubei.tss.modules.cloud.pay.RechargeOrderHandler',
      money_cal: this.data.money_list[this.data.clickItem],
      appid: _App.app_id,
      mchid: _App.mchid
    }
    tss.post({
      url: tss.url('') + '/cloud/order',
      params,
      completion: result => {
        console.log(result)
        if (result.failed) {
          wx.showModal({
            content: result.errorMsg,
          })
          wx.hideLoading()
          return false
        }

        user.__wxCode({
          completion: res => {
            this.data.jscode = res.code
            console.log(result.data)
            this.payMoney(result.data)
          }
        })
      }
    })
    // },
  }, 500),
  payMoney: function (param) {

    tss.post({
      url: tss.url('wxapi') + 'minipay',
      params: {
        body: 'EFF账户充值 - ' + this.data.money_list[this.data.clickItem] + '元',
        out_trade_no: param.order_no,
        total_fee: param.money_cal * 100,
        jscode: this.data.jscode,
        // total_fee: 10,
        openid: _App.user.openid,
        appid: _App.app_id,
        mchid: _App.mchid
      },
      completion: res => {
        if (res.data.code == 'success') {
          wx.hideLoading()
          wx.requestPayment({
            ...res.data.data,
            success: res => {
              tss.post({
                url: tss.url('') + '/wxnotify2.in',
                params: {
                  afterPaySuccess: 'CloudService',
                  out_trade_no: param.order_no,
                  receipt_amount: param.money_cal
                },
                completion: res => {
                  if (res.failed) {
                    wx.showModal({
                      content: '申请失败', showCancel: false
                    })
                    return
                  }
                  console.log(res)
                  wx.showModal({
                    title: '提示',
                    content: '操作成功!',
                    showCancel: false,
                    success: res => {
                      wx.navigateBack()
                    },
                  })
                }
              })
            },
            fail: res => {
              wx.showToast({
                title: '充值失败',
                icon: 'none'
              })
            }
          })
          return
        }
      }
    })
  }
})