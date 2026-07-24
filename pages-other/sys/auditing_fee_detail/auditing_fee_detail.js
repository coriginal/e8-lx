import Pages from '../../../pages.js'
import user from '../../../utils/user.js'
import { formatDate } from '../../../utils/util'
const _App = getApp().globalData
const tss = require('../../../utils/tss.js')
const lc = require('../../../utils/listenerCenter.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // options.id = 15116
    // this.data.order_id = options.id
    this.setData(options)
    if (options.orderId) {
      this.getOrderFee(options.orderId)
    }
    if (options.taskId) {
      this.getTaskFee()
    }
    wx.setNavigationBarTitle({
      title: options.code||'',
    })
  },

  async getTaskFee(change) {
    let [{ data: allSubject }, { data: taskFlows }] = await Promise.all([this.getSubjects(), this.getTaskFlow()])
    const getLength = x => x.length - 1
    const getRoles = (x) => {
      console.log(x.workorder)
      const { finWorkOrderFlows: flows = [] } = x.workorder
      let _roles = []
      if (flows && flows.length > 0) {
        flows.forEach(item => {
          const roleIds = item.roleids.split(',')
          const rolesNames = roleIds.map(i => _App.roleList[i]).join(' ')
          _roles.push({ if_current_note: item.if_current_note, id: roleIds, role: rolesNames })
        })
        return _roles
      }
      return false
    }
    taskFlows = taskFlows
      .filter(i => i.workorder.type == 'cost' && i.status != '失效')
      .map(i => ({
        ...i.workorder,
        fee_name: allSubject.find(x => x.id === i.fee_id).name,
        roles: getRoles(i)
      }))
    console.log(allSubject, taskFlows)

    this.setData({
      income_list: [],
      cost_list: taskFlows
    })

    if (change) {
      lc.emitEvent('auditing_task', { change: true })
    }
  },
  getTaskFlow(taskId = this.data.taskId) {
    return new Promise(completion => {
      tss.query({
        url: `${tss.url('')}/tms/fin/task_flow?task_id=${taskId}`,
        completion
      })
    })
  },
  getSubjects(params) {
    return new Promise(completion => {
      tss.query({
        url: tss.url('') + '/tms/entity/ExpenseSubject',
        params,
        completion
      })
    })
  },


  async getOrderFee(id, change) {
    wx.showLoading({ title: '加载中...', mask: true })
    Promise.all([this.getFeeDetail(id), this.getFeeApprove(id)])
      .then(res => {
        // 费用详情  // 审批流
        const [detail, work] = res

        const getLength = data => data.length - 1
        const getRoles = (data) => {
          const { finWorkOrderFlows: flows = [] } = data
          console.log(flows)
          if (flows && flows.length > 0) {
            let _roles = []
            flows.forEach(item => {
              const roleIds = item.roleids.split(',')
              const rolesNames = roleIds.map(i => _App.roleList[i]).join(' ')
              _roles.push({ if_current_note: item.if_current_note, id: roleIds, role: rolesNames })
            })
            return _roles
          }
          return false
        }
        const group = (data, type) =>
          data
            .filter(i => i.type == type && i.status != '失效')
            .map(i => ({
              ...i,
              fee_name: detail.data.find(x => x.fee_id == i.fee_id).fee_name,
              roles: getRoles(i)
            }))
        wx.hideLoading()
        this.setData({
          income_list: group(work.data, 'income'),
          cost_list: group(work.data, 'cost'),
        })

        if (change) {
          lc.emitEvent('auditing_order', { change: true })
        }
      })
  },
  submit(e) {
    const { id: type } = e.detail.target
    const { checkbox } = e.detail.value
    console.log(type, checkbox)
    if (checkbox.length) {
      this.doBatchApprove(type, checkbox.join(','))
    } else {
      wx.showToast({ title: '请勾选一条数据', icon: 'none' })
    }
  },
  doBatchApprove(type, woIds, opinion) {
    tss.post({
      url: `${tss.url('')}/tms/fin/batch/${type}`,
      params: {
        woIds, opinion
      },
      completion: res => {
        if (res.failed) {
          wx.showModal({
            content: res.errorMsg
          })
          return
        }
        if (this.data.taskId) {
          this.getTaskFee(true)
        }
        if (this.data.orderId) {
          this.getOrderFee(this.data.orderId, true)
        }
      }
    })
  },

  checkAllBox(e) {
    const fn = (type, checked) => this.data[type].map(i => ({ ...i, checked }))
    if (e.detail.value.length) {
      this.setData({
        income_list: fn('income_list', true),
        cost_list: fn('cost_list', true)
      })
    } else {
      this.setData({
        income_list: fn('income_list', false),
        cost_list: fn('cost_list', false)
      })
    }
  },
  // 是否能够进行审批
  canDoApprove(list) {
    return list.map(i => ({
      ...i,

    }))
  },


  getFeeDetail(order_id) {
    return new Promise(completion => {
      tss.query({
        url: `${tss.url('sql')}query_order_flow?order_id=${order_id}`,
        completion
      })
    })
  },
  getFeeApprove(order_id) {
    return new Promise(completion => {
      tss.query({
        url: `${tss.url('')}/tms/fin/work_order?order_id=${order_id}`,
        completion
      })
    })
  }
})