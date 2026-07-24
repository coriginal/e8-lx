const _App = getApp().globalData
import Pages from '../../../../pages.js'
const tss = require('../../../../utils/tss.js')
const lc = require('../../../../utils/listenerCenter.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: `${_App.aliyun_host}/wx_account/scan_redpacket.png`,
    list: [
      { title: '名称', code: 'name', value: '', col: 12, confirm: '下一步', type: 'text', focus: true, disabled: false, required: true },
      { title: '金额', code: 'money', value: '', col: 12, confirm: '下一步', type: 'text', focus: false, disabled: false, required: true },
      { title: '数量', code: 'amount', value: '', col: 12, confirm: '下一步', type: 'text', focus: false, disabled: false, required: true },
      { title: '电话', code: 'phone', value: '', col: 12, confirm: '下一步', type: 'text', focus: false, disabled: false },
      { title: '有效期至', code: 'deadline', value: '', col: 12, confirm: '完成', type: 'text', focus: false, disabled: true, required: true, },
      { title: '优惠券类型', code: 'type', value: '录单运费抵扣券', col: 12, confirm: '完成', type: 'text', focus: false, disabled: true },
      // { title: '定向发送', code: 'aim', value: '点击选择特定用户', col: 12, confirm: '完成', type: 'text', focus: false, disabled: true },
      // { title: '使用条件', code: 'requirement', value: '', col: 12 }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      time: new Date().getTime() + 7 * 3600 * 24000
    })
  },
  inputConfirm(e) {
    const { item, idx } = e.currentTarget.dataset
    if (item.confirm == '完成') {
      this.createRedpacket()
    } else {
      this.setData({
        [`list[${idx}].focus`]: false,
        [`list[${idx + 1}].focus`]: true
      })
    }
  },
  inputValue(e) {
    const { idx } = e.currentTarget.dataset
    this.data.list[idx].value = e.detail.value
  },
  createRedpacket() {
    for (let i = 0; i < this.data.list.length; i++) {
      if (this.data.list[i].required && !this.data.list[i].value) {
        wx.showToast({
          title: `请填写${this.data.list[i].title}!`, icon: 'none'
        })
        return
      } else {
        continue;
      }
    }
    wx.showLoading()
    let params = { status: 1 }
    this.data.list.forEach(i => {
      i.value ? params[i.code] = i.value : ''
    })
    tss.post({
      // url: tss.recordURLs('tms_send_redpacket').CREATE,
      url: tss.url('ENTITY') + 'RedPacket',
      params,
      completion: res => {
        if (res.failed) {
          wx.showModal({
            content: res.errorMsg,
            showCancel: false
          })
          wx.hideLoading()
          return
        }
        wx.hideLoading()
        wx.navigateBack()
      }
    })
  },
  onReady() {
    lc.addListener('customerChooseInfo', this.__wxWebviewId__.toString(),
      res => {
        console.log(res)
      })
  },
  onUnload() {
    lc.removeListener('customerChooseInfo', this.__wxWebviewId__.toString())
  },
  inputClick(e) {
    const { item } = e.currentTarget.dataset
    if (item.code == 'deadline') {
      this.setData({
        pickerShow: true
      })
    }
    if (item.code == 'aim') {
      wx.navigateTo({ url: Pages.customer_list + '?from_page=params' })
    }
  },
  onConfirmDatePicker(e) {
    console.log(e)
    let idx = this.data.list.findIndex(i => i.code == 'deadline')
    this.setData({
      [`list[${idx}].value`]: e.detail.label,
      pickerShow: false
    })
  },
  onCancelDatePicker(e) {
    this.setData({
      pickerShow: false
    })
  }
})