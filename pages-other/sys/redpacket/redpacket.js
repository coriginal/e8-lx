const _App = getApp().globalData
import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js')

Page({
  data: {
    tabs: [
      {
        title: '已领取',
        code: 'using'
      },
      {
        title: '已使用',
        code: 'used',
      },
      {
        title: '已失效',
        code: 'dead'
      },
    ],
    tab_current: 'using',
    list: {
      "using": {
        params: {
          page: 1,
          rows: 10,
          filter: '可用'
        },
        data: {
          total: '',
          list: []
        }
      },
      "used": {
        params: {
          page: 1,
          rows: 10,
          filter: '已用'
        },
        data: {
          total: '',
          list: []
        }
      },
      "dead": {
        params: {
          page: 1,
          rows: 10,
          filter: '失效'
        },
        data: {
          total: '',
          list: []
        }
      },
    }
  },
  onLoad() {
    this.initPage()
    // this.createRedpacket()
  },

  initPage() {
    const list = Object.values(this.data.list)
      .map(i => this.getMyRedpacket(i.params))
    Promise.all(list).then(res => {
      let [using_list, used_list, dead_list] = res
      console.log(res)
      this.setData({
        "list.using": using_list,
        "list.used": used_list,
        "list.dead": dead_list
      })
      wx.hideLoading()
    })
      .catch(errorAlert)
  },
  useRedPacket(e) {
    const { item } = e.currentTarget.dataset
    if (this.data.tab_current == 'using') {
      wx.navigateTo({
        url: `${Pages.order_quote}?red_packet=${JSON.stringify(item)}`
      })
    }
  },
  // 获取红包列表
  getMyRedpacket(params) {
    return new Promise((resolve, reject) => {
      tss.query({
        // url: tss.url('data') + 'xcx_redpacket',
        url: tss.url('') + '/tms/redpacket/detail',
        params: {
          ...params
        },
        completion: res => res.failed ? reject(res) : resolve(res)
      })
    })
  },
  onChangeTabs({ detail }) {
    this.setData({
      tab_current: detail.key
    })
  },

  onReachBottom() {
    const _list = this.data.list
    const tab_current = this.data.tab_current
    if (_list[tab_current].data.rows.length == _list[tab_current].data.total) {
      wx.hideLoading()
      return
    }
    _list[tab_current].params.page += 1
    this.getMyRedpacket(_list[tab_current].params)
      .then(res => {
        console.log(res)
        let list = `list.${tab_current}.data.rows`
        wx.hideLoading()
        this.setData({
          [list]: [..._list[tab_current].data.rows, ...res.data.rows]
        })
      })
  },
  createRedpacket() {
    wx.navigateTo({
      url: Pages.redpacket_create
    })
  },
  copyOcode(e) {
    const { id } = e.currentTarget
    wx.setClipboardData({
      data: id
    })
  }
})


const errorAlert = (content) => {
  wx.hideLoading()
  wx.showModal({
    content,
    showCancel: false
  })
}