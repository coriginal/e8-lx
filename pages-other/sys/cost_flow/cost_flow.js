// 收支明细
import Pages from '../../../pages.js'
import user from '../../../utils/user.js'
import {
  $wuxDialog
} from '../../../components/index'
const _App = getApp().globalData
const tss = require('../../../utils/tss.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({ 
      type: options.type || 'topup_flow'
    })
    wx.setNavigationBarTitle({
      title: options.type == 'topup_flow' ? '充值明细' : '收支明细',
    })
    options.type == 'topup_flow' ? this.queryauthorize() : this.queryFee()
  },

  // 收支流水
  queryFee() {
    tss.query({
      url: tss.url('') + '/api/account/flow',
      params: { },
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.showModal({
            content: res.errorMsg,
            showCancel: false
          })
          return
        }
        res.data.map(i => i.remark = i.remark && i.remark.includes('月使用费用扣除') ? '开通费' : i.remark)
        this.setData({
          feelist: res.data.filter((i, idx) => idx <= 60)
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
        console.log(res)
        if (res.failed) {
          wx.showModal({
            content: res.errorMsg,
            showCancel: false
          })
          return
        }
        let list = res.data.filter(item => item.status != "待付款" )
        this.setData({
          buylist: list.filter((i, idx) => idx <= 60 )
        })
      }
    })
  },
  // dealData(_Page = 0) {
  //   let a = require('./filter.js').List
  //   if ((_Page) * Package <= a.length) {
  //     this.data.list[_Page] = a.slice((_Page) * Package, (_Page + 1) * Package)
  //     console.log(this.data.list)
  //     this.setData({
  //       ["list[" + _Page + "]"]: this.data.list[_Page]
  //     }, () => {
  //       setTimeout(() => {
  //         _Page++
  //         this.dealData(_Page)
  //       }, 300)
  //     })
  //   } else {
  //     setTimeout(() => {
  //       let a = 0, b = 2;
  //       this.setData({
  //         [`list[${a}][${b}]`]: { customer: '蛇皮怪', code: 'aaaaa', status: '请问请问请问', addr: '浙江省杭州问请问', weight: '123', volume: '21', amount: '12' },
  //       })
  //     }, 3000)
  //   }
  // },
})