import Pages from '../../../../pages.js'
import user from '../../../../utils/user.js'
import {
  $wuxDialog
} from '../../../../components/index'
import {
  formatDate
} from '../../../../utils/util'
const _App = getApp().globalData
const tss = require('../../../../utils/tss.js')

Page({

  data: {
    tab_current: 'Approved_list',
    list: {
      "Approved_list": {
        params: {
          page: 1,
          rows: 10,
          // days: 60,
          can_quote: true,
          // "status": "新建",
          date2: formatDate(new Date(), 'yyyy-M-d')
        },
        data: {
          total: '',
          list: []
        }
      }
    }
  },

  onShow: function (options) {
    console.log(options, _App)
    // this.initData()
    if (_App.user.roles.split(',').includes('司机')) {
      this.initData()
    } else {
      wx.showModal({
        title: '提示',
        content: '您当前不是司机,是否前去认证？',
        cancelText: '返回首页',
        success: res => {
          if (res.confirm) {
            wx.navigateTo({
              url: Pages.driver_cert,
            })
          } else {
            wx.redirectTo({
              url: Pages.redirect
            })
          }
        }
      })
    }
  },
  onReady() {

  },

  async initData() {
    this.data.list.Approved_list.params.page = 1
    try {
      const {
        data: Approved_list
      } = await this.getOrderList(
        this.data.list['Approved_list'].params
      )
      // Approved_list.rows = Approved_list.rows
      this.setData({
        "list.Approved_list.data": Approved_list
      })
      wx.hideLoading()
    } catch (error) {
      errorAlert(error)
    }
  },

  getOrderList(params) {
    wx.showLoading({
      mask: true
    })
    return new Promise(completion => {
      tss.query({
        url: tss.url('sql') + 'tms_trans_order',
        params,
        completion
      })
    })
  },
  onChangeTabs({
    detail
  }) {
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
    this.getOrderList(_list[tab_current].params)
      .then(res => {
        let list = `list.${tab_current}.data.rows`
        wx.hideLoading()
        this.setData({
          [list]: [..._list[tab_current].data.rows, ...res.data.rows]
        })
      })
  },

  copyOrder(e) {
    wx.setClipboardData({
      data: e.currentTarget.id,
    })
  },
  goOrderDetail(e) {
    const {
      code,
      id
    } = e.currentTarget.dataset
    wx.navigateTo({
      url: `${Pages.order_detail}?id=${id}&code=${code}`,
    })
  },
  goDetailApprove(e) {
    const id = e.currentTarget.id
    wx.navigateTo({
      url: `${Pages.grab_task}?taskId=${id}`
    })
  },
  onShareAppMessage(e) {
    const { id } = e.target
    const params = { taskId: id }
    const { domain } = _App.user
    return {
      title: '分享给您一条新的任务单,请点击查看',
      path: Pages.redirect + `?domain=${domain}&pid=81&params=${JSON.stringify(params)}`
    }
  }
})

const errorAlert = (content) => {
  wx.showModal({
    content,
    showCancel: false,
    complete: () => {
      wx.hideLoading()
    }
  })
}