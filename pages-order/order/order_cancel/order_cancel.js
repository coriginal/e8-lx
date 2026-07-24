
const tss = require('../../../utils/tss.js')
const lc = require('../../../utils/listenerCenter.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [
      // { content: '不喜欢/不想要' },
      // { content: '未按约定时间发货' },
      // { content: '物流无跟踪记录' },
      // { content: '改日派送' },
      // { content: '其他原因' },
    ],
    disabled:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.data.orderIds = options.orderId
    this.data.orderIdx = options.orderIdx
    this.getCancelReasons()
  },
  getCancelReasons(){
    tss.get({
      url:tss.recordURLs('tms_pulldown_option').QUERY,
      // url:tss.url('ENTITY') + 'PulldownOption',
      params: { type:'运单取消原因'},
      completion:res=>{
        if(res.failed){
          wx.showModal({
            content: res.errorMsg,showCancel:false
          })
          return
        }
        this.setData({
          list : res.data
        })
        console.log(res)
      }
    })
  },
  chooseList(e) {
    let { id: clickId } = e.currentTarget
    this.setData({ clickId })
  },
  cancelOrder() {
    wx.showLoading({ mask:true })
    this.setData({ disabled:true })
    let cancelreason = this.data.list[this.data.clickId].content, ids = this.data.orderIds
    tss.post({
      url: tss.url('') + '/tms/order/cancel',
      params: { ids, cancelreason },
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.showModal({
            content: res.errorMsg,
            showCancel: false
          })
          wx.hideLoading()
          this.setData({ disabled: false })
          return
        }
        lc.emitEvent('ChangeInfo', {
          cancleOrderIdx : this.data.orderIdx,
          orderId: this.data.orderIds
        })
        wx.hideLoading()
        wx.showModal({
          content: '订单取消成功！',
          showCancel: false,
          confirmText: '返回列表',
          success: res => {
            if (res.confirm) {
              wx.navigateBack()
            }
          }
        })
      }
    })
  }
})