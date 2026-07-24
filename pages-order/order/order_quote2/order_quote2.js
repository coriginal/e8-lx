const _App = getApp().globalData
import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js')

Page({

  data: {
    packList: ['纸箱', '木箱', '编织袋', '托盘', '木架', '纸/木', '桶', '裸装', '膜', '泡沫箱', '长纸筒', '塑料箱', '纸托', '圆纸筒', '纸袋', '铁架', '膜包纸箱', '布袋', '圆盘'],
    orderInfo: {
      'send': {
        info: ['发货地']
      },
      'receive': {
        info: ['省 / 市 / 区 / 县']
      }
    },
    time: new Date().getTime(),
  },
  onLoad(options) {
    const { companyInfo, ifHideCompany } = _App
    wx.setNavigationBarTitle({
      // title: _App.user.company
      title:(ifHideCompany && companyInfo.name)||''
    })

    this.setData({
      orderInfo: JSON.parse(options.data)
    })
    this.data.orderInfo = JSON.parse(options.data)
  },
  nextStep() {
    let infos = this.data.orderInfo
    const showToast = (title) => wx.showToast({ title, icon: 'none' })
    if (!infos.receive.obj.phone) {
      showToast('请输入收件号码！')
      return
    }
    if (!infos.receive.obj.phone) {
      showToast('请输入寄件号码！')
      return
    }
    wx.navigateTo({
      url: `${Pages.order_quote3}?data=${JSON.stringify(this.data.orderInfo)}`
    })
  },
  inputOrderInfo(e) {
    let key = e.currentTarget.id
    let type = e.currentTarget.dataset.id
    if (key == 'cargo') {
      let data = `orderInfo.cargoInfo.${key}`
      this.setData({
        [data]: e.detail.value
      })
    } else {
      let data = `orderInfo.${type}.obj.${key}`
      this.setData({
        [data]: e.detail.value
      })
    }
  },
  bigCarInput(e) {
    let data = `orderInfo.${key}`
    this.setData({
      [data]: e.detail.value
    })
  },
  choosePack(e) {
    const { id: idx } = e.currentTarget
    this.setData({
      "orderInfo.cargoInfo.pack": this.data.packList[idx],
      showPopup: false
    })
  },
  // 选择包装方式
  openChoosePack() {
    this.setData({
      showPopup: true
    })
  },
  onClosePopup() {
    this.setData({
      showPopup: false
    })
  },
  // 打开时间选择器
  showDatePicker(e) {
    this.setData({
      date_picker: true,
      choosed: e.currentTarget.id
    })
  },
  // 关闭时间选择器
  onVisibleChange() {
    this.setData({
      date_picker: false,
      choosed: ''
    })
  },
  // 确定日期时间
  onConfirm(e) {
    const data = `orderInfo.${this.data.choosed}`
    this.setData({
      time: e.detail.date,
      [data]: e.detail.label
    })
  },
})