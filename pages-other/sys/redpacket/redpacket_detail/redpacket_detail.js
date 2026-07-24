const _App = getApp().globalData
import Pages from '../../../../pages.js'
const tss = require('../../../../utils/tss.js')
const lc = require('../../../../utils/listenerCenter.js')

Page({

  data: {
    data: []
  },

  onLoad: function (options) {
    console.log(options)
    this.data.redpacket_id = options.id
    this.getRedpackets(options.id)
  },
  getRedpackets(redPacketId) {
    tss.query({
      url: tss.url('') + '/tms/redpacket/detail',
      params: {
        redPacketId
      },
      completion: res => {
        this.setData({
          data: res.data
        })
        wx.setNavigationBarTitle({
          title: `已被领用：${res.data.length}`
        })
      }
    })
  },
  closeRedpacket() {
    tss.save({
      url: tss.recordURLs('tms_send_redpacket').UPDATE,
      params: {
        id: this.data.redpacket_id,
        status: 0
      },
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.showModal({
            content: res.errorMsg,
            showCancel: false
          })
          return
        }
        lc.emitEvent('refreshRedpacket')
        wx.navigateBack()
      }
    })
  }
})