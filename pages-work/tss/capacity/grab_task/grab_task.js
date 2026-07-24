const _APP = getApp().globalData
import Pages from '../../../../pages.js'
const tss = require('../../../../utils/tss.js')
const lc = require('../../../../utils/listenerCenter.js')
import { $wuxDialog } from '../../../../components/index'
import { formatDate } from '../../../../utils/util.js'

Page({

  data: {
    task: {},
    tabs: [
      {
        title: '运输单详情',
        code: 'task',
        count: 0
      },
      {
        title: '我的报价记录',
        code: 'my_quote',
        count: 0
      },
    ],
    tab_current: 'task',
  },

  onLoad: function (options) {
    if (_APP.user.roles.split(',').includes('司机')) {
      console.log(options)
      this.data.taskId = options.taskId

      if (options._params) {
        const { taskId } = JSON.parse(options._params || "{}")
        this.data.taskId = taskId
      }
      console.log(this.data.taskId)

      this.getTaskInfo()
    } else {
      wx.showModal({
        title: '提示',
        content: '您当前不是司机,是否前去认证？',
        cancelText: '返回首页',
        success: res => {
          if (res.confirm) {
            wx.redirectTo({
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

  onChangeTabs({ detail }) {
    this.setData({
      tab_current: detail.key
    })
  },

  getTaskInfo() {
    this.getTask()
      .then(res => {
        this.setData({
          task: res.data[0]
        })
        wx.setNavigationBarTitle({
          title: res.data[0].code || '',
        })
      })
    this.getSubOrder()
      .then(res => {
        this.setData({
          subOrders: res.data
        })
      })
    this.queryDriverQuote({ task_id: this.data.taskId, driver_phone: _APP.user.uName })
      .then(res => {
        const _sort = (a, b) => b.id - a.id
        this.setData({
          quoteList: res.data.sort(_sort),
          "tabs[1].count": res.data.length
        })
      })
  },
  queryDriverQuote(params) {
    return new Promise((resolve, reject) => {
      tss.query({
        url: tss.url('sql') + 'driver_quote',
        params,
        completion: res => res.failed ? reject(res) : resolve(res)
      })
    })
  },
  getSubOrder() {
    return new Promise((resolve, reject) => {
      tss.query({
        // url: tss.url('sql') + 'tms_sub_code',
        // params: {
        //   task_id: this.data.taskId
        // },
        url: tss.url('') + `/tms/task/${this.data.taskId}/subOrder2`,
        completion: res => res.failed ? reject(res) : resolve(res)
      })
    })
  },
  getTask() {
    return new Promise((resolve, reject) => {
      tss.query({
        url: tss.url('sql') + 'task',
        params: {
          task_id: this.data.taskId
        },
        completion: res => res.failed ? reject(res) : resolve(res)
      })
    })
  },
  goOrderDetail(e) {
    const { id, code } = e.currentTarget.dataset
    // wx.navigateTo({
    //   url: `${Pages.order_detail}?id=${id}&code=${code}`
    // })
  },
  submitQuote() {
    this.setData({
      showPop: true,
      focus: true
    })
  },
  onClosePopup() {
    this.setData({
      showPop: false
    })
  },
  inputQuote(e) {
    this.data[e.currentTarget.id] = e.detail.value
  },
  confirmBtn() {
    wx.showLoading({ mask: true })
    tss.post({
      url: tss.url('') + '/tms/task/save_quote',
      params: {
        task_id: this.data.taskId,
        price: this.data.quoteMoney || '',
        remark: this.data.quoteRemark
      },
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.hideLoading()
          wx.showModal({
            content: res.errorMsg,
            showCancel: false
          })
        } else {
          this.setData({
            showPop: false,
            quoteRemark: '',
            quoteMoney: ''
          })
          wx.hideLoading()
          wx.showModal({
            title: '成功!',
            content: '提交报价成功',
            cancelText: '返回',
            success: res => {
              if (res.confirm) {
                this.getTaskInfo()
              } else {
                wx.navigateBack()
              }
            }
          })
        }
      }
    })
  }
})