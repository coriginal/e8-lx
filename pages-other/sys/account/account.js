// 我的账户

import Pages from '../../../pages.js'
import user from '../../../utils/user.js'
import { $wuxDialog } from '../../../components/index'
const _App = getApp().globalData
const tss = require('../../../utils/tss.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _options: [
      { name: "充值记录", icon: 'moneybag', type: 'topup_flow' },
      { name: '收支明细', icon: 'form', type: 'cost_flow' }
    ],
    redpacket: `${_App.aliyun_host}/wx_account/redpacket.png`
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.queryFee()
    // this.queryauthorize()
  },
  onShow() {
    wx.showLoading({ mask: true })
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
          wx.hideLoading()
          return false
        }
        this.setData({
          balance: (res.data.balance + (res.data.balance_freeze || 0)).toFixed(2),
          balance1: (res.data.balance).toFixed(2),
          balance2: (res.data.balance_freeze || 0).toFixed(2)
        })
        wx.hideLoading()
      }
    })
  },
  // 收支流水
  queryFee() {
    tss.query({
      url: tss.url('') + '/api/account/flow',
      params: {},
      completion: res => {
        // console.log('flow:', res)
        if (res.failed) {
          console.log('流水请求失败')
          return false
        }
        res.data.map(i => i.remark = i.remark && i.remark.includes('月使用费用扣除') ? '开通费' : i.remark)
        this.setData({
          feelist: res.data
        })
      }
    })
  },
  // 历史订单
  queryauthorize() {
    tss.query({
      url: tss.url('') + '/cloud/order/list',
      params: {},
      completion: res => {
        // console.log('orderlist:', res)
        if (res.failed) {
          // console.log('')
          return false
        }
        let list = res.data.filter(item => {
          if (item.status != "待付款") {
            return true
          }
        })
        this.setData({
          buylist: list
        })
      }
    })
  },
  goFlow(e) {
    wx.navigateTo({
      url: `${Pages.cost_flow}?type=${e.currentTarget.id}`,
    })
  },
  // 充值
  goTopUp() {
    wx.navigateTo({ url: Pages.topup })
  },
  goRedPacket() {
    wx.navigateTo({
      url: Pages.redpacket
    })
  }
})