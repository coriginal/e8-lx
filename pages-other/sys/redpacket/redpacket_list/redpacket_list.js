const _App = getApp().globalData
import Pages from '../../../../pages.js'
const tss = require('../../../../utils/tss.js')
const lc = require('../../../../utils/listenerCenter.js')

Page({
  data: {
    visible: false,
    tabs: [
      {
        title: '已生成',
        code: 'using'
      },
      {
        title: '已失效',
        code: 'used',
      },
    ],
    tab_current: 'using',
    list: {
      "using": {
        params: {
          page: 1,
          rows: 10,
          active:1
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
          active: 0
        },
        data: {
          total: '',
          list: []
        }
      },
    }
  },
  onShow() {
    this.initPage()
  },

  initPage() {
    wx.showLoading()
    const list1 = this.getMyRedpacket(
      this.data.list['using'].params
    )
    const list2 = this.getMyRedpacket(
      this.data.list['used'].params
    )
    
    Promise.all([list1, list2]).then(res => {
      let [using_list, used_list] = res
      wx.hideLoading()
      this.setData({
        "list.using.data": res[0].data,
        "list.used.data": res[1].data
      })
      wx.hideLoading()
    })
      .catch(errorAlert)
  },

  // 获取红包列表
  getMyRedpacket(params) {
    return new Promise((resolve, reject) => {
      tss.query({
        // url: tss.recordURLs('tms_send_redpacket').QUERY,
        url: tss.url('ENTITY') + 'RedPacket',
        params: {
          ...params,
          // phone: _App.user.uName
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
  showPic(e) {
    wx.showLoading()
    const { item } = e.currentTarget.dataset
    item.bgUrl = `${_App.aliyun_host}/wx_account/scan_redpacket.png`
    // item.qrcode = `${_App.app_host}/tss/wx/api/acode2?appId=${_App.app_id}&uName=${_App.user.uName}&uToken=${_App.user.uToken}`
    item.qrcode = `${_App.app_host}/tss/wx/api/acode2?appId=${_App.app_id}&page=pages/redirect/redirect&onlyQparam=true&qparam=,,${_App.user.uName},,,,${item.id}`
    let painting = require('./draw.js').painting
    this.setData({
      painting: painting(item)
    })
  },
  eventGetImage(e) {
    console.log(e)
    const { tempFilePath, errMsg } = e.detail
    if (errMsg === 'canvasdrawer:ok') {
      this.data.lastFilePath = tempFilePath
      this.setData({
        imgUrl: tempFilePath,
        visible: true
      })
    } else if (errMsg == 'canvasdrawer:samme params') {
      this.setData({
        imgUrl: this.data.lastFilePath,
        visible: true
      })
    }
    wx.hideLoading()
  },
  onClosePop() {
    this.setData({ visible: false })
  },
  getRedpacketDetail(e) {
    const { id } = e.currentTarget
    wx.navigateTo({
      url: `${Pages.redpacket_detail}?id=${id}`,
    })
  },
  onReady() {
    lc.addListener('refreshRedpacket', this.__wxWebviewId__.toString(),
      res => {
        this.data.list.using.params.page = 1
        this.data.list.used.params.page = 1
        this.initPage()
      })
  },
  onUnload() {
    lc.removeListener('refreshRedpacket', this.__wxWebviewId__.toString())
  }
})


const errorAlert = (content) => {
  wx.hideLoading()
  wx.showModal({
    content,
    showCancel: false
  })
}