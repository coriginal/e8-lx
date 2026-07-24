const _App = getApp().globalData
import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js')

Page({

  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    const message = JSON.parse(options.message)
    const title = options.title
    message.children = message.children
      .map(i => ({
        ...i,
        content: i.content.replace(/#\d+#/g, ''),
        order_id: i.content.match(/#\d+#/g).map(i => i.replace(/#/g, ''))
      }))
    this.setData({
      message,
      title
    })
    wx.setNavigationBarTitle({
      title
    })
  },
  readAllMessage() {
    const ids = this.data.message.children.map(i => i.id).join(',')
    this.postMessage(ids, () => {
      wx.showToast({
        title: '操作成功!'
      })
    })
  },
  postMessage(ids, fn) {
    tss.post({
      url: tss.url('') + `/auth/api/message/read/${ids}`,
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.showModal({
            showCancel: false, content: res.errorMsg
          })
          return
        }
        fn && fn()
      }
    })
  },
  // 订单问题跟进提醒
  goDetailPage(e) {
    const item = e.currentTarget.dataset.item
    const regCode = item.content.match(/【\d{6,12}】/g) || []
    const regId = item.order_id
    let code, id
    if (regId.length > 0) {
      code = regCode.join('').replace(/【|】/g, '')
      id = regId[0]
      wx.navigateTo({
        url: `${Pages.order_routes}?id=${id}&code=${code}`,
        success: res => {
          this.postMessage(item.id)
        }
      })
    }
  }
})