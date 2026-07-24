const tss = require('../../utils/tss.js')
const _App = getApp().globalData
import user from '../../utils/user.js'

// 支付订单
const payForOrder = (params, fn) => {
  tss.post({
    url: tss.url('') + '/cloud/order',
    params,
    completion: result => {
      console.log(result)
      if (result.failed) {
        wx.showModal({
          content: result.errorMsg,
        })
        fn & fn('failed')
        wx.hideLoading()
        return false
      }
      if (params.pay_type == '余额') {
        // 转余额支付
        result.data.pay_type = params.pay_type
        couldServer(result.data, fn)
      } else {
        // 转微信支付
        payMoney(result.data, fn)
      }
    }
  })
}

const payMoney = (param, fn) => {
  user.__wxCode({
    completion:res=>{
      const jscode = res.code
      tss.post({
        url: tss.url('wxapi') + 'minipay',
        params: {
          body: `面单费用支付-${param.order_no}`,
          out_trade_no: param.order_no,
          total_fee: param.money_cal * 100,
          jscode,
          // total_fee: 10,
          openid: _App.user.openid,
          appid: _App.app_id,
          mchid: _App.mchid
        },
        completion: res => {
          if (res.failed) {
            wx.showModal({
              content: res.errorMsg,
            })
            fn & fn('failed')
            wx.hideLoading()
            return false
          }
          if (res.data.code == 'success') {
            wx.hideLoading()
            wx.requestPayment({
              ...res.data.data,
              success: res => {
                couldServer(param, fn)
              },
              fail: res => fn & fn('failed')
            })
            return
          } else {
            fn & fn('failed')
          }
        }
      })
    }
  })
}

const couldServer = (param, fn) => {
  tss.post({
    url: tss.url('') + '/wxnotify2.in',
    params: {
      afterPaySuccess: 'CloudService',
      out_trade_no: param.order_no,
      receipt_amount: param.money_cal,
      pay_type: param.pay_type
    },
    completion: res => {
      if (res.failed) {
        fn & fn('failed')
        return
      }
      fn & fn('success')
    }
  })
}

export {
  payForOrder
}