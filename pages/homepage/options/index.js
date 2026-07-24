
import Pages from '../../../pages.js'
const _App = getApp().globalData
const tss = require('../../../utils/tss.js');
import { formatDate } from '../../../utils/util'

Page({

  data: {
    msgList: [
      { id: 1, icon: 'noticefill', title: '系统消息', text: '收到系统功能更新一份，请点击查看！', date: '2019-7-30 10:10:10' },
      { id: 2, icon: 'noticefill', title: '系统消息', text: '收到系统功能更新一份，请点击查看！', date: '2019-7-30 10:10:10' },
      { id: 3, icon: 'presentfill', title: '活动消息', text: '鉴于您是优质客户，发货打6折！点击查看', date: '2019-7-30 10:10:10' },
      { id: 5, icon: 'presentfill', title: '活动消息', text: '盛夏活动多多，点击此处查看！', date: '2019-7-30 10:10:10' }
    ]
  },
  onShow() {
    this.getMyMessage()
  },
  getMyMessage() {
    tss.post({
      url: tss.url('') + '/auth/api/message/level2',
      completion: res => {
        let list = res.data.reduce((obj, item) => {
          if (!obj[item.title]) {
            obj[item.title] = {}
          }
          if (!obj[item.title].children) {
            obj[item.title].children = []
          }
          obj[item.title].icon = 'commentfill'
          obj[item.title].color = 'var(--orange)'
          obj[item.title].text = `您有新的【${item.title}】提醒！请查收。`
          obj[item.title].date = formatDate(new Date(), 'yyyy-MM-dd')
          obj[item.title].children.push(item||[])
          return obj
        }, {})
        this.setData({
          isNothing:JSON.stringify(list) == '{}',
          list
        })
      }
    })
  },


  readMessage(e) {
    console.log(e)
    const title = e.currentTarget.dataset.title
    const item = JSON.stringify(e.currentTarget.dataset.item)
    wx.navigateTo({
      url: `${Pages.messageInfo}?message=${item}&title=${title}`
    })
  }
})