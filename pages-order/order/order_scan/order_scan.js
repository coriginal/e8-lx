const _App = getApp().globalData
import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js')


Page({

  data: {

  },

  onLoad: function (options) {
    console.log(options)
    if(options._params){
      const params = JSON.parse(options._params)
      if(params.code){
        this.checkCode(params.code)
      }else{
        this.doScan()
      }
    }else if(options.code){
      this.checkCode(options.code)
    }else{
      this.doScan()
    }
  },
  doScan(){
    wx.scanCode({
      // onlyFromCamera: true,
      success: res => {
        console.log(res)
        // 匹配英文和字母
        wx.showLoading()
        if(/^[A-Za-z0-9]+$/g.test(res.result)){
          this.checkCode(res.result)
        }else{
          wx.hideLoading()
          wx.showModal({
            content: `【${res.result}】单号仅支持数字和英文！`,
            confirmText:'重新扫描',
            cancelText:'返回',
            success: res => {
              if (res.confirm) {
                this.doScan()
              }else{
                wx.navigateBack({
                  fail:()=>{
                    wx.reLaunch({
                      url: Pages.redirect,
                    })
                  }
                })
              }
            }
          })
        }
      },
      fail:res=>{
        console.log(res)
        wx.showModal({
          content: res.result?`当前[ ${res.result} ]暂不支持,请重新扫描`:'请扫描正确条码',
          confirmText:'重新扫描',
          cancelText:'返回',
          success: res => {
            if (res.confirm) {
              this.doScan()
            }else{
              wx.navigateBack({
                fail:()=>{
                  wx.reLaunch({
                    url: Pages.redirect,
                  })
                }
              })
            }
          }
        })
      }
    })
  },
  checkCode(code){
    // 先查询是否有轨迹
    console.log(code)
    tss.query({
      url: tss.url('data') + 'xcx_query_route',
      params:
      { // 正则匹配脏字符和空格
        code: code.replace(/[^\x00-\xff]|\s*/g, ''),
        page: 1,
        rows: 1
      },
      completion: res => {
        if(!res.failed && res.data.total >0){
          // 非客户待接单
          if(res.data.rows[0].status === '待接单' && !_App.user.isCustomer){
            wx.redirectTo({
              url: `${Pages.order_list}?code=${code}&query=true`
            })
            return 
          }
          wx.redirectTo({
            url: `${Pages.order_query_route}?code=${code}&query=true`
          })
        }else{
          tss.post({
            url: tss.url('') + '/tms/order/check/code_issue',
            params:{ code },
            completion:res=>{
            console.log("是否失败",res)
              if(res.failed){
                wx.hideLoading()
                this.goToOrder()
                return
              }
              let scanType = res.data.result ? 'code' : 'ccode'
              wx.hideLoading()
              wx.redirectTo({
                url: `${Pages.order}?scanType=${scanType}&scanCode=${code}`
              })
            }
          })
        }
      }
    })
  },
  goToOrder() {
    wx.redirectTo({
      url: Pages.order
    })
  }
})