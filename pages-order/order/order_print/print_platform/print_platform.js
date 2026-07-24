// pages-order/order/order_print/print_platform/print_platform.js
const lc = require('../../../../utils/listenerCenter.js')
const _App = getApp().globalData
import Pages from '../../../../pages.js'
const tss = require('../../../../utils/tss.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    platform: [{
        name: '百世快运(76*100)',
        code: 'baishiwuliu',
        fn: require('../platform_print_data/best.js')
      },
      {
        name: '安能物流(76*90)',
        code: 'annengwuliu',
        fn: require('../platform_print_data/ane.js')
      },
      {
        name: '韵达快运子面单(74*92)',
        code: 'yundakuaiyun',
        fn: require('../platform_print_data/yunda.js')
      }, {
        name: '【新】韵达快运子面单(74*92)',
        code: 'yundakuaiyun',
        fn: require('../platform_print_data/yunda74_92.js')
      },
      {
        name: '中通快运子面单(76*130)',
        code: 'zhongtongkuaiyun',
        fn: require('../platform_print_data/zto.js')
      },
      {
        name: '中通快运子面单(76*100)',
        code: 'zhongtongkuaiyun',
        fn: require('../platform_print_data/zto76_100.js')
      },
      {
        name: '壹米滴答子面单(76*105)',
        code: 'yimidida',
        fn: require('../platform_print_data/ymdd.js')
      },
      {
        name: '德邦快运子面单(76*130)',
        code: 'debangwuliu',
        fn: require('../platform_print_data/debangkuaiyun.js')
      },
      {
        name: '顺心捷达子面单(71*101)',
        code: 'sxjdfreight',
        fn: require('../platform_print_data/sxjd.js')
      }, {
        name: '跨越速运子面单(76*130)',
        code: 'kuayue',
        fn: require('../platform_print_data/kuayue.js')
      },
      {
        name: '顺丰速递(76*130)',
        code: 'sf',
        fn: require('../platform_print_data/sf.js')
      },
      {
        name: '京东快运',
        code: 'jingdongkuaiyun',
        fn: require('../platform_print_data/jd.js')
      },
      {
        name: '汇森速运',
        code: 'huisenky',
        fn: require('../platform_print_data/hssy.js')
      }, {
        name: '融辉物流',
        code: 'ronghuiwuliu',
        fn: require('../platform_print_data/rh.js')
      }, {
        name: '融辉物流',
        code: 'ronghuiwuliu',
        isReceipt: true,
        fn: require('../platform_receipt/rh.js')
      }
    ],
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    this.setData({
      printData: JSON.parse(options.json)
    })
    this.getOrders().then(res => {
      // console.log("返回数据：",res.data[0])
      // let i=JSON.parse(res.data[0].platform_info)

      // console.log(`${!i.route1}`)
      wx.hideLoading()
      let {
        platform
      } = this.data
      if (res.failed) {
        wx.showModal({
          content: res.errorMsg
        })
        return
      }
      if (options.isReceipt == 'true') {
        platform = platform.filter(item => item.isReceipt)
      }else{
        platform = platform.filter(item => !item.isReceipt)
      }
      platform = platform.filter(item => (res.data.map(i => {
        return i.platform_code
      })).includes(item.code))
      this.setData({
        list: res.data,
        platform
      })
    })
    // this.data.printData.ids = '111111'
  },
  chooseItem(e) {
    const {
      id
    } = e.currentTarget
    this.setData({
      choosed: id
    })
  },
  goPrint(e) {
    if (this.data.choosed) {
      const data = this.data.list
      console.log(data)
     
      let length = data.length;
      for (let i = 0; i < length; i++) {
        console.log(Boolean(data[i].real_lc_id))
        if (data[i].real_lc_id) {
          if (typeof data[i].platform_info === 'string') {
            data[i].platform_info = JSON.parse(data[i].platform_info)
          }
        } else {
          wx.showModal({
            content: `${data[i].code}尚未上传至平台,请先上传！`,
            confirmText: '上传',
            success: res => {
              if (res.confirm) {
                console.log('上传')
                wx.showLoading({
                  mask: true,
                  title: '上传中...'
                })
                this.upPlatform()
              }
            }
          })
          break
        }
      }
      const platform = this.data.platform[this.data.choosed].fn
      if (!platform) {
        wx.showToast({
          title: '暂无模版',
          icon: 'none'
        })
        return
      }
      const {
        printData
      } = platform
      console.log(printData)
      lc.emitEvent('platformPrintData', {
        data: [...printData(data)],
        type: 'platformPrintData'
      })
      wx.navigateBack()
    } else {
      wx.showToast({
        title: '请选择平台',
        icon: 'none'
      })
    }
  },
  // 上传到平台
  upPlatform() {
    tss.post({
      url: tss.url('') + '/tms/order/push2Logistices',
      params: {
        order_ids: this.data.printData.ids
      },
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.showModal({
            content: res.errorMsg
          })
          return
        }
        wx.hideLoading()
        wx.showModal({
          title: '操作成功',
          content: res.data,
          confirmText: '继续打印',
          cancelText: '取消上传',
          success: res => {
            if (res.confirm) {
              this.goPrint()
            }
          }
        })
      }
    })
  },
  getOrders() {
    return new Promise(completion => {
      wx.showLoading({
        mask: true
      })
      tss.query({
        url: tss.url('sql') + 'tms_order',
        params: {
          tms_order_id: this.data.printData.ids,
          addPlatformInfo: true
        },
        completion
      })
    })
  }
})