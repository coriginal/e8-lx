import Pages from '../../../pages.js'
import user from '../../../utils/user.js'
import { $wuxDialog } from '../../../components/index'
import { formatDate } from '../../../utils/util'
const _App = getApp().globalData
const tss = require('../../../utils/tss.js')
const lc = require('../../../utils/listenerCenter.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isChoosedAll: true,
    choosedLength: 0,
    // currentSeg: 2,
    months: [],
    tabs: [
      {
        title: '待审批',
        code: 'Approving_list'
      },
      {
        title: '已审批',
        code: 'Approved_list',
      },
    ],
    tab_current: 'Approving_list',
    list: {
      "Approved_list": {
        params: {
          work_order_filter: 'my_approved',
          addfee: true,
          page: 1,
          rows: 10
        },
        data: {
          total: '',
          list: []
        }
      },
      "Approving_list": {
        params: {
          work_order_filter: 'my_approving',
          addfee: true,
          page: 1,
          rows: 10
        },
        data: {
          total: '',
          list: []
        }
      },
    }
  },

  onLoad: function (options) {
    const thisMonth = new Date().getMonth() + 1
    const months = []
    if (thisMonth == 1) {
      months.push(thisMonth)
    } else if (thisMonth == 2) {
      months.push(thisMonth - 1)
      months.push(thisMonth)
    } else {
      months.push(thisMonth - 2)
      months.push(thisMonth - 1)
      months.push(thisMonth)
    }
    this.setData({
      months,
      currentSeg: months.length - 1
    })
    this.initData()
  },
  onChangeSeg(e) {
    this.setData({
      currentSeg: e.detail.key
    })
    this.initData()
  },
  onUnload() {
    lc.removeListener('auditing_task', this.__wxWebviewId__.toString())
  },
  onReady() {
    lc.addListener('auditing_task', this.__wxWebviewId__.toString(), res => {
      console.log(res)
      if (res.change) {
        this.initData()
      }
    })
  },

  initData() {
    this.data.list['Approving_list'].params.page = 1
    this.data.list['Approved_list'].params.page = 1
    const list1 = this.getOrderList(
      this.data.list['Approving_list'].params
    )
    const list2 = this.getOrderList(
      this.data.list['Approved_list'].params
    )
    Promise.all([list1, list2])
      .then(res => {
        let [Approving_list, Approved_list] = res
        Approving_list.rows = this.dealFee(res[0].rows)
        Approved_list.rows = this.dealFee(res[1].rows)
        this.setData({
          "list.Approved_list.data": Approved_list,
          "list.Approving_list.data": Approving_list,
          isChoosedAll: true,
          choosedLength: 0
        })
        wx.hideLoading()
      })
      .catch(errorAlert)
  },

  // 查询审批情况
  // 待审my_approving,已审my_approved,我提交my_submit
  // work_order_filter:'my_approving'
  getOrderList(params) {
    wx.showLoading({ mask: true })

    const year = new Date().getFullYear()
    const { months, currentSeg } = this.data
    const days = new Date(year, months[currentSeg], 0).getDate()
    params.date1 = `${year}-${months[currentSeg]}-1`
    params.date2 = `${year}-${months[currentSeg]}-${days}`

    return new Promise((resolve, reject) => {
      tss.query({
        url: tss.url('sql') + 'tms_trans_order',
        params,
        completion: res => res.failed ? reject(res.errorMsg) : resolve(res.data)
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
    this.getOrderList(_list[tab_current].params)
      .then(res => {
        let list = `list.${tab_current}.data.rows`
        wx.hideLoading()
        this.setData({
          [list]: [..._list[tab_current].data.rows, ...this.dealFee(res.rows)]
        })
      })
  },
  dealFee(data) {
    data.forEach(item => {
      const cost_reg = /^\d+$/
      const cost_approving_reg = /^\d+_approving/
      item._cost = 0
      item._cost_approving = 0
      for (let key in item) {
        if (cost_reg.test(key)) {
          item._cost += item[key]
        }
        if (cost_approving_reg.test(key)) {
          item._cost_approving += item[key]
        }
      }
    })
    return data
  },

  copyOrder(e) {
    wx.setClipboardData({
      data: e.currentTarget.id,
    })
  },
  goOrderDetail(e) {
    const { code, id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `${Pages.order_detail}?id=${id}&code=${code}`,
    })
  },
  goDetailApprove(e) {
    const id = e.currentTarget.id
    const code = e.currentTarget.dataset.code
    wx.navigateTo({
      url: `${Pages.auditing_fee_detail}?taskId=${id}&code=${code}`
    })
  },
  batchOptions() {
    this.setData({
      ifChoosedAll: true
    })
  },
  chooseAll() {
    let isChoosedAll = this.data.isChoosedAll
    if (this.data.tab_current === 'Approving_list') {
      this.data.list.Approving_list.data.rows.forEach(i => {
        i.checked = isChoosedAll ? true : false
      })
      this.setData({
        "list.Approving_list.data.rows": this.data.list.Approving_list.data.rows,
        choosedLength: isChoosedAll ? this.data.list.Approving_list.data.rows.length : 0,
        isChoosedAll: !isChoosedAll
      })
    }
  },
  checkboxChange(e) {
    // this.setData({
    //   task_ids: e.detail.value
    // })
    const chooses = e.detail.value
    this.data.list.Approving_list.data.rows.forEach(item => {
      chooses.includes(String(item.id)) ? item.checked = true : item.checked = false
    })
    this.setData({
      Approving_list: this.data.Approving_list,
      isChoosedAll: chooses.length == this.data.list.Approving_list.data.rows.length ? false : true,
      choosedLength: chooses.length
    })
  },
  chooseItem(e) {

  },
  batchAgree() {
    this.doRequest('agree')
  },
  batchDisAgree() {
    this.doRequest('disagree')
  },
  doRequest(type) {
    const ids = this.data.list.Approving_list.data.rows.filter(i => i.checked).map(i => i.id)
    wx.showLoading()
    if (ids.length > 0) {
      tss.post({
        url: tss.url('') + '/tms/fin/batch/' + type,
        params: {
          taskIds: ids.join(',')
        },
        completion: res => {
          console.log(res)
          wx.hideLoading()
          if (res.failed) {
            wx.showModal({
              content: res.errorMsg,
              showCancel: false
            })
            return
          }
          this.setData({
            rightDrawer: false
          })
          this.initData()
        }
      })
    } else {
      wx.showToast({
        title: '请选择一条数据', icon: 'none'
      })
    }
  },
  doBatch() {
    this.setData({
      rightDrawer: true
    })
  },
  closeDrawer() {
    this.setData({
      rightDrawer: false
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