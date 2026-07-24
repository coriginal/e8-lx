const _App = getApp().globalData
import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js')
import {
  formatDate
} from '../../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tableList: [{
      if_code_auto: true,
      child: [{
          title: '订单号 ：',
          code: 'code',
          placeholder: '至少7位',
          disabled: false,
          icon: 'i-scan',
          value: '',
        },
        {
          title: '承运单号 ：',
          code: 'tcode',
          placeholder: '至少7位',
          disabled: false,
          icon: 'i-scan',
          value: '',
        },
        {
          title: '时间 ：',
          code: 'order_date',
          placeholder: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          disabled: true,
          icon: 'i-right',
          value: '',
        }
      ]
    }, ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: `平台：${options.platform || ''}`
    })
    this.querySanke()
    this.setData({
      platform: options.platform,
      lc_id: options.lc_id,
      time: new Date().getTime()
    })
  },

  switchChange(e) {
    console.log(e)
    let {
      id: idx
    } = e.currentTarget
    this.setData({
      [`tableList[${idx}].if_code_auto`]: e.detail.value
    })
  },

  showDateChoose(e) {
    console.log(e)
    this.data._idx = e.currentTarget.dataset.idx
    this.data._index = e.currentTarget.dataset.index
    this.setData({
      date_picker: true
    })
  },
  onConfirm(e) {
    console.log(this.data.tableList[this.data._idx].child[this.data._index])

    this.setData({
      time: formatDate(new Date(e.detail.date), 'yyyy-MM-dd hh:mm:ss'),
      date_picker: false,
      [`tableList[${this.data._idx}].child[${this.data._index}].value`]: formatDate(new Date(e.detail.date), 'yyyy-MM-dd hh:mm:ss')
    })

  },
  onVisibleChange(e) {
    console.log(e)
    this.setData({
      date_picker: false
    })
  },

  inputValue(e) {
    let {
      idx,
      code,
      index
    } = e.currentTarget.dataset
    this.data.tableList[idx].child[index].value = e.detail.value
  },
  doScan(e) {
    let {
      idx,
      code,
      index
    } = e.currentTarget.dataset
    wx.scanCode({
      success: res => {
        this.setData({
          [`tableList[${idx}].child[${index}].value`]: res.result
        }, () => {
          console.log(this.data.tableList)
          if (code == 'tcode') {
            wx.showModal({
              content: '当前扫描完成,是否继续扫描？',
              confirmText: '继续扫描',
              cancelText: '返回',
              success: res => {
                if (res.confirm) {
                  this.createNewList(idx, code, index)
                }
              }
            })
          }
        })
      }
    })
  },
  createNewList(idx, code, index) {
    this.setData({
      [`tableList[${idx+1}]`]: {
        if_code_auto: true,
        child: [{
            title: '订单号 ：',
            code: 'code',
            placeholder: '至少7位',
            disabled: false,
            icon: 'i-scan',
            value: '',
          },
          {
            title: '承运单号 ：',
            code: 'tcode',
            placeholder: '至少7位',
            disabled: false,
            icon: 'i-scan',
            value: '',
          },
          {
            title: '时间 ：',
            code: 'order_date',
            placeholder: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
            disabled: true,
            icon: 'i-right',
            value: '',
          }
        ]
      }
    }, () => {
      let e = {
        currentTarget: {
          dataset: {
            idx: Number(idx) + 1,
            code: 'tcode',
            index
          }
        }
      }
      this.doScan(e)
    })
  },
  addListChild(e) {
    let tableList = this.data.tableList
    tableList.push({
      if_code_auto: true,
      child: [{
          title: '订单号 ：',
          code: 'code',
          placeholder: '至少7位',
          disabled: false,
          icon: 'i-scan',
          value: '',
        },
        {
          title: '承运单号 ：',
          code: 'tcode',
          placeholder: '至少7位',
          disabled: false,
          icon: 'i-scan',
          value: '',
        },
        {
          title: '时间 ：',
          code: 'order_date',
          placeholder: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          disabled: true,
          icon: 'i-right',
          value: '',
        }
      ]
    })
    this.setData({
      tableList
    })
  },

  confirmTieUp() {
    wx.showLoading({
      mask: true
    })
    let list = this.data.tableList.filter(i => i.child[1].value)
      .map(i => ({
        code: i.if_code_auto ? '' : i.child[0].value,
        tcode: i.child[1].value || '',
        lc_id: this.data.lc_id,
        origin: 'wx_orderP',
        order_date: i.child[2].value||'',
        customer_id: this.data.customer_id,
        clerk: _App.user.mobile || _App.user.uName || '',
      }))
    list.forEach(item => {
      if (item.code.length > 0 && item.code.length < 7) {
        wx.hideLoading()
        wx.showToast({
          title: '单号至少7位！',
          icon: 'none'
        })
        return
      }
      if (item.tcode.length < 7) {
        wx.hideLoading()
        wx.showToast({
          title: '单号至少7位！',
          icon: 'none'
        })
        return
      }
    })
    tss.post({
      url: tss.url('') + '/tms/order/batch',
      requestBody: {
        json: JSON.stringify(list)
      },
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.showModal({
            content: res.errorMsg,
            showCancel: false
          })
          wx.hideLoading()
          return
        }
        wx.hideLoading()
        wx.showModal({
          content: '绑定成功',
          showCancel: false,
          success: res => {
            wx.navigateBack()
          }
        })
      }
    })

  },

  querySanke() {
    tss.query({
      url: tss.url('sql') + 'customer',
      params: {
        text: '散客'
      },
      completion: res => {
        if (res.failed) {
          wx.showToast({
            title: res.errorMsg,
            icon: 'none'
          })
          return
        }
        this.data.customer_id = res.data[0] && res.data[0].id || ''
      }
    })
  },
})