import Pages from '../../../pages.js'
import user from '../../../utils/user.js'
const _App = getApp().globalData
const tss = require('../../../utils/tss.js')


Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconUrl: `${_App.aliyun_host}/wx_eff/icon.png`,
    form: {
      region: [],
      
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(_App)
    this.getModule()
    this.setData({
      "form.phone": _App.user.uName
    })
  },
  onReady() {

  },
  // 打开行政区划选择列表
  onOpen() {
    this.setData({
      visible: true
    })
  },
  // 关闭
  onClose() {
    this.setData({
      visible: false
    })
  },
  onChange(e) {
    console.log(e)
    this.setData({
      value_addr: e.detail.value,
      "form.region": e.detail.done && e.detail.options.map((n) => n.label)
    })
  },
  getAgreement() {
    wx.navigateTo({
      url: Pages.web + '?type=register'
    })
  },
  checkboxChange(e) {
    console.log(e)
    if (e.detail.value.length) {
      this.setData({ agree: true })
    }else{
      this.setData({ agree: false })
    }
  },
  inputValue({ detail, currentTarget}) {
    let { id } = currentTarget
    this.data.form[id] = detail.value
  },
  payFor(e) {
    let moduleInfo = this.data.moduleInfo
    let priceInfo = this.data.priceInfo
    if (this.data.form.company_name) {
      if (this.data.agree) {
        if (user.customer_id){
          this.data.form.customer_id = user.customer_id
        }
        if (user.logistics_id){
          this.data.form.logistics_id = user.logistics_id
        }
        this.doPay({ ...priceInfo, mchid: _App.mchid, params: JSON.stringify(this.data.form) })
      } else {
        wx.showToast({
          title: '请阅读并同意《注册协议》！',
          icon: 'none'
        })
      }
    } else {
      wx.showToast({
        title: '请填写公司名称',
        icon: 'none'
      })
    }
  },
  doPay(params) {
    wx.showLoading({ mask: true })
    tss.post({
      url: tss.url('') + '/cloud/order',
      params,
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.showModal({ content: res.errorMsg, showCancel: false })
          wx.hideLoading()
          return false
        }
        this.payMoney(res.data)
      }
    })
  },
  payMoney(result) {
    tss.post({
      url: tss.url('wxapi') + 'minipay',
      params: {
        body: 'EFF账户开通 - 开通费',
        out_trade_no: result.order_no,
        total_fee: result.money_cal * 100,
        // total_fee: 1,
        openid: _App.user.openid,
        appid: _App.app_id,
        mchid: _App.mchid
      },
      completion:res=>{
        if (res.failed) {
          wx.showModal({ content: `申请支付失败：${res.errorMsg}`, showCancel: false })
          wx.hideLoading()
          return
        }
        wx.hideLoading()
        if (res.data.code == 'success') {
          wx.requestPayment({
            ...res.data.data,
            success: res => {
              tss.post({
                url: tss.url('') + '/wxnotify2.in',
                params: {
                  afterPaySuccess: 'CloudService',
                  out_trade_no: result.order_no,
                  receipt_amount: result.money_cal
                },
                completion: res => {
                  if (res.failed) {
                    wx.showModal({ content: res.errorMsg, showCancel:false })
                    return
                  }
                  wx.showLoading({
                    mask:true,
                    complete:()=>{
                      wx.clearStorage()
                      _App.sourceShare = {}
                      wx.reLaunch({ url: Pages.login })
                    }
                  })
                }
              })
            },
            fail: res => {
              wx.showToast({
                title: '付款失败',
                icon: 'none'
              })
            }
          })
          return
        }
      }
    })
  },
  getModule(code = 'eff') {
    wx.showLoading()
    tss.query({
      url: tss.url('data') + 'xcx_module_def',
      params: {
        code: code
      },
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.showModal({
            title: '模块查询失败',
            content: res.errorMsg,
            showCancel: false
          })
          wx.hideLoading()
          return
        }
        this.data.moduleInfo = res.data[0]
        this.getOrderPrice()
      }
    })
  },
  getOrderPrice(module = this.data.moduleInfo) {
    tss.query({
      url: tss.url('') + '/cloud/order/price/query',
      params: {
        module_id: module.id,
        account_num: 1,
        month_num: 500,
        appid: _App.app_id,
        type: module.product_class
      },
      completion: res => {
        if (res.failed) {
          wx.showModal({
            title: '价格查询失败',
            content: res.errorMsg,
            showCancel: false
          })
          wx.hideLoading()
          return
        }
        wx.hideLoading()
        this.setData({
          priceInfo:res.data
        })
      }
    })
  }
})